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
            <span className="brand-tile" aria-hidden="true">EA</span>
            <span>
              <span className="brand-name">Elec Academy</span>
              <span className="brand-sub">Par Emre · Emrelec</span>
            </span>
          </Link>

          <div className="row" style={{ gap: 10 }}>
            <span className="tiny muted" style={{ textAlign: "right", lineHeight: 1.25 }}>
              {user?.prenom}
              <br />
              {user?.role === "admin" ? "Administrateur" : "Apprenti"}
            </span>
            <span className="avatar" aria-hidden="true">{initiales}</span>
            <form action="/api/deconnexion" method="post">
              <button className="btn btn-sm" type="submit">Quitter</button>
            </form>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <div className="tabs-in">
          {liens.map((l) => (
            <Link key={l.href} href={l.href} data-active={actif(l.href)}>
              {l.label}
              {l.href === "/admin" && badge > 0 ? <span className="pip" aria-label={`${badge} en attente`} /> : null}
            </Link>
          ))}
        </div>
      </nav>

      <main className="wrap">{children}</main>
    </>
  );
}
