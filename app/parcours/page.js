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
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="row-between" style={{ alignItems: "flex-start" }}>
          <div className="stack gap-4" style={{ minWidth: 0 }}>
            <span className="eyebrow">De apprenti à entrepreneur respecté</span>
            <h1 className="h1">Ta formation</h1>
            <p className="lead" style={{ maxWidth: 520 }}>
              11 modules, 4 étapes. On passe à la suite quand c'est acquis.
            </p>
          </div>
          {state.courant ? (
            <Link className="btn btn-primary" href={`/parcours/${state.courant.n}`}>
              Reprendre au module {state.courant.n}
            </Link>
          ) : null}
        </div>

        <div className="stack gap-8" style={{ marginTop: 18 }}>
          <div className="row-between">
            <span className="small dim num">
              <strong>{state.totalFaites}</strong> / {state.totalLecons} leçons terminées
            </span>
            <span className="small muted num">Il te reste {formatDuree(reste)}</span>
          </div>
          <div className="jauge"><span style={{ width: `${state.pct}%` }} /></div>
        </div>
      </div>

      <div className="stack gap-32">
        {PARTS.map((part) => {
          const rows = state.rows.filter((r) => r.part === part.id);
          return (
            <section key={part.id} className="stack gap-12">
              <div className="stack gap-4">
                <span className="eyebrow">Partie {part.index} · {part.tagline}</span>
                <h2 className="h2">{part.name}</h2>
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

  const contenu = (
    <>
      <div className="cours-cover">
        <span className="num">MODULE {String(m.n).padStart(2, "0")}</span>
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
