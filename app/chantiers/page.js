import Shell from "../_components/Shell";
import { proofAction } from "../actions";
import { requireActive } from "@/lib/guard";
import { listProofs, hasStore } from "@/lib/store";
import { MODULES } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Chantiers({ searchParams }) {
  const sp = await searchParams;
  const { user, badge } = await requireActive();
  const all = await listProofs();
  const mine = all.filter((p) => p.userId === user.id);
  const valides = mine.filter((p) => p.statut === "valide").length;

  return (
    <Shell user={user} badge={badge}>
      <div className="page-head">
        <h1 className="h1">Mes chantiers</h1>
        <p className="lead" style={{ maxWidth: "56ch" }}>
          Tu photographies ton travail, Emre le regarde et te dit ce qui va et ce qui ne va pas. C'est ce qui remplace
          un examen. Et au bout du parcours, cette page est ton portfolio.
        </p>
      </div>

      <div className="strip" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 32 }}>
        <Stat label="Chantiers envoyés" value={mine.length} />
        <Stat label="Validés par Emre" value={valides} />
        <Stat label="En attente de correction" value={mine.filter((p) => p.statut === "attente").length} agir={mine.some((p) => p.statut === "attente")} />
      </div>

      <section className="card stack gap-16" style={{ marginBottom: 32 }}>
        <div className="stack gap-4">
          <h2 className="h2">Envoyer un chantier</h2>
          <p className="small muted">
            Une photo nette, prise de face, avec assez de recul pour qu'on voie l'ensemble. Dis ce que tu as fait et ce
            dont tu n'es pas sûr — c'est sur ce doute qu'Emre répondra.
          </p>
        </div>

        <form action={proofAction} className="stack gap-12">
          <div className="field">
            <label className="label" htmlFor="titre">Ce que tu as fait</label>
            <input
              id="titre"
              name="titre"
              className="input"
              placeholder="Tableau divisionnaire 12 modules, maison 4 façades"
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="moduleNumber">Module concerné</label>
            <select id="moduleNumber" name="moduleNumber" className="select" defaultValue={sp?.module || ""}>
              <option value="">Aucun en particulier</option>
              {MODULES.map((m) => (
                <option key={m.n} value={m.n}>
                  {String(m.n).padStart(2, "0")} — {m.title}
                  {m.requiertPreuve ? " (contrôle)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="contexte">Contexte et doutes</label>
            <textarea
              id="contexte"
              name="contexte"
              className="textarea"
              placeholder="Rénovation, tableau existant repris. Je ne suis pas sûr du repérage des différentiels ni de la section du départ cuisine."
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="photo">Photo</label>
            <input id="photo" name="photo" type="file" accept="image/*" capture="environment" className="input" />
            <span className="tiny muted">8 Mo maximum. Depuis ton téléphone, l'appareil photo s'ouvre directement.</span>
          </div>

          {!hasStore ? (
            <p className="note note-warn">
              Le stockage des photos n'est pas encore branché sur cet environnement : le chantier sera enregistré sans
              image.
            </p>
          ) : null}

          <button className="btn btn-primary" type="submit">Envoyer à Emre</button>
        </form>
      </section>

      <section className="stack gap-12">
        <h2 className="h2">Mon historique</h2>
        {mine.length === 0 ? (
          <p className="empty">Aucun chantier envoyé pour l'instant.</p>
        ) : (
          <div className="stack gap-12">
            {mine.map((p) => (
              <article key={p.id} className="card card-tight stack gap-12">
                {p.imageUrl ? <img className="thumb" src={p.imageUrl} alt={p.titre} loading="lazy" style={{ maxWidth: 320 }} /> : null}
                <div className="row-between" style={{ alignItems: "flex-start" }}>
                  <div className="stack gap-4" style={{ minWidth: 0 }}>
                    <span className="h3">{p.titre}</span>
                    <span className="tiny muted">
                      {new Date(p.createdAt).toLocaleDateString("fr-BE", { day: "2-digit", month: "long", year: "numeric" })}
                      {p.moduleNumber ? ` · module ${p.moduleNumber}` : ""}
                    </span>
                  </div>
                  <Statut statut={p.statut} />
                </div>
                {p.contexte ? <p className="small muted">{p.contexte}</p> : null}
                {p.verdict ? (
                  <div className={`note ${p.statut === "valide" ? "note-ok" : "note-warn"}`}>
                    <strong>Emre —</strong> {p.verdict}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
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

function Statut({ statut }) {
  if (statut === "valide") return <span className="pill pill-green">Validé</span>;
  if (statut === "a_revoir") return <span className="pill pill-red">À revoir</span>;
  return <span className="pill">En attente</span>;
}
