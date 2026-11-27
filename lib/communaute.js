// Les rubriques du fil. Les mots du métier, pas « Discussions » et « Général ».
export const RUBRIQUES = [
  { id: "info", label: "Informations", adminSeul: true },
  { id: "chantier", label: "Questions chantier" },
  { id: "prix", label: "Prix & clients" },
  { id: "victoire", label: "Victoires" },
];

export function rubrique(id) {
  return RUBRIQUES.find((r) => r.id === id) || RUBRIQUES[1];
}

/** Depuis quand, en mots courts : « il y a 3 j », « à l'instant ». */
export function depuis(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 31) return `il y a ${j} j`;
  const mo = Math.floor(j / 30);
  if (mo < 12) return `il y a ${mo} mois`;
  return `il y a ${Math.floor(mo / 12)} an${mo >= 24 ? "s" : ""}`;
}

/** La miniature d'un lien : image directe, ou vignette YouTube. */
export function miniature(lien) {
  const u = String(lien || "").trim();
  if (!u) return null;
  if (/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(u)) return { type: "image", src: u };
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: "video", src: `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`, href: u };
  if (/vimeo\.com\//i.test(u)) return { type: "video", src: null, href: u };
  return { type: "lien", src: null, href: u };
}

/** Le classement des 30 derniers jours : messages et réponses, rien d'inventé. */
export function classement(posts, jours = 30) {
  const depuisQuand = Date.now() - jours * 86400000;
  const pts = new Map();
  const ajoute = (nom, n) => pts.set(nom, (pts.get(nom) || 0) + n);
  for (const p of posts) {
    if (p.createdAt >= depuisQuand) ajoute(p.prenom, 3);
    for (const r of p.replies || []) if (r.createdAt >= depuisQuand) ajoute(r.prenom, 1);
  }
  return [...pts.entries()]
    .map(([prenom, points]) => ({ prenom, points }))
    .sort((a, b) => b.points - a.points || a.prenom.localeCompare(b.prenom))
    .slice(0, 5);
}
