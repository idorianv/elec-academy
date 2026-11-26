/**
 * La vignette d'un module.
 * Avec une photo : la photo. Sans photo : un dessin au trait, un par module,
 * tiré de ce que le module raconte — pour que la carte tienne debout avant le tournage.
 */

const T = {
  stroke: "var(--dessin)",
  strokeWidth: 2.4,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
const R = { ...T, stroke: "var(--accent)" };

const vue = (enfants) => (
  <svg viewBox="0 0 220 124" aria-hidden="true">{enfants}</svg>
);

// 01 — Les fondations : la caisse à outils.
const Caisse = () => vue(<>
  <rect x="34" y="52" width="152" height="56" rx="8" {...T} />
  <path d="M86 52 v-10 a10 10 0 0 1 10 -10 h28 a10 10 0 0 1 10 10 v10" {...T} />
  <line x1="34" y1="74" x2="186" y2="74" {...T} />
  <rect x="98" y="64" width="24" height="10" rx="3" {...R} />
</>);

// 02 — Les installations : le tableau, un départ en rouge.
const Tableau = () => vue(<>
  <rect x="24" y="20" width="172" height="84" rx="8" {...T} />
  <line x1="24" y1="62" x2="196" y2="62" {...T} />
  {[0, 1, 2, 3, 4, 5].map((i) => (
    <rect key={`a${i}`} x={36 + i * 26} y={29} width={15} height={22} rx={3} {...T} />
  ))}
  {[0, 1, 2, 3, 4, 5].map((i) => (
    <rect key={`b${i}`} x={36 + i * 26} y={72} width={15} height={22} rx={3} {...(i === 2 ? R : T)} />
  ))}
</>);

// 03 — Les erreurs : le câble en vrac.
const Noeud = () => vue(<>
  <path d="M22 86 C 58 86, 58 38, 94 38 C 130 38, 130 86, 166 86" {...T} />
  <path d="M166 86 C 186 86, 192 70, 186 58" {...T} />
  <path d="M74 54 l20 20 M94 54 l-20 20" {...R} />
</>);

// 04 — La mentalité : la montre. Arriver à l'heure est un savoir-faire.
const Montre = () => vue(<>
  <circle cx="110" cy="62" r="34" {...T} />
  <path d="M94 28 l4 -12 h24 l4 12" {...T} />
  <path d="M94 96 l4 12 h24 l4 -12" {...T} />
  <line x1="110" y1="62" x2="110" y2="42" {...R} />
  <line x1="110" y1="62" x2="126" y2="68" {...T} />
</>);

// 05 — Communication : deux bulles.
const Bulles = () => vue(<>
  <path d="M30 24 h92 a8 8 0 0 1 8 8 v32 a8 8 0 0 1 -8 8 h-64 l-20 15 v-15 h-8 a8 8 0 0 1 -8 -8 v-32 a8 8 0 0 1 8 -8 z" {...T} />
  <path d="M106 52 h74 a8 8 0 0 1 8 8 v28 a8 8 0 0 1 -8 8 h-8 v14 l-18 -14 h-48 a8 8 0 0 1 -8 -8 v-28 a8 8 0 0 1 8 -8 z" {...R} />
</>);

// 06 — Passer indépendant : la première facture.
const Facture = () => vue(<>
  <path d="M58 16 h88 l18 18 v74 h-106 z" {...T} />
  <path d="M146 16 v18 h18" {...T} />
  <line x1="76" y1="48" x2="146" y2="48" {...T} />
  <line x1="76" y1="64" x2="146" y2="64" {...T} />
  <line x1="76" y1="80" x2="118" y2="80" {...T} />
  <line x1="110" y1="94" x2="146" y2="94" {...R} />
</>);

// 07 — Une vraie entreprise : la camionnette.
const Camionnette = () => vue(<>
  <path d="M24 84 V44 h96 v40" {...T} />
  <path d="M120 84 V56 h32 l22 28" {...T} />
  <line x1="24" y1="84" x2="196" y2="84" {...T} />
  <line x1="196" y1="84" x2="196" y2="70" {...T} />
  <circle cx="66" cy="92" r="11" {...T} />
  <circle cx="156" cy="92" r="11" {...T} />
  <line x1="38" y1="58" x2="92" y2="58" {...R} />
</>);

// 08 — Acquisition client : l'enseigne et le signal.
const Enseigne = () => vue(<>
  <rect x="48" y="26" width="92" height="52" rx="6" {...T} />
  <line x1="94" y1="78" x2="94" y2="106" {...T} />
  <line x1="74" y1="106" x2="114" y2="106" {...T} />
  <line x1="66" y1="44" x2="122" y2="44" {...T} />
  <line x1="66" y1="60" x2="104" y2="60" {...T} />
  <path d="M158 34 a34 34 0 0 1 0 48" {...R} />
  <path d="M174 22 a52 52 0 0 1 0 72" {...R} />
</>);

// 09 — Mentorat : Emre et toi.
const Deux = () => vue(<>
  <circle cx="82" cy="44" r="16" {...T} />
  <path d="M50 100 a32 32 0 0 1 64 0" {...T} />
  <circle cx="142" cy="50" r="13" {...R} />
  <path d="M116 100 a26 26 0 0 1 52 0" {...R} />
</>);

// 10 — Le terrain : l'échelle sur le chantier.
const Echelle = () => vue(<>
  <line x1="76" y1="108" x2="98" y2="16" {...T} />
  <line x1="124" y1="108" x2="146" y2="16" {...T} />
  <line x1="82" y1="84" x2="130" y2="84" {...T} />
  <line x1="88" y1="60" x2="136" y2="60" {...R} />
  <line x1="94" y1="36" x2="142" y2="36" {...T} />
</>);

// 11 — La communauté : le groupe.
const Groupe = () => vue(<>
  <circle cx="62" cy="48" r="13" {...T} />
  <path d="M36 98 a26 26 0 0 1 52 0" {...T} />
  <circle cx="110" cy="42" r="15" {...R} />
  <path d="M80 100 a30 30 0 0 1 60 0" {...R} />
  <circle cx="158" cy="48" r="13" {...T} />
  <path d="M132 98 a26 26 0 0 1 52 0" {...T} />
</>);

const PAR_MODULE = {
  1: Caisse, 2: Tableau, 3: Noeud, 4: Montre, 5: Bulles, 6: Facture,
  7: Camionnette, 8: Enseigne, 9: Deux, 10: Echelle, 11: Groupe,
};

export default function Vignette({ photo, module, titre }) {
  if (photo) {
    return <img className="vignette" src={photo} alt={titre ? `Couverture — ${titre}` : ""} loading="lazy" />;
  }
  const Dessin = PAR_MODULE[Number(module)] || Tableau;
  return (
    <div className="vignette vignette-dessin">
      <Dessin />
    </div>
  );
}
