import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "../../_components/Shell";
import { toggleLessonAction } from "../../actions";
import { requireActive } from "@/lib/guard";
import { getProgress, listProofs, getVideos } from "@/lib/store";
import { buildState, formatDuree } from "@/lib/progress";
import { moduleByNumber, partOf, lessonId } from "@/lib/content";
import { parseVideo } from "@/lib/videos";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params, searchParams }) {
  const { n } = await params;
  const sp = await searchParams;
  const mod = moduleByNumber(n);
  if (!mod) notFound();

  const { user, badge } = await requireActive();
  const [progress, proofs, videos] = await Promise.all([getProgress(user.id), listProofs(), getVideos()]);
  const mine = proofs.filter((p) => p.userId === user.id);
  const state = buildState(progress.done, mine);
  const row = state.rows.find((r) => r.n === mod.n);
  if (!row.ouvert) redirect("/parcours");

  const part = partOf(mod);
  const index = sp?.l !== undefined ? Number(sp.l) : null;

  if (index !== null && mod.lessons[index]) {
    return (
      <Shell user={user} badge={badge}>
        <Lecon
          mod={mod}
          index={index}
          lesson={mod.lessons[index]}
          fait={state.done.has(lessonId(mod.n, index))}
          videos={videos}
        />
      </Shell>
    );
  }

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
          const video = parseVideo(videos[key]);
          return (
            <div key={key} className="lecon-ligne">
              <form action={toggleLessonAction}>
                <input type="hidden" name="key" value={key} />
                <button
                  className={`box ${fait ? "box-on" : ""}`}
                  type="submit"
                  aria-pressed={fait}
                  aria-label={fait ? "Marquer comme non vue" : "Marquer comme vue"}
                >
                  {fait ? "✓" : ""}
                </button>
              </form>

              <Link href={`/parcours/${mod.n}?l=${i}`} className="lecon-lien">
                <span className="row-between" style={{ gap: 10 }}>
                  <span className="h3" style={{ color: fait ? "var(--fg-muted)" : "var(--fg)" }}>{l.t}</span>
                  <span className="row" style={{ gap: 8, flex: "none" }}>
                    {video ? <span className="pill pill-red">Vidéo</span> : <span className="pill">Bientôt</span>}
                    <span className="tiny muted num">{formatDuree(l.min)}</span>
                  </span>
                </span>
                <span className="small muted">{l.d}</span>
              </Link>
            </div>
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

function Lecon({ mod, index, lesson, fait, videos }) {
  const key = lessonId(mod.n, index);
  const video = parseVideo(videos[key]);
  const precedent = index > 0 ? index - 1 : null;
  const suivant = index + 1 < mod.lessons.length ? index + 1 : null;

  return (
    <>
      <Link href={`/parcours/${mod.n}`} className="small muted" style={{ display: "inline-block", marginBottom: 20 }}>
        ← {mod.title}
      </Link>

      <div className="page-head">
        <div className="row">
          <span className="display" style={{ fontSize: 13 }}>
            Leçon {String(mod.n).padStart(2, "0")}.{index + 1}
          </span>
          <span className="tiny muted">· {formatDuree(lesson.min)}</span>
        </div>
        <h1 className="h1">{lesson.t}</h1>
        <p className="dim small" style={{ maxWidth: 620 }}>{lesson.d}</p>
      </div>

      {video ? (
        <div className="video-cadre">
          <iframe
            src={video.src}
            title={lesson.t}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className="card video-vide">
          <span className="eyebrow">Vidéo à venir</span>
          <p className="small muted" style={{ marginTop: 8, maxWidth: 420 }}>
            Cette leçon n'a pas encore été tournée. Tu peux déjà cocher ce que tu maîtrises et passer à la suite.
          </p>
        </div>
      )}

      <div className="row-between" style={{ marginTop: 24 }}>
        <form action={toggleLessonAction}>
          <input type="hidden" name="key" value={key} />
          <button className={`btn ${fait ? "btn-ghost" : "btn-primary"}`} type="submit">
            {fait ? "✓ Marquée comme vue" : "Marquer comme vue"}
          </button>
        </form>

        <div className="row" style={{ gap: 8 }}>
          {precedent !== null ? (
            <Link className="btn btn-ghost btn-sm" href={`/parcours/${mod.n}?l=${precedent}`}>← Précédente</Link>
          ) : null}
          {suivant !== null ? (
            <Link className="btn btn-ghost btn-sm" href={`/parcours/${mod.n}?l=${suivant}`}>Suivante →</Link>
          ) : null}
        </div>
      </div>
    </>
  );
}

function StatutPreuve({ statut }) {
  if (statut === "valide") return <span className="pill pill-green">Validé</span>;
  if (statut === "a_revoir") return <span className="pill pill-red">À revoir</span>;
  return <span className="pill pill-amber">En attente</span>;
}
