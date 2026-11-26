import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "../../_components/Shell";
import Coche from "../../_components/Coche";
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
  const index = sp?.l !== undefined && mod.lessons[Number(sp.l)] ? Number(sp.l) : null;
  const preuves = mine.filter((p) => Number(p.moduleNumber) === mod.n);
  const suivant = state.rows.find((r) => r.n === mod.n + 1);

  return (
    <Shell user={user} badge={badge}>
      <Link href="/parcours" className="small muted" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Toute la formation
      </Link>

      <div className="deux-col">
        <div className="stack gap-16">
          {index === null ? (
            <>
              <div className="stack gap-4">
                <span className="eyebrow">Module {String(mod.n).padStart(2, "0")} · Partie {part.index}</span>
                <h1 className="h1">{mod.title}</h1>
                <p className="lead" style={{ maxWidth: 620 }}>{mod.summary}</p>
              </div>

              <div className="card" style={{ padding: 0 }}>
                {mod.lessons.map((l, i) => {
                  const key = lessonId(mod.n, i);
                  const fait = state.done.has(key);
                  const video = parseVideo(videos[key]);
                  return (
                    <div key={key} className="lecon">
                      <Coche lessonKey={key} fait={fait} titre={l.t} />
                      <Link href={`/parcours/${mod.n}?l=${i}`} className="lecon-lien">
                        <span className="row-between" style={{ gap: 10 }}>
                          <span className="h3">{String(i + 1).padStart(2, "0")}. {l.t}</span>
                          <span className="row" style={{ gap: 8, flex: "none" }}>
                            {video ? <span className="pill pill-red">▶ Vidéo</span> : <span className="pill">Bientôt</span>}
                            <span className="tiny muted num">{formatDuree(l.min)}</span>
                          </span>
                        </span>
                        <span className="small muted">{l.d}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <Lecon mod={mod} index={index} lesson={mod.lessons[index]} videos={videos} />
          )}

          <div className="row-between">
            {mod.n > 1 ? (
              <Link className="btn btn-sm" href={`/parcours/${mod.n - 1}`}>← Module {mod.n - 1}</Link>
            ) : <span />}
            {suivant ? (
              suivant.ouvert || row.complet ? (
                <Link className="btn btn-sombre btn-sm" href={`/parcours/${mod.n + 1}`}>Module {mod.n + 1} →</Link>
              ) : (
                <span className="small muted">Le module {mod.n + 1} s'ouvre quand celui-ci est validé.</span>
              )
            ) : null}
          </div>
        </div>

        <aside className="cote">
          <div className="card stack gap-12">
            <span className="eyebrow">Ta progression</span>
            <div className="row-between">
              <span className="h2 num">{row.faites} / {row.total}</span>
              <span className="small muted num">{row.pct} %</span>
            </div>
            <div className="jauge"><span style={{ width: `${row.pct}%` }} /></div>
            <p className="tiny muted">Coche une leçon dès que tu la maîtrises, pas dès que tu l'as regardée.</p>
          </div>

          {mod.requiertPreuve ? (
            <div className="card stack gap-10">
              <div className="row-between">
                <span className="eyebrow">Contrôle du module</span>
                {row.preuveOk ? <span className="pill pill-green">Validé</span> : <span className="pill pill-amber">À fournir</span>}
              </div>
              <p className="small dim">{mod.requiertPreuve}</p>
              {preuves.length ? (
                <ul className="stack gap-6">
                  {preuves.map((p) => (
                    <li key={p.id} className="row-between">
                      <span className="small">{p.titre}</span>
                      <StatutPreuve statut={p.statut} />
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link className="btn btn-sm btn-block" href={`/chantiers?module=${mod.n}`}>
                Envoyer une preuve
              </Link>
            </div>
          ) : null}

          <div className="card stack gap-8">
            <span className="eyebrow">Dans ce module</span>
            <span className="small dim">{part.goal}</span>
            <span className="tiny muted">Résultat visé : {part.result}</span>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Lecon({ mod, index, lesson, videos }) {
  const key = lessonId(mod.n, index);
  const video = parseVideo(videos[key]);
  const precedent = index > 0 ? index - 1 : null;
  const apres = index + 1 < mod.lessons.length ? index + 1 : null;

  return (
    <div className="stack gap-16">
      <div className="stack gap-4">
        <span className="eyebrow">
          Leçon {String(mod.n).padStart(2, "0")}.{index + 1} · {formatDuree(lesson.min)}
        </span>
        <h1 className="h1">{lesson.t}</h1>
        <p className="lead" style={{ maxWidth: 640 }}>{lesson.d}</p>
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
        <div className="video-vide stack gap-8">
          <span className="eyebrow">Vidéo à venir</span>
          <p className="small muted" style={{ maxWidth: 400 }}>
            Cette leçon n'a pas encore été tournée. Tu peux déjà cocher ce que tu maîtrises et passer à la suite.
          </p>
        </div>
      )}

      <div className="row-between">
        <Link className="btn btn-sm" href={`/parcours/${mod.n}`}>← Toutes les leçons</Link>
        <div className="row" style={{ gap: 8 }}>
          {precedent !== null ? (
            <Link className="btn btn-sm" href={`/parcours/${mod.n}?l=${precedent}`}>Précédente</Link>
          ) : null}
          {apres !== null ? (
            <Link className="btn btn-sombre btn-sm" href={`/parcours/${mod.n}?l=${apres}`}>Suivante →</Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatutPreuve({ statut }) {
  if (statut === "valide") return <span className="pill pill-green">Validé</span>;
  if (statut === "a_revoir") return <span className="pill pill-red">À revoir</span>;
  return <span className="pill pill-amber">En attente</span>;
}
