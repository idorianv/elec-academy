import Shell from "../_components/Shell";
import { postAction, replyAction } from "../actions";
import { requireActive } from "@/lib/guard";
import { listPosts } from "@/lib/store";
import { MODULES } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Communaute() {
  const { user, badge } = await requireActive();
  const posts = await listPosts();

  return (
    <Shell user={user} badge={badge}>
      <div className="page-head">
        <span className="eyebrow">Entre apprentis</span>
        <h1 className="h1">Communauté</h1>
        <p className="dim small" style={{ maxWidth: 580 }}>
          Une question qui te bloque sur chantier, une photo que tu ne comprends pas, un prix que tu n'oses pas
          annoncer. Pose-la ici — une erreur vue par dix personnes sert à dix personnes.
        </p>
      </div>

      <section className="card stack gap-12" style={{ marginBottom: 28 }}>
        <form action={postAction} className="stack gap-12">
          <div className="field">
            <label className="label" htmlFor="body">Ta question</label>
            <textarea
              id="body"
              name="body"
              className="textarea"
              placeholder="Client veut une borne de recharge 11 kW dans un garage à 28 m du tableau. Je pars sur du 5G6 ou du 5G10 ?"
              required
            />
          </div>
          <div className="row-between">
            <select name="moduleNumber" className="select" defaultValue="" style={{ maxWidth: 280 }}>
              <option value="">Sans rapport avec un module</option>
              {MODULES.map((m) => (
                <option key={m.n} value={m.n}>
                  Module {String(m.n).padStart(2, "0")} — {m.title}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit">Publier</button>
          </div>
        </form>
      </section>

      {posts.length === 0 ? (
        <div className="card empty">Personne n'a encore écrit. Lance le premier sujet.</div>
      ) : (
        <div className="stack gap-12">
          {posts.map((p) => (
            <article key={p.id} className="card stack gap-12">
              <div className="row-between">
                <div className="row gap-8">
                  <span className="h3">{p.prenom}</span>
                  <span className="tiny muted">
                    {new Date(p.createdAt).toLocaleDateString("fr-BE", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                {p.moduleNumber ? <span className="pill">Module {p.moduleNumber}</span> : null}
              </div>

              <p style={{ whiteSpace: "pre-wrap" }}>{p.body}</p>

              {p.replies?.length ? (
                <ul className="stack gap-12" style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                  {p.replies.map((r) => (
                    <li key={r.id} className="stack gap-4">
                      <span className="row gap-8">
                        <span className="h3" style={{ fontSize: 13.5 }}>{r.prenom}</span>
                        {r.role === "admin" ? <span className="pill pill-red">Emre</span> : null}
                        <span className="tiny muted">
                          {new Date(r.createdAt).toLocaleDateString("fr-BE", { day: "2-digit", month: "short" })}
                        </span>
                      </span>
                      <span className="small dim" style={{ whiteSpace: "pre-wrap" }}>{r.body}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <form action={replyAction} className="row gap-8" style={{ alignItems: "flex-end" }}>
                <input type="hidden" name="postId" value={p.id} />
                <input name="body" className="input" placeholder="Répondre" required />
                <button className="btn btn-sm" type="submit">Envoyer</button>
              </form>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
