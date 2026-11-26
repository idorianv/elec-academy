import Link from "next/link";
import Shell from "../_components/Shell";
import Vignette from "../_components/Vignette";
import Tete from "../_components/Tete";
import { requireActive } from "@/lib/guard";
import { getProgress, listProofs, getVideos, listPosts, listUsers } from "@/lib/store";
import { buildState, minutesRestantes, formatDuree } from "@/lib/progress";
import { PARTS, lessonId } from "@/lib/content";
import { parseVideo } from "@/lib/videos";

export const dynamic = "force-dynamic";

/** La leçon à reprendre : la première non cochée du module ouvert en cours. */
function prochaine(state) {
  for (const m of state.rows) {
    if (!m.ouvert) break;
    const i = m.lessons.findIndex((_, k) => !state.done.has(lessonId(m.n, k)));
    if (i !== -1) return { mod: m, index: i, lesson: m.lessons[i] };
  }
  return null;
}

/** Le fait du jour : ce qui bloque, sinon ce qui reste. */
function faitDuJour(state, mesPreuves, suite) {
  const aRevoir = mesPreuves.find((p) => p.statut === "a_revoir");
  if (aRevoir) {
    return `Emre t'a renvoyé « ${aRevoir.titre} ». Corrige et renvoie la photo avant d'aller plus loin.`;
  }
  const m = state.courant;
  if (m && m.enAttenteDeValidation) {
    return `Le module ${m.n} attend ta photo de chantier. Tant qu'Emre ne l'a pas validée, le module ${m.n + 1} reste fermé.`;
  }
  if (suite) {
    const reste = m.total - m.faites;
    return `Il te reste ${reste} leçon${reste > 1 ? "s" : ""} dans le module ${m.n}, « ${m.title} ».`;
  }
  return "Tu as fini tout ce qui est ouvert. Emre ouvre la suite dès qu'il a validé tes chantiers.";
}

export default async function Parcours() {
  const { user, badge } = await requireActive();
  const [progress, proofs, videos, posts, users] = await Promise.all([
    getProgress(user.id), listProofs(), getVideos(), listPosts(), listUsers(),
  ]);
  const actifs = users.filter((u) => u.statut === "actif");
  const mine = proofs.filter((p) => p.userId === user.id);
  const state = buildState(progress.done, mine);
  const reste = minutesRestantes(state.rows, state.done);
  const suite = prochaine(state);
  const fait = faitDuJour(state, mine, suite);

  return (
    <Shell user={user} badge={badge}>
      <div className="g12" style={{ rowGap: 36 }}>
        <header className="c12 stack gap-16">
          <div className="stack gap-10">
            <h1 className="salut">Salut {user.prenom}.</h1>
            <p className="salut-fait">{fait}</p>
          </div>
          <div className="stack gap-8" style={{ maxWidth: 640 }}>
            <div className="jauge" role="img" aria-label={`${state.totalFaites} leçons faites sur ${state.totalLecons}`}>
              <span style={{ width: `${state.pct}%` }} />
            </div>
            <div className="piste-bouts">
              <span className="num">{state.totalFaites} / {state.totalLecons} leçons</span>
              <span className="num">{formatDuree(reste)} de vidéo restantes</span>
            </div>
          </div>
        </header>

        <section className="c8 card reprendre">
          {suite ? (
            <>
              <div className="reprendre-tete">
                <Vignette photo={videos[`couverture.${suite.mod.n}`]} module={suite.mod.n} titre={suite.mod.title} />
                <div className="stack gap-10">
                  <span className="ou num">
                    Module {String(suite.mod.n).padStart(2, "0")} · leçon {suite.index + 1} sur {suite.mod.lessons.length}
                  </span>
                  <h2 className="quoi">{suite.lesson.t}</h2>
                  <p className="dim small">{suite.lesson.d}</p>
                </div>
              </div>

              <div className="stack gap-6">
                <span className="tiny muted">Ce qui reste dans le module {suite.mod.n}</span>
                <ul className="reste-liste">
                  {suite.mod.lessons.map((l, i) => ({ l, i }))
                    .filter(({ i }) => !state.done.has(lessonId(suite.mod.n, i)))
                    .slice(0, 3)
                    .map(({ l, i }) => (
                      <li key={i} data-suivant={i === suite.index}>
                        <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                        <span className="titre">{l.t}</span>
                        <span className="tiny muted num">{formatDuree(l.min)}</span>
                      </li>
                    ))}
                </ul>
                {suite.mod.requiertPreuve ? (
                  <span className="tiny muted">Puis une photo de chantier à faire valider par Emre.</span>
                ) : null}
              </div>

              <div className="row reprendre-pied" style={{ gap: 14 }}>
                <Link className="btn btn-primary" href={`/parcours/${suite.mod.n}?l=${suite.index}`}>
                  Reprendre la leçon
                </Link>
                <span className="tiny muted num">
                  {formatDuree(suite.lesson.min)}
                  {parseVideo(videos[lessonId(suite.mod.n, suite.index)]) ? " · vidéo prête" : " · pas encore filmée"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="stack gap-10">
                <span className="ou">Rien à reprendre</span>
                <h2 className="quoi">Tout ce qui est ouvert est coché.</h2>
                <p className="dim small" style={{ maxWidth: "46ch" }}>
                  La suite s'ouvre quand Emre a validé tes chantiers.
                </p>
              </div>
              <Link className="btn" href="/chantiers">Voir mes chantiers</Link>
            </>
          )}
        </section>

        <div className="c4 stack gap-16">
          <section className="card card-tight stack gap-14" aria-labelledby="t-chantiers">
            <h2 className="h2" id="t-chantiers">Tes chantiers</h2>

            {mine.length === 0 ? (
              <p className="empty">Aucune photo envoyée. Les modules 2 et 7 en demandent une pour s'ouvrir.</p>
            ) : (
              <>
                <div className="mur">
                  {mine.slice(0, 3).map((p) => (
                    <article key={p.id} className="chantier">
                      <span className={`marque marque-${p.statut === "valide" ? "valide" : p.statut === "a_revoir" ? "revoir" : "attente"}`} aria-hidden="true" />
                      <span className="stack gap-4" style={{ minWidth: 0 }}>
                        <span className="small" style={{ fontWeight: 500 }}>{p.titre}</span>
                        <span className="tiny muted">
                          {p.statut === "valide" ? "Validé par Emre" : p.statut === "a_revoir" ? "À revoir" : "En attente de correction"}
                          {p.moduleNumber ? ` · module ${p.moduleNumber}` : ""}
                        </span>
                      </span>
                    </article>
                  ))}
                </div>
                <div className="mur-legende">
                  <span><i className="marque marque-valide" />Validé</span>
                  <span><i className="marque marque-attente" />En attente</span>
                  <span><i className="marque marque-revoir" />À revoir</span>
                </div>
              </>
            )}

            <Link className="btn btn-sm btn-block" href="/chantiers">Envoyer une photo</Link>
          </section>

          <section className="card card-tight stack gap-12" aria-labelledby="t-commu">
            <div className="row-between" style={{ alignItems: "center" }}>
              <h2 className="h2" id="t-commu">Dans la communauté</h2>
              {actifs.length ? (
                <span className="tete-pile" aria-label={`${actifs.length} apprentis`}>
                  {actifs.slice(0, 4).map((u) => <Tete key={u.id} nom={u.prenom} petite />)}
                </span>
              ) : null}
            </div>

            {posts.length === 0 ? (
              <p className="empty">Personne n'a encore posé de question. Tu peux être le premier.</p>
            ) : (
              <div className="fil">
                {posts.slice(0, 2).map((p) => (
                  <Link key={p.id} href="/communaute" className="fil-item">
                    <Tete nom={p.prenom} petite admin={p.prenom === "Emre"} />
                    <span className="stack gap-4" style={{ minWidth: 0 }}>
                      <span className="tiny muted">
                        {p.prenom}
                        {p.replies?.length ? ` · ${p.replies.length} réponse${p.replies.length > 1 ? "s" : ""}` : " · pas encore de réponse"}
                      </span>
                      <span className="corps">{p.body}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <Link className="btn btn-sm btn-block" href="/communaute">
              Ouvrir la communauté
            </Link>
          </section>
        </div>

        <div className="c12 stack gap-32">
          {PARTS.map((part) => {
            const rows = state.rows.filter((r) => r.part === part.id);
            const faites = rows.filter((r) => r.complet).length;
            return (
              <section key={part.id} className="stack gap-16">
                <div className="section-tete">
                  <div className="stack gap-4" style={{ minWidth: 0 }}>
                    <h2 className="h2">Partie {part.index} — {part.name}</h2>
                    <p className="small dim" style={{ maxWidth: "62ch" }}>{part.goal}</p>
                  </div>
                  <span className="tiny muted num" style={{ flex: "none" }}>{faites} / {rows.length} modules</span>
                </div>
                <div className={`grid ${rows.length === 2 ? "grid-2" : "grid-3"}`}>
                  {rows.map((m) => <CarteModule key={m.n} m={m} videos={videos} />)}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

function CarteModule({ m, videos }) {
  const videosPretes = m.lessons.filter((_, i) => parseVideo(videos[lessonId(m.n, i)])).length;
  const couverture = videos[`couverture.${m.n}`];
  const duree = m.lessons.reduce((s, l) => s + (l.min || 0), 0);

  const contenu = (
    <>
      <Vignette photo={couverture} module={m.n} titre={m.title} />
      <div className="cours-tete">
        <span className="cours-num">Module {String(m.n).padStart(2, "0")}</span>
        <Etat m={m} />
      </div>
      <h3 className="cours-titre">{m.title}</h3>
      <p className="cours-resume">{m.summary}</p>
      <div className="jauge jauge-neutre" aria-hidden="true">
        <span style={{ width: `${m.ouvert ? m.pct : 0}%` }} />
      </div>
      <div className="cours-pied">
        <span className="num">{m.faites} / {m.total} leçons</span>
        <span className="num">
          {videosPretes === m.total ? formatDuree(duree) : `${videosPretes} sur ${m.total} filmées`}
        </span>
      </div>
    </>
  );

  if (!m.ouvert) return <div className="card cours verrouille">{contenu}</div>;
  return <Link className="card cours card-link" href={`/parcours/${m.n}`}>{contenu}</Link>;
}

function Etat({ m }) {
  if (!m.ouvert) return <span className="pill">Verrouillé</span>;
  if (m.complet) return <span className="pill pill-green">Validé</span>;
  if (m.enAttenteDeValidation) return <span className="pill pill-red">Photo attendue</span>;
  if (m.faites > 0) return <span className="pill">En cours</span>;
  return <span className="pill">À démarrer</span>;
}
