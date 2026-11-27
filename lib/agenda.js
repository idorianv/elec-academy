// L'agenda travaille sur des dates écrites « 2026-11-27 » et des heures « 09:00 ».
// Pas de fuseau à gérer : ce qu'Emre écrit est ce qui s'affiche, heure de Bruxelles.

export const FUSEAU = "Europe/Brussels";

const JOURS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const JOURS_LONGS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export const enJours = () => JOURS;

const d = (s) => new Date(`${s}T00:00:00Z`);
const str = (date) => date.toISOString().slice(0, 10);

export const plusJours = (s, n) => str(new Date(d(s).getTime() + n * 86400000));
export const jourSemaine = (s) => (d(s).getUTCDay() + 6) % 7; // 0 = lundi
export const moisDe = (s) => s.slice(0, 7);
export const numJour = (s) => Number(s.slice(8, 10));

/** La date du jour à Bruxelles, « 2026-11-27 ». */
export function aujourdhui() {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: FUSEAU, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export function nomMois(mois) {
  const [a, m] = mois.split("-");
  return `${MOIS[Number(m) - 1]} ${a}`;
}

export function moisVoisin(mois, pas) {
  const [a, m] = mois.split("-").map(Number);
  const total = a * 12 + (m - 1) + pas;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

export function enLettres(date) {
  const j = JOURS_LONGS[jourSemaine(date)];
  const [a, m, jour] = date.split("-");
  return `${j} ${Number(jour)} ${MOIS[Number(m) - 1]} ${a}`;
}

/** Les 35 ou 42 cases d'un mois, lundi en premier. */
export function grille(mois) {
  const premier = `${mois}-01`;
  const debut = plusJours(premier, -jourSemaine(premier));
  const [a, m] = mois.split("-").map(Number);
  const dansLeMois = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const cases = Math.ceil((jourSemaine(premier) + dansLeMois) / 7) * 7;
  return Array.from({ length: cases }, (_, i) => plusJours(debut, i));
}

/**
 * Les séances d'un rendez-vous dans un intervalle.
 * Un rendez-vous hebdomadaire revient tous les 7 jours jusqu'à sa date de fin.
 */
export function seances(ev, du, au) {
  const out = [];
  if (ev.repete !== "hebdo") {
    if (ev.date >= du && ev.date <= au) out.push({ ...ev, date: ev.date });
    return out;
  }
  const fin = ev.finRepetition && ev.finRepetition < au ? ev.finRepetition : au;
  let date = ev.date;
  // On saute directement au début de l'intervalle pour ne pas boucler pour rien.
  if (date < du) {
    const ecart = Math.floor((Date.parse(`${du}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86400000);
    date = plusJours(date, Math.floor(ecart / 7) * 7);
    if (date < du) date = plusJours(date, 7);
  }
  let garde = 0;
  while (date <= fin && garde++ < 400) {
    out.push({ ...ev, date });
    date = plusJours(date, 7);
  }
  return out;
}

/** Toutes les séances d'un intervalle, rangées par date puis par heure. */
export function parJour(events, du, au) {
  const map = new Map();
  for (const ev of events) {
    for (const s of seances(ev, du, au)) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date).push(s);
    }
  }
  for (const liste of map.values()) liste.sort((a, b) => a.heure.localeCompare(b.heure));
  return map;
}

/** Les prochaines séances à partir d'aujourd'hui. */
export function aVenir(events, combien = 20) {
  const du = aujourdhui();
  const au = plusJours(du, 180);
  const out = [];
  for (const ev of events) out.push(...seances(ev, du, au));
  return out
    .sort((a, b) => a.date.localeCompare(b.date) || a.heure.localeCompare(b.heure))
    .slice(0, combien);
}

/** « aujourd'hui », « demain », « dans 3 jours ». */
export function dansCombien(date) {
  const j = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${aujourdhui()}T00:00:00Z`)) / 86400000);
  if (j <= 0) return "aujourd'hui";
  if (j === 1) return "demain";
  if (j < 7) return `dans ${j} jours`;
  if (j < 14) return "dans une semaine";
  return `dans ${Math.round(j / 7)} semaines`;
}

export function finHeure(heure, duree) {
  const [h, m] = heure.split(":").map(Number);
  const t = h * 60 + m + (Number(duree) || 60);
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
