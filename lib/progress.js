import { MODULES, lessonId } from "./content";

/**
 * Déblocage par validation, jamais par date.
 * Un module s'ouvre quand le précédent est terminé ; les deux modules de contrôle
 * (2 et 7) demandent en plus une preuve de chantier validée par Emre.
 */
export function buildState(doneList, proofs = []) {
  const done = new Set(doneList || []);
  const validées = new Set(
    proofs.filter((p) => p.statut === "valide" && p.moduleNumber).map((p) => Number(p.moduleNumber))
  );

  const rows = [];
  let previousComplete = true;

  for (const mod of MODULES) {
    const total = mod.lessons.length;
    const faites = mod.lessons.filter((_, i) => done.has(lessonId(mod.n, i))).length;
    const leconsOk = faites === total;
    const preuveRequise = Boolean(mod.requiertPreuve);
    const preuveOk = !preuveRequise || validées.has(mod.n);
    const complet = leconsOk && preuveOk;

    rows.push({
      ...mod,
      total,
      faites,
      pct: total ? Math.round((faites / total) * 100) : 0,
      leconsOk,
      preuveRequise,
      preuveOk,
      complet,
      ouvert: previousComplete,
      enAttenteDeValidation: leconsOk && preuveRequise && !preuveOk,
    });

    previousComplete = complet;
  }

  const totalLecons = rows.reduce((s, r) => s + r.total, 0);
  const totalFaites = rows.reduce((s, r) => s + r.faites, 0);
  const courant = rows.find((r) => r.ouvert && !r.complet) || rows[rows.length - 1];

  return {
    rows,
    done,
    totalLecons,
    totalFaites,
    pct: totalLecons ? Math.round((totalFaites / totalLecons) * 100) : 0,
    courant,
  };
}

export function minutesRestantes(rows, done) {
  let m = 0;
  for (const r of rows) {
    r.lessons.forEach((l, i) => {
      if (!done.has(lessonId(r.n, i))) m += l.min || 0;
    });
  }
  return m;
}

export function formatDuree(min) {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const r = min % 60;
  if (!h) return `${r} min`;
  return r ? `${h} h ${String(r).padStart(2, "0")}` : `${h} h`;
}
