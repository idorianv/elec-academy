import Link from "next/link";
import Shell from "../_components/Shell";
import { requireActive } from "@/lib/guard";
import { getProgress, listProofs, getVideos } from "@/lib/store";
import { buildState, minutesRestantes, formatDuree } from "@/lib/progress";
import { PARTS, lessonId } from "@/lib/content";
import { parseVideo } from "@/lib/videos";

export const dynamic = "force-dynamic";

export default async function Parcours() {
  const { user, badge } = await requireActive();
  const [progress, proofs, videos] = await Promise.all([getProgress(user.id), listProofs(), getVideos()]);
  const mine = proofs.filter((p) => p.userId === user.id);
  const state = buildState(progress.done, mine);
  const reste = minutesRestantes(state.rows, state.done);

  return (
    <Shell user={user} badge={badge}>
      <div className="row-between" style={{ marginBottom: 18, alignItems: "flex-end" }}>
        <div className="stack gap-4" style={{ minWidth: 0 }}>
          <h1 className="h1">Formation</h1>
          <span className="small muted num">
            {state.totalFaites} / {state.totalLecons} leçons · il te reste {formatDuree(reste)}
          </span>
        </div>
        {state.courant ? (
          <Link className="btn btn-sm" href={`/parcours/${state.courant.n}`}>
            Reprendre au module {state.courant.n}
          </Link>
        ) : null}
      </div>

      <div className="jauge" style={{ marginBottom: 26 }}><span style={{ width: `${state.pct}%` }} /></div>

      <div className="stack gap-32">
        {PARTS.map((part) => {
          const rows = state.rows.filter((r) => r.part === part.id);
          return (
            <section key={part.id} className="stack gap-12">
              <div className="stack gap-4">
                <h2 className="h2">Partie {part.index} — {part.name}</h2>
                <p className="small muted" style={{ maxWidth: 640 }}>{part.goal}</p>
              </div>

              <div className="grid grid-3">
                {rows.map((m) => <CarteModule key={m.n} m={m} videos={videos} />)}
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

function CarteModule({ m, videos }) {
  const videosPretes = m.lessons.filter((_, i) => parseVideo(videos[lessonId(m.n, i)])).length;
  const couverture = videos[`couverture.${m.n}`];

  const contenu = (
    <>
      <div className="cours-cover">
        {couverture ? <img src={couverture} alt="" loading="lazy" /> : null}
        <span className="num">Module {String(m.n).padStart(2, "0")}</span>
        {!m.ouvert ? <span className="voile" /> : null}
        <span className="titre">{m.title}</span>
        {!m.ouvert ? <span className="cadenas" aria-label="Verrouillé">🔒</span> : null}
      </div>
      <div className="cours-corps">
        <div className="cours-titre">
          <span className="h3">{String(m.n).padStart(2, "0")} — {m.title}</span>
          <Etat m={m} />
        </div>
        <p className="small muted" style={{ flex: 1 }}>{m.summary}</p>
        <div className="row" style={{ gap: 10 }}>
          <div className="jauge" style={{ flex: 1 }}><span style={{ width: `${m.ouvert ? m.pct : 0}%` }} /></div>
          <span className="jauge-txt num">{m.ouvert ? `${m.pct} %` : "—"}</span>
        </div>
        <span className="tiny muted">
          {m.lessons.length} leçon{m.lessons.length > 1 ? "s" : ""}
          {videosPretes ? ` · ${videosPretes} en vidéo` : " · vidéos à venir"}
        </span>
      </div>
    </>
  );

  if (!m.ouvert) return <div className="card cours verrouille">{contenu}</div>;
  return <Link className="card cours card-link" href={`/parcours/${m.n}`}>{contenu}</Link>;
}

function Etat({ m }) {
  if (m.complet) return <span className="pill pill-green">Validé</span>;
  if (m.enAttenteDeValidation) return <span className="pill pill-amber">Preuve attendue</span>;
  if (!m.ouvert) return <span className="pill">Verrouillé</span>;
  if (m.faites > 0) return <span className="pill pill-red">En cours</span>;
  return <span className="pill">À démarrer</span>;
}
