import Link from "next/link";
import Shell from "../_components/Shell";
import { requireActive } from "@/lib/guard";
import { getProgress, listProofs } from "@/lib/store";
import { buildState, minutesRestantes, formatDuree } from "@/lib/progress";
import { PARTS } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Parcours() {
  const { user, badge } = await requireActive();
  const [progress, proofs] = await Promise.all([getProgress(user.id), listProofs()]);
  const mine = proofs.filter((p) => p.userId === user.id);
  const state = buildState(progress.done, mine);
  const reste = minutesRestantes(state.rows, state.done);

  return (
    <Shell user={user} badge={badge}>
      <div className="page-head">
        <span className="eyebrow">De apprenti à entrepreneur respecté</span>
        <h1 className="h1">Ton parcours</h1>
        <p className="dim small" style={{ maxWidth: 560 }}>
          11 modules, 4 étapes. On passe à la suite quand c'est acquis, pas au bout de sept jours.
        </p>
      </div>

      <div className="card stack gap-16" style={{ marginBottom: 32 }}>
        <div className="row-between">
          <div className="stack gap-4">
            <span className="eyebrow">Avancement</span>
            <span className="h2 num">
              {state.totalFaites} <span className="muted" style={{ fontWeight: 400 }}>/ {state.totalLecons} leçons</span>
            </span>
          </div>
          <div className="stack gap-4" style={{ textAlign: "right" }}>
            <span className="eyebrow">Il te reste</span>
            <span className="h2 num">{formatDuree(reste)}</span>
          </div>
        </div>
        <div className="bar"><span style={{ width: `${state.pct}%` }} /></div>
        <div className="row-between">
          <span className="tiny muted">{state.pct} % du parcours</span>
          {state.courant ? (
            <Link className="btn btn-primary btn-sm" href={`/parcours/${state.courant.n}`}>
              Reprendre au module {state.courant.n}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="stack gap-32">
        {PARTS.map((part) => {
          const rows = state.rows.filter((r) => r.part === part.id);
          return (
            <section key={part.id} className="stack gap-12">
              <div className="stack gap-4">
                <div className="row">
                  <span className="display" style={{ fontSize: 13 }}>Partie {part.index}</span>
                  <span className="tiny muted">· {part.tagline}</span>
                </div>
                <h2 className="h2">{part.name}</h2>
                <p className="small muted" style={{ maxWidth: 620 }}>{part.goal}</p>
              </div>

              <div className="stack gap-8">
                {rows.map((m) => (
                  <ModuleRow key={m.n} m={m} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

function ModuleRow({ m }) {
  const body = (
    <div className="stack gap-12">
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 12, minWidth: 0 }}>
          <span className={`modnum ${m.ouvert && !m.complet ? "modnum-on" : ""}`}>
            {String(m.n).padStart(2, "0")}
          </span>
          <div className="stack gap-4" style={{ minWidth: 0 }}>
            <span className="h3">{m.title}</span>
            <span className="small muted">{m.summary}</span>
          </div>
        </div>
        <Statut m={m} />
      </div>

      {m.ouvert ? (
        <div className="row" style={{ gap: 12 }}>
          <div className="bar" style={{ flex: 1 }}><span style={{ width: `${m.pct}%` }} /></div>
          <span className="tiny muted num" style={{ minWidth: 54, textAlign: "right" }}>
            {m.faites}/{m.total}
          </span>
        </div>
      ) : null}

      {m.enAttenteDeValidation ? (
        <p className="note note-warn">
          Leçons terminées. Il manque la preuve de chantier : {m.requiertPreuve}
        </p>
      ) : null}
    </div>
  );

  if (!m.ouvert) {
    return <div className="card card-tight" style={{ opacity: 0.45 }}>{body}</div>;
  }
  return (
    <Link className="card card-tight card-link" href={`/parcours/${m.n}`}>
      {body}
    </Link>
  );
}

function Statut({ m }) {
  if (m.complet) return <span className="pill pill-green">Validé</span>;
  if (m.enAttenteDeValidation) return <span className="pill pill-amber">Preuve attendue</span>;
  if (!m.ouvert) return <span className="pill">Verrouillé</span>;
  if (m.faites > 0) return <span className="pill pill-red">En cours</span>;
  return <span className="pill">À démarrer</span>;
}
