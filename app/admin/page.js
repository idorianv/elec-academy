import Shell from "../_components/Shell";
import { reviewProofAction, statutAction } from "../actions";
import { requireAdmin } from "@/lib/guard";
import { listProofs, listUsers, hasStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const SITUATIONS = {
  apprenti: "Apprenti / alternance",
  stagiaire: "Stagiaire",
  etudiant: "En formation",
  salarie: "Salarié électricien",
  independant: "Déjà indépendant",
  reconversion: "Reconversion",
};

export default async function Admin() {
  const { user, badge } = await requireAdmin();
  const [proofs, users] = await Promise.all([listProofs(), listUsers()]);
  const enAttente = users.filter((u) => u.statut === "en_attente");
  const actifs = users.filter((u) => u.statut === "actif");
  const aCorriger = proofs.filter((p) => p.statut === "attente");

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

function Stat({ label, value, on }) {
  return (
    <div className="card card-tight stack gap-4">
      <span className="eyebrow">{label}</span>
      <span className="h1 num" style={{ color: on ? "var(--red)" : "var(--fg)" }}>{value}</span>
    </div>
  );
}
