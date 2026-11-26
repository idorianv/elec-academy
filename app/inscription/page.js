import Link from "next/link";
import { inscriptionAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function Inscription({ searchParams }) {
  const sp = await searchParams;

  return (
    <div className="center-page">
      <div className="center-card stack gap-24" style={{ maxWidth: 460 }}>
        <div className="brand">
          <span className="brand-bar" aria-hidden="true" />
          <span>
            <span className="brand-name">Elec Academy</span>
            <span className="brand-sub">Par Emre · Emrelec</span>
          </span>
        </div>

        <div className="card stack gap-16">
          <div className="stack gap-4">
            <h1 className="h2">Demander une place</h1>
            <p className="small muted">
              Emre lit chaque demande et ouvre les accès lui-même. Dis-lui où tu en es, c'est ça qui compte.
            </p>
          </div>

          <form action={inscriptionAction} className="stack gap-12">
            <div className="grid grid-2">
              <div className="field">
                <label className="label" htmlFor="prenom">Prénom</label>
                <input id="prenom" name="prenom" className="input" required autoComplete="given-name" />
              </div>
              <div className="field">
                <label className="label" htmlFor="nom">Nom</label>
                <input id="nom" name="nom" className="input" autoComplete="family-name" />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" className="input" autoComplete="email" />
            </div>

            <div className="field">
              <label className="label" htmlFor="telephone">Téléphone</label>
              <input id="telephone" name="telephone" type="tel" className="input" autoComplete="tel" />
            </div>

            <div className="field">
              <label className="label" htmlFor="situation">Où tu en es</label>
              <select id="situation" name="situation" className="select" defaultValue="apprenti">
                <option value="apprenti">Apprenti / en alternance</option>
                <option value="stagiaire">Stagiaire</option>
                <option value="etudiant">En formation, pas encore sur chantier</option>
                <option value="salarie">Salarié électricien</option>
                <option value="independant">Déjà indépendant</option>
                <option value="reconversion">En reconversion</option>
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="message">Pourquoi toi</label>
              <textarea
                id="message"
                name="message"
                className="textarea"
                placeholder="Ce que tu fais aujourd'hui, ce qui te bloque, ce que tu veux faire dans deux ans."
              />
            </div>

            {sp?.e === "prenom" ? <p className="small" style={{ color: "#ff8d86" }}>Ton prénom est obligatoire.</p> : null}

            <button className="btn btn-primary btn-block" type="submit">Envoyer ma demande</button>
            <p className="tiny muted">
              Tu recevras ton code d'accès à l'écran suivant. Garde-le : c'est lui qui te reconnecte.
            </p>
          </form>
        </div>

        <p className="tiny muted" style={{ textAlign: "center" }}>
          Déjà un code ? <Link href="/connexion" style={{ textDecoration: "underline" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
