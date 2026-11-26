"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/parcours", label: "Parcours", short: "Parcours" },
  { href: "/chantiers", label: "Mes chantiers", short: "Chantiers" },
  { href: "/communaute", label: "Communauté", short: "Commu" },
  { href: "/outils", label: "Outils", short: "Outils" },
];

export default function Shell({ user, children, badge }) {
  const path = usePathname();
  const isOn = (href) => path === href || path.startsWith(href + "/");
  const links = user?.role === "admin" ? [...LINKS, { href: "/admin", label: "Administration", short: "Admin" }] : LINKS;

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/parcours" className="brand">
          <span className="brand-bar" aria-hidden="true" />
          <span>
            <span className="brand-name">Elec Academy</span>
            <span className="brand-sub">Par Emre · Emrelec</span>
          </span>
        </Link>

        <nav className="nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} data-active={isOn(l.href)}>
              <span>{l.label}</span>
              {l.href === "/admin" && badge > 0 ? <span className="pip" aria-label={`${badge} en attente`} /> : null}
            </Link>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="stack gap-4">
            <span className="h3">{user?.prenom}</span>
            <span className="tiny muted">{user?.role === "admin" ? "Administrateur" : "Apprenti"}</span>
          </div>
          <form action="/api/deconnexion" method="post">
            <button className="btn btn-ghost btn-sm btn-block" type="submit">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="main">
        <div className="topbar-mobile">
          <Link href="/parcours" className="brand">
            <span className="brand-bar" aria-hidden="true" />
            <span>
              <span className="brand-name">Elec Academy</span>
            </span>
          </Link>
          <span className="tiny muted">{user?.prenom}</span>
        </div>

        <main className="wrap">{children}</main>

        <nav className="tabbar">
          {links.slice(0, 5).map((l) => (
            <Link key={l.href} href={l.href} data-active={isOn(l.href)}>
              <span className="mark" aria-hidden="true" />
              <span>{l.short}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
