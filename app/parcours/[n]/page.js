import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "../../_components/Shell";
import Coche from "../../_components/Coche";
import Vignette from "../../_components/Vignette";
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
  const duree = mod.lessons.reduce((s, l) => s + (l.min || 0), 0);

  return (
    <Shell user={user} badge={badge}>
      <Link href="/parcours" className="small muted" style={{ display: "inline-block", marginBottom: 18 }}>
        ← Toute la formation
      </Link>

      <div className="deux-col">
        <div className="stack gap-20">
          {index === null ? (
            <>
              <div className="mod-tete">
                <Vignette photo={videos[`couverture.${mod.n}`]} module={mod.n} titre={mod.title} />
                <div className="stack gap-6">
                  <span className="eyebrow num">Module {String(mod.n).padStart(2, "0")} · partie {part.index} · {formatDuree(duree)}</span>
                  <h1 className="h1" style={{ fontSize: 26 }}>{mod.title}</h1>
                  <p className="lead">{mod.summary}</p>
                </div>
              </div>

              <div className="card">
                {mod.lessons.map((l, i) => {
                  const key = lessonId(mod.n, i);
                  const fait = state.done.has(key);
                  const video = parseVideo(videos[key]);
                  return (
                    <div key={key} className="lecon">
                      <Coche lessonKey={key} fait={fait} titre={l.t} />
                      <Link href={`/parcours/${mod.n}?l=${i}`} className="lecon-lien">
                        <span className="lecon-tete">
                          <span className="h3">{String(i + 1).padStart(2, "0")}. {l.t}</span>
                          <span className="tiny muted num" style={{ flex: "none" }}>
                            {video ? formatDuree(l.min) : "pas encore filmée"}
                          </span>
                        </span>
                        <span className="small dim">{l.d}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="row-between">
                {mod.n > 1 ? (
                  <Link className="btn btn-sm" href={`/parcours/${mod.n - 1}`}>← Module {mod.n - 1}</Link>
                ) : <span />}
                {suivant ? (
                  suivant.ouvert ? (
                    <Link className="btn btn-sm btn-sombre" href={`/parcours/${mod.n + 1}`}>Module {mod.n + 1} →</Link>
                  ) : (
                    <span className="small muted">Le module {mod.n + 1} s'ouvre quand celui-ci est validé.</span>
                  )
                ) : null}
              </div>
            </>
          ) : (
            <Lecon
              mod={mod}
              index={index}
              lesson={mod.lessons[index]}
              videos={videos}
              fait={state.done.has(lessonId(mod.n, index))}
            />
          )}
        </div>

        <aside className="cote">
          <div className="card card-tight stack gap-12">
            <span className="eyebrow">Ta progression dans ce module</span>
            <div className="row-between" style={{ alignItems: "baseline" }}>
              <span className="num" style={{ fontSize: 26 }}>{row.faites} <span className="muted" style={{ fontSize: 15 }}>/ {row.total}</span></span>
              <span className="tiny muted num">{row.pct} %</span>
            </div>
            <div className="jauge"><span style={{ width: `${row.pct}%` }} /></div>
            <p className="tiny muted">Coche une leçon dès que tu la maîtrises, pas dès que tu l'as regardée.</p>
          </div>

          {mod.requiertPreuve ? (
            <div className="card card-tight stack gap-12">
              <div className="row-between" style={{ alignItems: "baseline" }}>
                <span className="eyebrow">Contrôle du module</span>
                {row.preuveOk ? <span className="pill pill-green">Validé</span> : <span className="pill">À fournir</span>}
              </div>
              <p className="small dim">{mod.requiertPreuve}</p>
              {preuves.length ? (
                <ul className="stack">
                  {preuves.map((p) => (
                    <li key={p.id} className="out" style={{ alignItems: "flex-start" }}>
                      <span className="small" style={{ minWidth: 0 }}>{p.titre}</span>
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

          <div className="card card-tight stack gap-8">
            <span className="eyebrow">Partie {part.index} — {part.name}</span>
            <p className="small dim">{part.goal}</p>
            <p className="tiny muted">Résultat visé : {part.result}</p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Lecon({ mod, index, lesson, videos, fait }) {
  const key = lessonId(mod.n, index);
  const video = parseVideo(videos[key]);
  const precedent = index > 0 ? index - 1 : null;
  const apres = index + 1 < mod.lessons.length ? index + 1 : null;

  return (
    <div className="stack gap-20">
      <div className="stack gap-6">
        <span className="eyebrow num">
          Module {String(mod.n).padStart(2, "0")} · leçon {index + 1} sur {mod.lessons.length} · {formatDuree(lesson.min)}
        </span>
        <h1 className="h1" style={{ fontSize: 26 }}>{lesson.t}</h1>
        <p className="lead" style={{ maxWidth: "52ch" }}>{lesson.d}</p>
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
        <div className="video-vide stack gap-6">
          <span className="h3">Pas encore filmée</span>
          <p className="small muted" style={{ maxWidth: "44ch" }}>
            Emre tourne les modules dans l'ordre. Tu peux déjà cocher ce que tu maîtrises et passer à la suite.
          </p>
        </div>
      )}

      <div className="card card-tight row-between">
        <span className="row" style={{ gap: 12 }}>
          <Coche lessonKey={key} fait={fait} titre={lesson.t} />
          <span className="small">{fait ? "Leçon maîtrisée" : "Coche quand tu la maîtrises"}</span>
        </span>
        {apres !== null ? (
          <Link className="btn btn-sm btn-sombre" href={`/parcours/${mod.n}?l=${apres}`}>Leçon suivante →</Link>
        ) : (
          <Link className="btn btn-sm" href={`/parcours/${mod.n}`}>Fin du module</Link>
        )}
      </div>

      <div className="row-between">
        <Link className="btn btn-sm btn-ghost" href={`/parcours/${mod.n}`}>← Toutes les leçons</Link>
        {precedent !== null ? (
          <Link className="btn btn-sm btn-ghost" href={`/parcours/${mod.n}?l=${precedent}`}>Leçon précédente</Link>
        ) : <span />}
      </div>
    </div>
  );
}

function StatutPreuve({ statut }) {
  if (statut === "valide") return <span className="pill pill-green">Validé</span>;
  if (statut === "a_revoir") return <span className="pill pill-red">À revoir</span>;
  return <span className="pill">En attente</span>;
}
