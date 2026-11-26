"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/parcours", label: "Formation" },
  { href: "/chantiers", label: "Mes chantiers" },
  { href: "/communaute", label: "Communauté" },
  { href: "/outils", label: "Outils" },
];

export default function Shell({ user, children, badge }) {
  const path = usePathname();
  const actif = (href) => path === href || path.startsWith(href + "/");
  const liens = user?.role === "admin" ? [...LIENS, { href: "/admin", label: "Administration" }] : LIENS;
  const initiales = (user?.prenom || "?").slice(0, 2).toUpperCase();

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link href="/parcours" className="brand">
            <span className="brand-tile" aria-hidden="true" />
            <span className="brand-name">Elec Academy</span>
          </Link>

          <nav className="topnav" aria-label="Sections">
            {liens.map((l) => (
              <Link key={l.href} href={l.href} data-active={actif(l.href)}>
                {l.label}
                {l.href === "/admin" && badge > 0 ? (
                  <span className="pip num" aria-label={`${badge} chantiers à corriger`}>{badge}</span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="topright">
            <span className="avatar" aria-hidden="true">{initiales}</span>
            <form action="/api/deconnexion" method="post">
              <button className="btn btn-sm btn-ghost" type="submit">Quitter</button>
            </form>
          </div>
        </div>
      </header>

      <main className="wrap">{children}</main>
    </>
  );
}
