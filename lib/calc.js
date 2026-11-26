// Calculs métier — fonctions pures, testables.
// Toutes les valeurs sont INDICATIVES : le RGIE, les tables du fabricant
// et le mode de pose réel priment toujours. Voir l'avertissement dans l'UI.

// Résistivité en service (Ω·mm²/m), valeurs usuelles à température de service.
export const RHO = { cuivre: 0.023, alu: 0.037 };

export const SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95];

/**
 * Chute de tension d'une ligne.
 * Monophasé : ΔU = 2 · ρ · L · I / S
 * Triphasé  : ΔU = √3 · ρ · L · I / S
 * @returns {{ volts:number, percent:number }}
 */
export function chuteDeTension({ courant, longueur, section, tension, triphase, metal = "cuivre", cosPhi = 1 }) {
  const rho = RHO[metal] ?? RHO.cuivre;
  const k = triphase ? Math.sqrt(3) : 2;
  const volts = (k * rho * longueur * courant * cosPhi) / section;
  return { volts, percent: (volts / tension) * 100 };
}

/** Plus petite section normalisée qui tient sous la limite de chute de tension. */
export function sectionMiniParChute({ courant, longueur, tension, triphase, limitePct, metal = "cuivre", cosPhi = 1 }) {
  for (const section of SECTIONS) {
    const { percent } = chuteDeTension({ courant, longueur, section, tension, triphase, metal, cosPhi });
    if (percent <= limitePct) return { section, percent };
  }
  return { section: null, percent: null };
}

/**
 * Courant admissible indicatif pour du cuivre isolé PVC en pose domestique courante.
 * À confronter à la table du RGIE pour le mode de pose exact.
 */
export const IZ_INDICATIF = {
  1.5: 16,
  2.5: 20,
  4: 25,
  6: 32,
  10: 40,
  16: 63,
  25: 80,
  35: 100,
  50: 125,
  70: 160,
  95: 200,
};

/** Calibres de disjoncteur courants. */
export const CALIBRES = [2, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];

/**
 * Règle de protection : Ib ≤ In ≤ Iz.
 * @returns {{ calibre:number|null, iz:number, ok:boolean, raison:string }}
 */
export function calibreDisjoncteur({ courantEmploi, section }) {
  const iz = IZ_INDICATIF[section];
  if (!iz) return { calibre: null, iz: 0, ok: false, raison: "Section hors table." };
  if (courantEmploi > iz) {
    return {
      calibre: null,
      iz,
      ok: false,
      raison: `Le courant d'emploi (${courantEmploi} A) dépasse le courant admissible de cette section (${iz} A). Il faut une section supérieure.`,
    };
  }
  const candidats = CALIBRES.filter((c) => c >= courantEmploi && c <= iz);
  const calibre = candidats.length ? candidats[0] : null;
  return {
    calibre,
    iz,
    ok: calibre !== null,
    raison: calibre
      ? `Ib ${courantEmploi} A ≤ In ${calibre} A ≤ Iz ${iz} A.`
      : "Aucun calibre normalisé ne tient entre le courant d'emploi et le courant admissible.",
  };
}

/** Courant d'emploi à partir d'une puissance. */
export function courantDepuisPuissance({ puissance, tension, triphase, cosPhi = 1 }) {
  const k = triphase ? Math.sqrt(3) : 1;
  return puissance / (k * tension * cosPhi);
}

/** Puissance à partir d'un courant. */
export function puissanceDepuisCourant({ courant, tension, triphase, cosPhi = 1 }) {
  const k = triphase ? Math.sqrt(3) : 1;
  return k * tension * courant * cosPhi;
}

export function arrondi(n, d = 2) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
