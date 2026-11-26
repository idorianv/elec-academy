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

  return (
    <Shell user={user} badge={badge}>
      <div className="page-head">
        <span className="eyebrow">Administration</span>
        <h1 className="h1">Ce qui t'attend</h1>
      </div>

      {!hasStore ? (
        <p className="note note-warn" style={{ marginBottom: 24 }}>
          Le stockage n'est pas branché : les données vivent en mémoire et disparaissent au prochain redémarrage.
        </p>
      ) : null}

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        <Stat label="Demandes à traiter" value={enAttente.length} on={enAttente.length > 0} />
        <Stat label="Chantiers à corriger" value={aCorriger.length} on={aCorriger.length > 0} />
        <Stat label="Apprentis actifs" value={actifs.length} />
      </div>

      <section className="stack gap-12" style={{ marginBottom: 40 }}>
        <div className="row-between">
          <h2 className="h2">Vidéos des leçons</h2>
          <span className="small muted num">{remplies} / {total} remplies</span>
        </div>
        <div className="bar"><span style={{ width: `${total ? (remplies / total) * 100 : 0}%` }} /></div>
        <p className="small muted">
          Choisis un module, colle le lien Vimeo ou YouTube de chaque leçon, enregistre. La vidéo apparaît aussitôt
          pour les apprentis.
        </p>
        <div className="grid grid-2">
          {MODULES.map((m) => {
            const faites = m.lessons.filter((_, i) => parseVideo(videos[lessonId(m.n, i)])).length;
            const complet = faites === m.lessons.length;
            return (
              <Link key={m.n} className="card card-tight card-link" href={`/admin?videos=${m.n}`}>
                <div className="row-between" style={{ alignItems: "flex-start" }}>
                  <div className="row" style={{ alignItems: "flex-start", gap: 12, minWidth: 0 }}>
                    <span className={`modnum ${complet ? "" : "modnum-on"}`}>{String(m.n).padStart(2, "0")}</span>
                    <span className="h3">{m.title}</span>
                  </div>
                  <span className={`pill ${complet ? "pill-green" : faites ? "pill-amber" : ""}`}>
                    {faites}/{m.lessons.length}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="stack gap-12" style={{ marginBottom: 40 }}>
        <h2 className="h2">Demandes d'inscription</h2>
        {enAttente.length === 0 ? (
          <div className="card empty">Aucune demande en attente.</div>
        ) : (
          enAttente.map((u) => (
            <article key={u.id} className="card stack gap-12">
              <div className="row-between" style={{ alignItems: "flex-start" }}>
                <div className="stack gap-4">
                  <span className="h3">{u.prenom} {u.nom}</span>
                  <span className="tiny muted">
                    {SITUATIONS[u.situation] || u.situation || "Situation non précisée"}
                    {" · "}
                    {new Date(u.createdAt).toLocaleDateString("fr-BE", { day: "2-digit", month: "long" })}
                  </span>
                  <span className="tiny muted">{[u.email, u.telephone].filter(Boolean).join(" · ") || "Pas de contact donné"}</span>
                </div>
                <span className="pill num">{u.code}</span>
              </div>

              {u.message ? <p className="small dim" style={{ whiteSpace: "pre-wrap" }}>{u.message}</p> : null}

              <div className="row gap-8">
                <form action={statutAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="statut" value="actif" />
                  <button className="btn btn-primary btn-sm" type="submit">Ouvrir l'accès</button>
                </form>
                <form action={statutAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="statut" value="refuse" />
                  <button className="btn btn-ghost btn-sm" type="submit">Refuser</button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="stack gap-12" style={{ marginBottom: 40 }}>
        <h2 className="h2">Chantiers à corriger</h2>
        {aCorriger.length === 0 ? (
          <div className="card empty">Rien à corriger. Tout est à jour.</div>
        ) : (
          aCorriger.map((p) => (
            <article key={p.id} className="card stack gap-12">
              <div className="row-between" style={{ alignItems: "flex-start" }}>
                <div className="stack gap-4">
                  <span className="h3">{p.titre}</span>
                  <span className="tiny muted">
                    {p.prenom} · {new Date(p.createdAt).toLocaleDateString("fr-BE", { day: "2-digit", month: "long" })}
                    {p.moduleNumber ? ` · module ${p.moduleNumber}` : ""}
                  </span>
                </div>
                <span className="pill pill-amber">En attente</span>
              </div>

              {p.imageUrl ? (
                <a href={p.imageUrl} target="_blank" rel="noreferrer">
                  <img className="thumb" src={p.imageUrl} alt={p.titre} loading="lazy" />
                </a>
              ) : null}
              {p.contexte ? <p className="small dim" style={{ whiteSpace: "pre-wrap" }}>{p.contexte}</p> : null}

              <form action={reviewProofAction} className="stack gap-8">
                <input type="hidden" name="id" value={p.id} />
                <textarea
                  name="verdict"
                  className="textarea"
                  placeholder="Ce qui va, ce qui ne va pas, et ce qu'il refait."
                  style={{ minHeight: 76 }}
                />
                <div className="row gap-8">
                  <button className="btn btn-primary btn-sm" type="submit" name="statut" value="valide">Valider</button>
                  <button className="btn btn-ghost btn-sm" type="submit" name="statut" value="a_revoir">À revoir</button>
                </div>
              </form>
            </article>
          ))
        )}
      </section>

      <section className="stack gap-12">
        <h2 className="h2">Apprentis</h2>
        {actifs.length === 0 ? (
          <div className="card empty">Aucun apprenti actif.</div>
        ) : (
          <div className="card stack">
            {actifs.map((u) => (
              <div key={u.id} className="out">
                <span className="stack gap-4">
                  <span className="h3">{u.prenom} {u.nom}</span>
                  <span className="tiny muted">{SITUATIONS[u.situation] || "—"}</span>
                </span>
                <span className="row gap-12">
                  <span className="tiny muted num">{u.code}</span>
                  <form action={statutAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="statut" value="refuse" />
                    <button className="btn btn-ghost btn-sm" type="submit">Suspendre</button>
                  </form>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

function EditeurVideos({ mod, videos, enregistre }) {
  return (
    <>
      <Link href="/admin" className="small muted" style={{ display: "inline-block", marginBottom: 20 }}>
        ← Administration
      </Link>

      <div className="page-head">
        <div className="row">
          <span className="display" style={{ fontSize: 13 }}>Module {String(mod.n).padStart(2, "0")}</span>
          <span className="tiny muted">· {mod.lessons.length} leçons</span>
        </div>
        <h1 className="h1">{mod.title}</h1>
        <p className="dim small" style={{ maxWidth: 620 }}>
          Colle l'adresse de la vidéo, celle de la barre du navigateur. Laisse vide pour retirer une vidéo.
        </p>
      </div>

      {enregistre ? (
        <p className="note" style={{ borderLeftColor: "var(--green)", marginBottom: 20 }}>
          Enregistré. Les apprentis voient les vidéos immédiatement.
        </p>
      ) : null}

      <form action={saveVideosAction} className="stack gap-16">
        <input type="hidden" name="retourModule" value={mod.n} />

        <div className="card stack gap-8">
          <div className="row-between" style={{ alignItems: "flex-start" }}>
            <div className="stack gap-4">
              <span className="h3">Image de couverture du module</span>
              <span className="tiny muted">
                Une vraie photo de chantier vaut mieux qu'un fond uni. Colle l'adresse d'une image en ligne.
              </span>
            </div>
            {videos[`couverture.${mod.n}`] ? <span className="pill pill-green">Image</span> : <span className="pill">Vide</span>}
          </div>
          <input
            className="input"
            type="url"
            name={`v_couverture.${mod.n}`}
            defaultValue={videos[`couverture.${mod.n}`] || ""}
            placeholder="https://… .jpg"
            spellCheck="false"
            autoComplete="off"
          />
          {videos[`couverture.${mod.n}`] ? (
            <img className="thumb" src={videos[`couverture.${mod.n}`]} alt="" style={{ maxWidth: 260 }} />
          ) : null}
        </div>

        {mod.lessons.map((l, i) => {
          const key = lessonId(mod.n, i);
          const valeur = videos[key] || "";
          const parsed = parseVideo(valeur);
          return (
            <div key={key} className="card stack gap-8">
              <div className="row-between" style={{ alignItems: "flex-start" }}>
                <div className="stack gap-4" style={{ minWidth: 0 }}>
                  <span className="h3">{String(i + 1).padStart(2, "0")} — {l.t}</span>
                  <span className="tiny muted">{formatDuree(l.min)}</span>
                </div>
                {valeur ? (
                  parsed ? <span className="pill pill-green">{parsed.hote}</span> : <span className="pill pill-red">Lien non reconnu</span>
                ) : (
                  <span className="pill">Vide</span>
                )}
              </div>
              <input
                className="input"
                type="url"
                name={`v_${key}`}
                defaultValue={valeur}
                placeholder="https://vimeo.com/123456789"
                spellCheck="false"
                autoComplete="off"
              />
            </div>
          );
        })}

        <div className="row-between">
          <span className="tiny muted">Vimeo et YouTube acceptés.</span>
          <button className="btn btn-primary" type="submit">Enregistrer le module</button>
        </div>
      </form>
    </>
  );
}

function Stat({ label, value, on }) {
  return (
    <div className="card card-tight stack gap-4">
      <span className="eyebrow">{label}</span>
      <span className="h1 num" style={{ color: on ? "var(--red)" : "var(--fg)" }}>{value}</span>
    </div>
  );
}
