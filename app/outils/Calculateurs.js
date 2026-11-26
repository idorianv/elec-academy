"use client";

import { useMemo, useState } from "react";
import {
  chuteDeTension,
  sectionMiniParChute,
  calibreDisjoncteur,
  courantDepuisPuissance,
  SECTIONS,
  IZ_INDICATIF,
  arrondi,
} from "@/lib/calc";

const ONGLETS = [
  { id: "chute", label: "Chute de tension" },
  { id: "section", label: "Section mini" },
  { id: "calibre", label: "Calibre" },
  { id: "puissance", label: "Puissance ↔ courant" },
];

export default function Calculateurs() {
  const [onglet, setOnglet] = useState("chute");

  return (
    <div className="stack gap-16">
      <div className="seg" role="tablist" style={{ overflowX: "auto", maxWidth: "100%" }}>
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={onglet === o.id}
            data-on={onglet === o.id}
            onClick={() => setOnglet(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "chute" ? <Chute /> : null}
      {onglet === "section" ? <SectionMini /> : null}
      {onglet === "calibre" ? <Calibre /> : null}
      {onglet === "puissance" ? <Puissance /> : null}

      <p className="note note-warn">
        Résultats indicatifs, pour dégrossir sur chantier. Le RGIE, le mode de pose réel, la température ambiante, le
        groupement des circuits et les tables du fabricant priment toujours. Rien ici ne remplace une vérification ni
        un organisme de contrôle.
      </p>
    </div>
  );
}

function Reseau({ triphase, setTriphase, tension, setTension }) {
  return (
    <div className="grid grid-2">
      <div className="field">
        <span className="label">Réseau</span>
        <div className="seg">
          <button type="button" data-on={!triphase} onClick={() => { setTriphase(false); setTension(230); }}>
            Monophasé
          </button>
          <button type="button" data-on={triphase} onClick={() => { setTriphase(true); setTension(400); }}>
            Triphasé
          </button>
        </div>
      </div>
      <Champ label="Tension (V)" value={tension} onChange={setTension} min={100} max={1000} />
    </div>
  );
}

function Champ({ label, value, onChange, min = 0, max = 100000, step = "any", suffix }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input
        className="input num"
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      />
      {suffix ? <span className="tiny muted">{suffix}</span> : null}
    </div>
  );
}

function Sortie({ label, value, ton }) {
  const color = ton === "bad" ? "var(--red)" : ton === "good" ? "var(--green)" : "var(--fg)";
  return (
    <div className="out">
      <span className="small muted">{label}</span>
      <span className="out-v" style={{ color }}>{value}</span>
    </div>
  );
}

function Chute() {
  const [triphase, setTriphase] = useState(false);
  const [tension, setTension] = useState(230);
  const [courant, setCourant] = useState(16);
  const [longueur, setLongueur] = useState(25);
  const [section, setSection] = useState(2.5);
  const [metal, setMetal] = useState("cuivre");
  const [limite, setLimite] = useState(5);

  const r = useMemo(() => {
    if (!courant || !longueur || !section || !tension) return null;
    return chuteDeTension({ courant, longueur, section, tension, triphase, metal });
  }, [courant, longueur, section, tension, triphase, metal]);

  const ok = r && r.percent <= limite;

  return (
    <div className="card stack gap-16">
      <Reseau triphase={triphase} setTriphase={setTriphase} tension={tension} setTension={setTension} />
      <div className="grid grid-2">
        <Champ label="Courant d'emploi (A)" value={courant} onChange={setCourant} />
        <Champ label="Longueur de câble (m)" value={longueur} onChange={setLongueur} />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label className="label">Section (mm²)</label>
          <select className="select num" value={section} onChange={(e) => setSection(Number(e.target.value))}>
            {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <span className="label">Conducteur</span>
          <div className="seg">
            <button type="button" data-on={metal === "cuivre"} onClick={() => setMetal("cuivre")}>Cuivre</button>
            <button type="button" data-on={metal === "alu"} onClick={() => setMetal("alu")}>Alu</button>
          </div>
        </div>
      </div>
      <div className="field">
        <label className="label">Limite retenue (%)</label>
        <div className="seg">
          {[3, 5, 8].map((v) => (
            <button key={v} type="button" data-on={limite === v} onClick={() => setLimite(v)}>{v} %</button>
          ))}
        </div>
      </div>

      {r ? (
        <div className="stack">
          <Sortie label="Chute de tension" value={`${arrondi(r.volts, 2)} V`} />
          <Sortie label="En pourcentage" value={`${arrondi(r.percent, 2)} %`} ton={ok ? "good" : "bad"} />
          <Sortie label="Tension au point d'utilisation" value={`${arrondi(tension - r.volts, 1)} V`} />
          <Sortie label="Verdict" value={ok ? `Sous la limite de ${limite} %` : `Au-dessus de ${limite} %`} ton={ok ? "good" : "bad"} />
        </div>
      ) : null}
    </div>
  );
}

function SectionMini() {
  const [triphase, setTriphase] = useState(false);
  const [tension, setTension] = useState(230);
  const [courant, setCourant] = useState(20);
  const [longueur, setLongueur] = useState(30);
  const [limite, setLimite] = useState(3);
  const [metal, setMetal] = useState("cuivre");

  const r = useMemo(() => {
    if (!courant || !longueur || !tension) return null;
    return sectionMiniParChute({ courant, longueur, tension, triphase, limitePct: limite, metal });
  }, [courant, longueur, tension, triphase, limite, metal]);

  const izOk = r?.section ? IZ_INDICATIF[r.section] >= courant : false;
  const sectionIz = SECTIONS.find((s) => IZ_INDICATIF[s] >= courant);
  const retenue = r?.section && sectionIz ? Math.max(r.section, sectionIz) : r?.section || sectionIz;

  return (
    <div className="card stack gap-16">
      <Reseau triphase={triphase} setTriphase={setTriphase} tension={tension} setTension={setTension} />
      <div className="grid grid-2">
        <Champ label="Courant d'emploi (A)" value={courant} onChange={setCourant} />
        <Champ label="Longueur de câble (m)" value={longueur} onChange={setLongueur} />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <span className="label">Limite de chute</span>
          <div className="seg">
            {[3, 5].map((v) => (
              <button key={v} type="button" data-on={limite === v} onClick={() => setLimite(v)}>{v} %</button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="label">Conducteur</span>
          <div className="seg">
            <button type="button" data-on={metal === "cuivre"} onClick={() => setMetal("cuivre")}>Cuivre</button>
            <button type="button" data-on={metal === "alu"} onClick={() => setMetal("alu")}>Alu</button>
          </div>
        </div>
      </div>

      <div className="stack">
        <Sortie label="Section imposée par la chute de tension" value={r?.section ? `${r.section} mm²` : "hors table"} />
        <Sortie label="Section imposée par le courant admissible" value={sectionIz ? `${sectionIz} mm²` : "hors table"} />
        <Sortie label="Section à retenir" value={retenue ? `${retenue} mm²` : "—"} ton={retenue ? "good" : "bad"} />
      </div>
      <p className="tiny muted">
        On garde la plus grande des deux : une section qui tient le courant peut quand même chuter trop sur une longue
        distance{izOk ? "" : ", et l'inverse arrive aussi"}.
      </p>
    </div>
  );
}

function Calibre() {
  const [courant, setCourant] = useState(18);
  const [section, setSection] = useState(2.5);
  const r = useMemo(() => calibreDisjoncteur({ courantEmploi: courant || 0, section }), [courant, section]);

  return (
    <div className="card stack gap-16">
      <div className="grid grid-2">
        <Champ label="Courant d'emploi Ib (A)" value={courant} onChange={setCourant} />
        <div className="field">
          <label className="label">Section du conducteur (mm²)</label>
          <select className="select num" value={section} onChange={(e) => setSection(Number(e.target.value))}>
            {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="stack">
        <Sortie label="Courant admissible Iz (indicatif)" value={`${r.iz} A`} />
        <Sortie label="Calibre In" value={r.calibre ? `${r.calibre} A` : "aucun"} ton={r.ok ? "good" : "bad"} />
      </div>
      <p className="small muted">{r.raison}</p>
      <p className="tiny muted">
        Règle appliquée : Ib ≤ In ≤ Iz. Les valeurs de Iz valent pour du cuivre isolé PVC en pose domestique courante —
        une pose en gaine encastrée, en faisceau ou en ambiance chaude les fait baisser.
      </p>
    </div>
  );
}

function Puissance() {
  const [triphase, setTriphase] = useState(false);
  const [tension, setTension] = useState(230);
  const [puissance, setPuissance] = useState(3680);
  const [cos, setCos] = useState(1);

  const i = useMemo(() => {
    if (!puissance || !tension || !cos) return null;
    return courantDepuisPuissance({ puissance, tension, triphase, cosPhi: cos });
  }, [puissance, tension, triphase, cos]);

  const sectionIz = i ? SECTIONS.find((s) => IZ_INDICATIF[s] >= i) : null;

  return (
    <div className="card stack gap-16">
      <Reseau triphase={triphase} setTriphase={setTriphase} tension={tension} setTension={setTension} />
      <div className="grid grid-2">
        <Champ label="Puissance (W)" value={puissance} onChange={setPuissance} />
        <Champ label="Cos φ" value={cos} onChange={setCos} min={0.1} max={1} step="0.05" suffix="1 pour du résistif (chauffe-eau, plaque)" />
      </div>

      <div className="stack">
        <Sortie label="Courant d'emploi" value={i ? `${arrondi(i, 2)} A` : "—"} />
        <Sortie label="Section minimale par le courant" value={sectionIz ? `${sectionIz} mm²` : "hors table"} />
      </div>
    </div>
  );
}
