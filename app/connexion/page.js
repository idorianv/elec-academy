import Link from "next/link";
import { connexionAction } from "../actions";

export const dynamic = "force-dynamic";

const ERREURS = {
  vide: "Entre ton code d'accès.",
  inconnu: "Ce code ne correspond à aucun compte.",
};

export default async function Connexion({ searchParams }) {
  const sp = await searchParams;
  const erreur = ERREURS[sp?.e];

  return (
    <div className="center-page">
      <div className="center-card stack gap-24">
        <div className="brand">
          <span className="brand-bar" aria-hidden="true" />
          <span>
            <span className="brand-name">Elec Academy</span>
            <span className="brand-sub">Par Emre · Emrelec</span>
          </span>
        </div>

        <div className="card stack gap-16">
          <div className="stack gap-4">
            <h1 className="h2">Connexion</h1>
            <p className="small muted">Ton code d'accès t'a été donné à l'inscription. Il ne change pas.</p>
          </div>

          <form action={connexionAction} className="stack gap-12">
            <div className="field">
              <label className="label" htmlFor="code">Code d'accès</label>
              <input
                id="code"
                name="code"
                className="input num"
                placeholder="XXXXXX"
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellCheck="false"
                required
              />
            </div>
            {erreur ? <p className="small" style={{ color: "#ff8d86" }}>{erreur}</p> : null}
            <button className="btn btn-primary btn-block" type="submit">Entrer</button>
          </form>

          <hr className="divider" />

          <div className="stack gap-8">
            <p className="small dim">Pas encore de compte ?</p>
            <Link className="btn btn-ghost btn-block" href="/inscription">Demander une place</Link>
          </div>
        </div>

        <p className="tiny muted" style={{ textAlign: "center" }}>
          Les places sont limitées. Chaque demande est lue par Emre.
        </p>
      </div>
    </div>
  );
}
