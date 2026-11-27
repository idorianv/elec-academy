import Link from "next/link";
import Shell from "../_components/Shell";
import Tete from "../_components/Tete";
import Jaime from "../_components/Jaime";
import Vignette from "../_components/Vignette";
import { postAction, replyAction, epinglerAction } from "../actions";
import { requireActive } from "@/lib/guard";
import { listPosts, listUsers, listProofs, getVideos, listEvents } from "@/lib/store";
import { MODULES } from "@/lib/content";
import { RUBRIQUES, rubrique, depuis, miniature, classement } from "@/lib/communaute";
import { aVenir, dansCombien } from "@/lib/agenda";

export const dynamic = "force-dynamic";

export default async function Communaute({ searchParams }) {
  const sp = await searchParams;
  const { user, badge } = await requireActive();
  const [tous, users, proofs, videos, events] = await Promise.all([
    listPosts(), listUsers(), listProofs(), getVideos(), listEvents(),
  ]);
  const prochain = aVenir(events, 1)[0] || null;

  const filtre = RUBRIQUES.some((r) => r.id === sp?.r) ? sp.r : null;
  const posts = filtre ? tous.filter((p) => (p.rubrique || "chantier") === filtre) : tous;

  const actifs = users.filter((u) => u.statut === "actif");
  const valides = proofs.filter((p) => p.statut === "valide").length;
  const top = classement(tous);
  const couverture = videos["couverture.communaute"];

  return (
    <Shell user={user} badge={badge}>
      <div className="deux-col">
        <div className="stack gap-16">
          <h1 className="h1">Communauté</h1>
          <Composer user={user} />

          {prochain ? (
            <Link className="annonce" href="/calendrier">
              <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
                <rect x="3" y="4.5" width="14" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span><strong style={{ fontWeight: 500 }}>{prochain.titre}</strong> — {dansCombien(prochain.date)}, à {prochain.heure}</span>
            </Link>
          ) : null}

          <nav className="puces" aria-label="Rubriques">
            <Link href="/communaute" data-on={!filtre}>Tout</Link>
            {RUBRIQUES.map((r) => (
              <Link key={r.id} href={`/communaute?r=${r.id}`} data-on={filtre === r.id}>
                {r.label}
              </Link>
            ))}
          </nav>

          {posts.length === 0 ? (
            <p className="empty">
              {filtre ? "Rien dans cette rubrique pour l'instant." : "Personne n'a encore écrit. Lance le premier sujet."}
            </p>
          ) : (
            <div className="stack gap-12">
              {posts.map((p) => <Message key={p.id} p={p} user={user} />)}
            </div>
          )}
        </div>

        <aside className="cote">
          <section className="groupe">
            <div className="groupe-couv">
              {couverture ? (
                <img src={couverture} alt="" loading="lazy" />
              ) : (
                <Vignette module={11} titre="Elec Academy" />
              )}
            </div>
            <div className="stack gap-12" style={{ padding: "16px 18px 18px" }}>
              <div className="stack gap-4">
                <span className="h2">Elec Academy</span>
                <a className="tiny lien" href="https://emre-provolt.com" target="_blank" rel="noreferrer">
                  emre-provolt.com
                </a>
              </div>
              <p className="small dim">
                Le groupe privé des apprentis d'Emre. On y pose les questions qu'on n'ose pas poser sur chantier,
                et on y montre son travail.
              </p>

              <div className="groupe-chiffres">
                <div><span className="num">{actifs.length}</span><span className="tiny muted">Membres</span></div>
                <div><span className="num">{tous.length}</span><span className="tiny muted">Sujets</span></div>
                <div><span className="num">{valides}</span><span className="tiny muted">Chantiers validés</span></div>
              </div>

              {actifs.length ? (
                <span className="tete-pile">
                  {actifs.slice(0, 7).map((u) => <Tete key={u.id} nom={u.prenom} petite />)}
                </span>
              ) : null}

              <Link className="btn btn-sm btn-block" href="/parcours">Reprendre la formation</Link>
            </div>
          </section>

          {top.length ? (
            <section className="card card-tight stack gap-12">
              <div className="row-between" style={{ alignItems: "baseline" }}>
                <span className="h2">Les plus actifs</span>
                <span className="tiny muted">30 jours</span>
              </div>
              <ol className="rang">
                {top.map((t, i) => (
                  <li key={t.prenom}>
                    <span className="rang-n num" data-podium={i < 3}>{i + 1}</span>
                    <Tete nom={t.prenom} petite admin={t.prenom === "Emre"} />
                    <span className="small" style={{ flex: 1, minWidth: 0 }}>{t.prenom}</span>
                    <span className="tiny muted num">{t.points} pt{t.points > 1 ? "s" : ""}</span>
                  </li>
                ))}
              </ol>
              <p className="tiny muted">Un sujet vaut 3 points, une réponse 1.</p>
            </section>
          ) : null}
        </aside>
      </div>
    </Shell>
  );
}

function Composer({ user }) {
  const rubriques = RUBRIQUES.filter((r) => !r.adminSeul || user.role === "admin");
  return (
    <details className="composer">
      <summary>
        <Tete nom={user.prenom} admin={user.role === "admin"} />
        <span className="composer-invite">Écris quelque chose…</span>
      </summary>

      <form action={postAction} className="stack gap-12" style={{ padding: "0 16px 16px" }}>
        <input
          name="titre"
          className="input composer-titre"
          placeholder="Le titre de ton sujet"
          maxLength={120}
          autoComplete="off"
        />
        <textarea
          name="body"
          className="textarea"
          placeholder="Client veut une borne de recharge 11 kW dans un garage à 28 m du tableau. Je pars sur du 5G6 ou du 5G10 ?"
          required
        />
        <input
          name="lien"
          className="input"
          type="url"
          placeholder="Lien d'une photo ou d'une vidéo (facultatif)"
          autoComplete="off"
        />
        <div className="composer-pied">
          <select name="rubrique" className="select" defaultValue="chantier">
            {rubriques.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <select name="moduleNumber" className="select" defaultValue="">
            <option value="">Sans rapport avec un module</option>
            {MODULES.map((m) => (
              <option key={m.n} value={m.n}>Module {String(m.n).padStart(2, "0")} — {m.title}</option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit">Publier</button>
        </div>
      </form>
    </details>
  );
}

function Message({ p, user }) {
  const r = rubrique(p.rubrique);
  const likes = p.likes || [];
  const reponses = p.replies || [];
  const mini = miniature(p.lien);
  const titre = p.titre || p.body.split("\n")[0].slice(0, 90);
  const extrait = p.titre ? p.body : p.body.slice(titre.length).trim();
  const derniere = reponses[reponses.length - 1];
  const repondants = [...new Set(reponses.map((x) => x.prenom))].slice(0, 5);

  return (
    <article className="post" data-epingle={Boolean(p.epingle)}>
      <header className="post-tete">
        <Tete nom={p.prenom} admin={p.prenom === "Emre"} />
        <span className="stack gap-2" style={{ minWidth: 0 }}>
          <span className="post-qui">
            {p.prenom}
            {p.prenom === "Emre" ? <span className="post-role">Emre</span> : null}
          </span>
          <span className="tiny muted">
            {depuis(p.createdAt)} · {r.label}
            {p.moduleNumber ? ` · module ${p.moduleNumber}` : ""}
          </span>
        </span>
        {p.epingle ? <span className="pill">Épinglé</span> : null}
      </header>

      <div className="post-corps">
        <div className="stack gap-6" style={{ minWidth: 0 }}>
          <h3 className="post-titre">{titre}</h3>
          {extrait ? <p className="post-extrait">{extrait}</p> : null}
        </div>
        {mini ? (
          <a className="post-mini" href={mini.href || mini.src} target="_blank" rel="noreferrer">
            {mini.src ? <img src={mini.src} alt="" loading="lazy" /> : <span className="post-mini-vide" />}
            {mini.type === "video" ? <span className="post-play" aria-hidden="true" /> : null}
          </a>
        ) : null}
      </div>

      <footer className="post-pied">
        <Jaime postId={p.id} aime={likes.includes(user.id)} total={likes.length} />
        <span className="post-compte">
          <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
            <path d="M3.5 5.5h13v9h-7l-4 3v-3h-2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span className="num">{reponses.length}</span>
        </span>
        {repondants.length ? (
          <span className="tete-pile">{repondants.map((n) => <Tete key={n} nom={n} petite admin={n === "Emre"} />)}</span>
        ) : null}
        <span className="tiny muted" style={{ marginLeft: "auto" }}>
          {derniere ? `Dernière réponse ${depuis(derniere.createdAt)}` : "Pas encore de réponse"}
        </span>
      </footer>

      <details className="post-fil">
        <summary>{reponses.length ? `Voir les ${reponses.length} réponses` : "Répondre"}</summary>

        {reponses.length ? (
          <ul className="stack gap-14" style={{ marginTop: 14 }}>
            {reponses.map((x) => (
              <li key={x.id} className="reponse">
                <Tete nom={x.prenom} petite admin={x.role === "admin"} />
                <span className="stack gap-3" style={{ minWidth: 0 }}>
                  <span className="tiny">
                    <strong style={{ fontWeight: 500 }}>{x.prenom}</strong>
                    {x.role === "admin" ? <span className="post-role">Emre</span> : null}
                    <span className="muted"> · {depuis(x.createdAt)}</span>
                  </span>
                  <span className="small dim" style={{ whiteSpace: "pre-wrap" }}>{x.body}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <form action={replyAction} className="row gap-8" style={{ marginTop: 14 }}>
          <input type="hidden" name="postId" value={p.id} />
          <input name="body" className="input" placeholder="Écris ta réponse" required />
          <button className="btn btn-sm" type="submit">Envoyer</button>
        </form>

        {user.role === "admin" ? (
          <form action={epinglerAction} style={{ marginTop: 10 }}>
            <input type="hidden" name="postId" value={p.id} />
            <input type="hidden" name="epingle" value={p.epingle ? "0" : "1"} />
            <button className="btn btn-sm btn-ghost" type="submit">
              {p.epingle ? "Ne plus épingler" : "Épingler en haut du fil"}
            </button>
          </form>
        ) : null}
      </details>
    </article>
  );
}
