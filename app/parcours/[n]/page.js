import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "../../_components/Shell";
import { toggleLessonAction } from "../../actions";
import { requireActive } from "@/lib/guard";
import { getProgress, listProofs } from "@/lib/store";
import { buildState, formatDuree } from "@/lib/progress";
import { moduleByNumber, partOf, lessonId } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }) {
  const { n } = await params;
  const mod = moduleByNumber(n);
  if (!mod) notFound();

  const { user, badge } = await requireActive();
  const [progress, proofs] = await Promise.all([getProgress(user.id), listProofs()]);
  const mine = proofs.filter((p) => p.userId === user.id);
  const state = buildState(progress.done, mine);
  const row = state.rows.find((r) => r.n === mod.n);
  if (!row.ouvert) redirect("/parcours");

  const part = partOf(mod);
  const preuves = mine.filter((p) => Number(p.moduleNumber) === mod.n);
  const suivant = state.rows.find((r) => r.n === mod.n + 1);

  return (
    <Shell user={user} badge={badge}>
      <Link href="/parcours" className="small muted" style={{ display: "inline-block", marginBottom: 20 }}>
        ← Parcours
      </Link>

      <div className="page-head">
        <div className="row">
          <span className="display" style={{ fontSize: 13 }}>Module {String(mod.n).padStart(2, "0")}</span>
          <span className="tiny muted">· Partie {part.index}, {part.name.toLowerCase()}</span>
        </div>
        <h1 className="h1">{mod.title}</h1>
        <p className="dim small" style={{ maxWidth: 580 }}>{mod.summary}</p>
      </div>

      <div className="card stack gap-12" style={{ marginBottom: 24 }}>
        <div className="row-between">
          <span className="small dim">{row.faites} leçon{row.faites > 1 ? "s" : ""} sur {row.total}</span>
          <span className="small muted num">{row.pct} %</span>
        </div>
        <div className="bar"><span style={{ width: `${row.pct}%` }} /></div>
      </div>

      <section className="stack gap-4" style={{ marginBottom: 32 }}>
        {mod.lessons.map((l, i) => {
          const key = lessonId(mod.n, i);
          const fait = state.done.has(key);
          return (
            <form key={key} action={toggleLessonAction}>
              <input type="hidden" name="key" value={key} />
              <button className="check" type="submit" aria-pressed={fait}>
                <span className={`box ${fait ? "box-on" : ""}`} aria-hidden="true">{fait ? "✓" : ""}</span>
                <span className="stack gap-4" style={{ flex: 1, minWidth: 0 }}>
                  <span className="row-between" style={{ gap: 10 }}>
                    <span className="h3" style={{ color: fait ? "var(--fg-muted)" : "var(--fg)" }}>{l.t}</span>
                    <span className="tiny muted num" style={{ flex: "none" }}>{formatDuree(l.min)}</span>
                  </span>
                  <span className="small muted">{l.d}</span>
                </span>
              </button>
            </form>
          );
        })}
      </section>

      {mod.requiertPreuve ? (
        <section className="card stack gap-12" style={{ marginBottom: 24 }}>
          <div className="row-between">
            <span className="eyebrow">Contrôle de ce module</span>
            {row.preuveOk ? <span className="pill pill-green">Validé</span> : <span className="pill pill-amber">À fournir</span>}
          </div>
          <p className="small dim">{mod.requiertPreuve}</p>
          {preuves.length ? (
            <ul className="stack gap-8">
              {preuves.map((p) => (
                <li key={p.id} className="row-between">
                  <span className="small">{p.titre}</span>
                  <StatutPreuve statut={p.statut} />
                </li>
              ))}
            </ul>
          ) : null}
          <Link className="btn btn-ghost btn-sm" href={`/chantiers?module=${mod.n}`}>
            Envoyer une preuve de chantier
          </Link>
        </section>
      ) : null}

      <div className="row-between">
        {mod.n > 1 ? (
          <Link className="btn btn-ghost btn-sm" href={`/parcours/${mod.n - 1}`}>← Module {mod.n - 1}</Link>
        ) : <span />}
        {suivant ? (
          suivant.ouvert || row.complet ? (
            <Link className="btn btn-primary btn-sm" href={`/parcours/${mod.n + 1}`}>Module {mod.n + 1} →</Link>
          ) : (
            <span className="small muted">Le module {mod.n + 1} s'ouvre quand celui-ci est validé.</span>
          )
        ) : null}
      </div>
    </Shell>
  );
}

function StatutPreuve({ statut }) {
  if (statut === "valide") return <span className="pill pill-green">Validé</span>;
  if (statut === "a_revoir") return <span className="pill pill-red">À revoir</span>;
  return <span className="pill pill-amber">En attente</span>;
}
