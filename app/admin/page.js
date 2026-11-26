import Link from "next/link";
import Shell from "../_components/Shell";
import { reviewProofAction, statutAction, saveVideosAction } from "../actions";
import { requireAdmin } from "@/lib/guard";
import { listProofs, listUsers, getVideos, hasStore } from "@/lib/store";
import { MODULES, lessonId } from "@/lib/content";
import { parseVideo } from "@/lib/videos";
import { formatDuree } from "@/lib/progress";

export const dynamic = "force-dynamic";

const SITUATIONS = {
  apprenti: "Apprenti / alternance",
  stagiaire: "Stagiaire",
  etudiant: "En formation",
  salarie: "Salarié électricien",
  independant: "Déjà indépendant",
  reconversion: "Reconversion",
};

const jour = (ts) => new Date(ts).toLocaleDateString("fr-BE", { day: "2-digit", month: "long" });

export default async function Admin({ searchParams }) {
  const sp = await searchParams;
  const { user, badge } = await requireAdmin();
  const [proofs, users, videos] = await Promise.all([listProofs(), listUsers(), getVideos()]);

  const modEnCours = sp?.videos ? MODULES.find((m) => m.n === Number(sp.videos)) : null;
  if (modEnCours) {
    return (
      <Shell user={user} badge={badge}>
        <EditeurVideos mod={modEnCours} videos={videos} enregistre={Boolean(sp?.ok)} />
      </Shell>
    );
  }

  const enAttente = users.filter((u) => u.statut === "en_attente");
  const actifs = users.filter((u) => u.statut === "actif");
  const aCorriger = proofs.filter((p) => p.statut === "attente");
  const remplies = MODULES.reduce(
    (s, m) => s + m.lessons.filter((_, i) => parseVideo(videos[lessonId(m.n, i)])).length,
    0
  );
  const total = MODULES.reduce((s, m) => s + m.lessons.length, 0);

  const aFaire = enAttente.length + aCorriger.length;
  const constat = aFaire
    ? [
        aCorriger.length ? `${aCorriger.length} chantier${aCorriger.length > 1 ? "s" : ""} à corriger` : null,
        enAttente.length ? `${enAttente.length} demande${enAttente.length > 1 ? "s" : ""} d'inscription` : null,
      ].filter(Boolean).join(" et ") + " t'attendent."
    : "Rien n'attend de réponse. Il reste " + (total - remplies) + " leçons à filmer.";

  return (
    <Shell user={user} badge={badge}>
      <div className="stack gap-32">
        <header className="stack gap-6">
          <h1 className="h1">Administration</h1>
          <p className="lead" style={{ maxWidth: "56ch" }}>{constat}</p>
        </header>

        {!hasStore ? (
          <p className="note note-warn">
            Le stockage n'est pas branché : les données vivent en mémoire et disparaissent au prochain redémarrage.
          </p>
        ) : null}

        <div className="strip" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <Stat label="Chantiers à corriger" value={aCorriger.length} agir={aCorriger.length > 0} />
          <Stat label="Demandes à traiter" value={enAttente.length} agir={enAttente.length > 0} />
          <Stat label="Apprentis actifs" value={actifs.length} />
        </div>

        <section className="stack gap-16">
          <div className="section-tete">
            <h2 className="h2">Chantiers à corriger</h2>
            <span className="tiny muted num">{aCorriger.length}</span>
          </div>
          {aCorriger.length === 0 ? (
            <p className="empty">Rien à corriger. Tout est à jour.</p>
          ) : (
            <div className="stack gap-12">
              {aCorriger.map((p) => (
                <article key={p.id} className="card stack gap-16">
                  <div className="row-between" style={{ alignItems: "baseline" }}>
                    <div className="stack gap-4" style={{ minWidth: 0 }}>
                      <span className="h2">{p.titre}</span>
                      <span className="tiny muted">
                        {p.prenom} · {jour(p.createdAt)}{p.moduleNumber ? ` · module ${p.moduleNumber}` : ""}
                      </span>
                    </div>
                    <span className="pill">En attente</span>
                  </div>

                  {p.imageUrl ? (
                    <a href={p.imageUrl} target="_blank" rel="noreferrer" style={{ maxWidth: 320 }}>
                      <img className="thumb" src={p.imageUrl} alt={p.titre} loading="lazy" />
                    </a>
                  ) : null}
                  {p.contexte ? <p className="small dim" style={{ whiteSpace: "pre-wrap", maxWidth: "62ch" }}>{p.contexte}</p> : null}

                  <form action={reviewProofAction} className="stack gap-12">
                    <input type="hidden" name="id" value={p.id} />
                    <textarea
                      name="verdict"
                      className="textarea"
                      placeholder="Ce qui va, ce qui ne va pas, et ce qu'il refait."
                      style={{ minHeight: 76 }}
                    />
                    <div className="row" style={{ gap: 10 }}>
                      <button className="btn btn-sm btn-primary" type="submit" name="statut" value="valide">Valider</button>
                      <button className="btn btn-sm" type="submit" name="statut" value="a_revoir">À revoir</button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="stack gap-16">
          <div className="section-tete">
            <h2 className="h2">Demandes d'inscription</h2>
            <span className="tiny muted num">{enAttente.length}</span>
          </div>
          {enAttente.length === 0 ? (
            <p className="empty">Aucune demande en attente.</p>
          ) : (
            <div className="stack gap-12">
              {enAttente.map((u) => (
                <article key={u.id} className="card stack gap-16">
                  <div className="row-between" style={{ alignItems: "baseline" }}>
                    <div className="stack gap-4" style={{ minWidth: 0 }}>
                      <span className="h2">{u.prenom} {u.nom}</span>
                      <span className="tiny muted">
                        {SITUATIONS[u.situation] || u.situation || "Situation non précisée"} · {jour(u.createdAt)}
                      </span>
                      <span className="tiny muted">{[u.email, u.telephone].filter(Boolean).join(" · ") || "Pas de contact donné"}</span>
                    </div>
                    <span className="tiny muted num">code {u.code}</span>
                  </div>

                  {u.message ? <p className="small dim" style={{ whiteSpace: "pre-wrap", maxWidth: "62ch" }}>{u.message}</p> : null}

                  <div className="row" style={{ gap: 10 }}>
                    <form action={statutAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="statut" value="actif" />
                      <button className="btn btn-sm btn-primary" type="submit">Ouvrir l'accès</button>
                    </form>
                    <form action={statutAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="statut" value="refuse" />
                      <button className="btn btn-sm" type="submit">Refuser</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="stack gap-16">
          <div className="section-tete">
            <h2 className="h2">Vidéos des leçons</h2>
            <span className="tiny muted num">{remplies} / {total} remplies</span>
          </div>
          <div className="stack gap-8" style={{ maxWidth: 640 }}>
            <div className="jauge"><span style={{ width: `${total ? (remplies / total) * 100 : 0}%` }} /></div>
            <p className="tiny muted">
              Choisis un module, colle le lien Vimeo ou YouTube de chaque leçon, enregistre. La vidéo apparaît aussitôt
              pour les apprentis.
            </p>
          </div>
          <div className="card" style={{ padding: "4px 24px" }}>
            {MODULES.map((m) => {
              const faites = m.lessons.filter((_, i) => parseVideo(videos[lessonId(m.n, i)])).length;
              const complet = faites === m.lessons.length;
              return (
                <Link key={m.n} className="ligne-mod" href={`/admin?videos=${m.n}`}>
                  <span className="num modnum">{String(m.n).padStart(2, "0")}</span>
                  <span className="h3">{m.title}</span>
                  <span className={`tiny num ${complet ? "muted" : ""}`} style={{ color: complet ? undefined : "var(--text)" }}>
                    {faites} / {m.lessons.length}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="stack gap-16">
          <div className="section-tete">
            <h2 className="h2">Apprentis</h2>
            <span className="tiny muted num">{actifs.length}</span>
          </div>
          {actifs.length === 0 ? (
            <p className="empty">Aucun apprenti actif.</p>
          ) : (
            <div className="card" style={{ padding: "4px 24px" }}>
              {actifs.map((u) => (
                <div key={u.id} className="out">
                  <span className="stack gap-4">
                    <span className="h3">{u.prenom} {u.nom}</span>
                    <span className="tiny muted">{SITUATIONS[u.situation] || "—"}</span>
                  </span>
                  <span className="row" style={{ gap: 14 }}>
                    <span className="tiny muted num">{u.code}</span>
                    <form action={statutAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="statut" value="refuse" />
                      <button className="btn btn-sm btn-ghost" type="submit">Suspendre</button>
                    </form>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

function EditeurVideos({ mod, videos, enregistre }) {
  const couverture = videos[`couverture.${mod.n}`];
  return (
    <div className="stack gap-24">
      <Link href="/admin" className="small muted">← Administration</Link>

      <header className="stack gap-6">
        <span className="eyebrow num">Module {String(mod.n).padStart(2, "0")} · {mod.lessons.length} leçons</span>
        <h1 className="h1">{mod.title}</h1>
        <p className="lead" style={{ maxWidth: "56ch" }}>
          Colle l'adresse de la vidéo, celle de la barre du navigateur. Laisse vide pour retirer une vidéo.
        </p>
      </header>

      {enregistre ? <p className="note note-ok">Enregistré. Les apprentis voient les vidéos immédiatement.</p> : null}

      <form action={saveVideosAction} className="stack gap-12">
        <input type="hidden" name="retourModule" value={mod.n} />

        <div className="card stack gap-12">
          <div className="row-between" style={{ alignItems: "baseline" }}>
            <span className="h3">Image de couverture du module</span>
            {couverture ? <span className="pill pill-green">Image</span> : <span className="pill">Vide</span>}
          </div>
          <p className="tiny muted" style={{ maxWidth: "58ch" }}>
            Une vraie photo de chantier vaut mieux qu'un fond uni. Colle l'adresse d'une image en ligne.
          </p>
          <input
            className="input" type="url" name={`v_couverture.${mod.n}`}
            defaultValue={couverture || ""} placeholder="https://… .jpg" spellCheck="false" autoComplete="off"
          />
          {couverture ? <img className="thumb" src={couverture} alt="" style={{ maxWidth: 260 }} /> : null}
        </div>

        {mod.lessons.map((l, i) => {
          const key = lessonId(mod.n, i);
          const valeur = videos[key] || "";
          const parsed = parseVideo(valeur);
          return (
            <div key={key} className="card stack gap-12">
              <div className="row-between" style={{ alignItems: "baseline" }}>
                <span className="stack gap-4" style={{ minWidth: 0 }}>
                  <span className="h3">{String(i + 1).padStart(2, "0")} — {l.t}</span>
                  <span className="tiny muted num">{formatDuree(l.min)}</span>
                </span>
                {valeur ? (
                  parsed ? <span className="pill pill-green">{parsed.hote}</span> : <span className="pill pill-red">Lien non reconnu</span>
                ) : (
                  <span className="pill">Vide</span>
                )}
              </div>
              <input
                className="input" type="url" name={`v_${key}`} defaultValue={valeur}
                placeholder="https://vimeo.com/123456789" spellCheck="false" autoComplete="off"
              />
            </div>
          );
        })}

        <div className="row-between">
          <span className="tiny muted">Vimeo et YouTube acceptés.</span>
          <button className="btn btn-primary" type="submit">Enregistrer le module</button>
        </div>
      </form>
    </div>
  );
}

function Stat({ label, value, agir }) {
  return (
    <div className="stack gap-4">
      <span className="kpi-l">{label}</span>
      <span className="kpi-v" style={agir ? { color: "var(--accent-ink)" } : undefined}>{value}</span>
    </div>
  );
}
