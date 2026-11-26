/**
 * L'initiale de quelqu'un, dans sa teinte à lui, toujours la même.
 * C'est de l'identité, pas une donnée : la teinte reste pâle et ne sert jamais de légende.
 */

const TEINTES = [
  { bg: "#f3e7df", ink: "#6b3a1e" },
  { bg: "#e4ece4", ink: "#2f5438" },
  { bg: "#e6e9f2", ink: "#2f4172" },
  { bg: "#f2e8ee", ink: "#6d3354" },
  { bg: "#efece0", ink: "#55501f" },
  { bg: "#e4eeee", ink: "#28504f" },
];

export function teinteDe(nom) {
  const s = String(nom || "?");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return TEINTES[h % TEINTES.length];
}

export default function Tete({ nom, petite, admin }) {
  const t = teinteDe(nom);
  const ini = String(nom || "?").trim().slice(0, 2).toUpperCase();
  const style = admin
    ? { background: "var(--text)", color: "var(--ground)" }
    : { background: t.bg, color: t.ink };
  return (
    <span className={`tete ${petite ? "tete-sm" : ""}`} style={style} title={nom} aria-hidden="true">
      {ini}
    </span>
  );
}
