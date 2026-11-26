import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Attente({ searchParams }) {
  const sp = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/connexion");
  if (user.statut === "actif") redirect("/parcours");

  const refuse = user.statut === "refuse";

  return (
    <div className="center-page">
      <div className="center-card stack gap-24" style={{ maxWidth: 440 }}>
        <div className="brand">
          <span className="brand-bar" aria-hidden="true" />
          <span>
            <span className="brand-name">Elec Academy</span>
            <span className="brand-sub">Par Emre · Emrelec</span>
          </span>
        </div>

        <div className="card stack gap-16">
          {refuse ? (
            <>
              <h1 className="h2">Ta demande n'a pas été retenue</h1>
              <p className="small dim">
                Ça ne veut pas dire jamais. Les places partent par promotions — recontacte Emre quand tu seras sur
                chantier, c'est ce qui pèse le plus dans la sélection.
              </p>
            </>
          ) : (
            <>
              <h1 className="h2">Demande enregistrée</h1>
              <p className="small dim">
                Emre lit les demandes lui-même et ouvre les accès par petites promotions. Tu n'as rien d'autre à faire.
              </p>
            </>
          )}

          {sp?.nouveau && !refuse ? (
            <div className="stack gap-8">
              <hr className="divider" />
              <span className="eyebrow">Ton code d'accès</span>
              <p className="display" style={{ fontSize: 38, letterSpacing: ".06em" }}>{user.code}</p>
              <p className="tiny muted">
                Note-le maintenant, dans tes contacts ou en photo. C'est lui qui te reconnecte, et il ne sera plus
                réaffiché.
              </p>
            </div>
          ) : (
            <p className="tiny muted">Ton code d'accès : <span className="num">{user.code}</span></p>
          )}

          <form action="/api/deconnexion" method="post">
            <button className="btn btn-ghost btn-sm btn-block" type="submit">Se déconnecter</button>
          </form>
        </div>
      </div>
    </div>
  );
}
