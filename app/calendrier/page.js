import Link from "next/link";
import Shell from "../_components/Shell";
import Tete from "../_components/Tete";
import { evenementAction, supprimerEvenementAction } from "../actions";
import { requireActive } from "@/lib/guard";
import { listEvents } from "@/lib/store";
import {
  aujourdhui, grille, moisDe, moisVoisin, nomMois, numJour, parJour,
  aVenir, enLettres, dansCombien, finHeure, enJours,
} from "@/lib/agenda";

export const dynamic = "force-dynamic";

export default async function Calendrier({ searchParams }) {
  const sp = await searchParams;
  const { user, badge } = await requireActive();
  const events = await listEvents();

  const today = aujourdhui();
  const mois = /^\d{4}-\d{2}$/.test(sp?.m || "") ? sp.m : moisDe(today);
  const liste = sp?.v === "liste";

  const cases = grille(mois);
  const agenda = parJour(events, cases[0], cases[cases.length - 1]);
  const prochaines = aVenir(events, 12);

  return (
    <Shell user={user} badge={badge}>
      <div className="stack gap-16">
        <div className="row-between" style={{ alignItems: "baseline" }}>
          <h1 className="h1">Calendrier</h1>
          <span className="tiny muted">Toutes les heures sont à l'heure de Bruxelles.</span>
        </div>

        <div className="cal">
          <div className="cal-barre">
            <Link className="btn btn-sm btn-ghost" href="/calendrier">Aujourd'hui</Link>

            <div className="cal-mois">
              <Link className="cal-fleche" href={`/calendrier?m=${moisVoisin(mois, -1)}${liste ? "&v=liste" : ""}`} aria-label="Mois précédent">‹</Link>
              <span className="h2">{nomMois(mois)}</span>
              <Link className="cal-fleche" href={`/calendrier?m=${moisVoisin(mois, 1)}${liste ? "&v=liste" : ""}`} aria-label="Mois suivant">›</Link>
            </div>

            <div className="seg">
              <Link href={`/calendrier?m=${mois}&v=liste`} data-on={liste}>Liste</Link>
              <Link href={`/calendrier?m=${mois}`} data-on={!liste}>Mois</Link>
            </div>
          </div>

          {liste ? (
            <Liste prochaines={prochaines} admin={user.role === "admin"} />
          ) : (
            <Mois cases={cases} mois={mois} today={today} agenda={agenda} />
          )}
        </div>

        {!liste && prochaines.length ? (
          <section className="stack gap-12">
            <h2 className="h2">Les prochains rendez-vous</h2>
            <div className="grid grid-2" style={{ alignItems: "start" }}>
              {prochaines.slice(0, 4).map((e) => <Carte key={`${e.id}-${e.date}`} e={e} />)}
            </div>
          </section>
        ) : null}

        {user.role === "admin" ? <Ajouter today={today} events={events} /> : null}
      </div>
    </Shell>
  );
}

function Mois({ cases, mois, today, agenda }) {
  return (
    <>
      <div className="cal-jours">
        {enJours().map((j) => <span key={j}>{j}</span>)}
      </div>
      <div className="cal-grille">
        {cases.map((date) => {
          const dedans = date.startsWith(mois);
          const duJour = agenda.get(date) || [];
          return (
            <div key={date} className="cal-case" data-hors={!dedans}>
              <span className="cal-num num" data-today={date === today}>{numJour(date)}</span>
              {duJour.map((e) => (
                <span key={`${e.id}-${e.date}`} className="cal-ev" title={`${e.heure} — ${e.titre}`}>
                  <b className="num">{e.heure}</b> {e.titre}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Liste({ prochaines, admin }) {
  if (!prochaines.length) {
    return <p className="empty" style={{ margin: 20 }}>Aucun rendez-vous prévu pour l'instant.</p>;
  }
  return (
    <ul className="cal-liste">
      {prochaines.map((e) => (
        <li key={`${e.id}-${e.date}`}>
          <span className="cal-liste-date stack gap-2">
            <span className="tiny muted">{enLettres(e.date).split(" ")[0]}</span>
            <span className="num" style={{ fontSize: 22 }}>{numJour(e.date)}</span>
          </span>
          <span className="stack gap-4" style={{ minWidth: 0, flex: 1 }}>
            <span className="h3">{e.titre}</span>
            <span className="tiny muted num">
              {e.heure}–{finHeure(e.heure, e.duree)}
              {e.intervenant ? ` · ${e.intervenant}${e.role ? `, ${e.role}` : ""}` : ""}
              {` · ${dansCombien(e.date)}`}
            </span>
            {e.description ? <span className="small dim">{e.description}</span> : null}
          </span>
          <span className="row gap-8" style={{ flex: "none" }}>
            {e.lien ? <a className="btn btn-sm" href={e.lien} target="_blank" rel="noreferrer">Rejoindre</a> : null}
            {admin ? (
              <form action={supprimerEvenementAction}>
                <input type="hidden" name="id" value={e.id} />
                <button className="btn btn-sm btn-ghost" type="submit">{e.repete === "hebdo" ? "Supprimer la série" : "Supprimer"}</button>
              </form>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Carte({ e }) {
  return (
    <article className="card card-tight stack gap-10">
      <div className="row-between" style={{ alignItems: "baseline" }}>
        <span className="tiny muted">{enLettres(e.date)}</span>
        <span className="pill">{dansCombien(e.date)}</span>
      </div>
      <span className="h3">{e.titre}</span>
      <span className="tiny muted num">{e.heure}–{finHeure(e.heure, e.duree)}</span>
      {e.intervenant ? (
        <span className="row gap-8">
          <Tete nom={e.intervenant} petite admin={e.intervenant === "Emre"} />
          <span className="small">
            {e.intervenant}
            {e.role ? <span className="muted"> · {e.role}</span> : null}
          </span>
        </span>
      ) : null}
      {e.description ? <p className="small dim">{e.description}</p> : null}
      {e.lien ? <a className="btn btn-sm btn-block" href={e.lien} target="_blank" rel="noreferrer">Rejoindre</a> : null}
    </article>
  );
}

function Ajouter({ today, events }) {
  return (
    <details className="card stack gap-16">
      <summary className="h2" style={{ cursor: "pointer" }}>Ajouter un rendez-vous</summary>

      <form action={evenementAction} className="stack gap-12">
        <div className="field">
          <label className="label" htmlFor="titre">Quoi</label>
          <input id="titre" name="titre" className="input" placeholder="Webinaire — fixer ses prix sans se planter" required />
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label className="label" htmlFor="intervenant">Qui anime</label>
            <input id="intervenant" name="intervenant" className="input" placeholder="Emre" autoComplete="off" />
          </div>
          <div className="field">
            <label className="label" htmlFor="role">Son métier</label>
            <input id="role" name="role" className="input" placeholder="comptable, courtier, électricien…" autoComplete="off" />
          </div>
        </div>

        <div className="grid grid-3">
          <div className="field">
            <label className="label" htmlFor="date">Date</label>
            <input id="date" name="date" type="date" className="input" defaultValue={today} required />
          </div>
          <div className="field">
            <label className="label" htmlFor="heure">Heure (Bruxelles)</label>
            <input id="heure" name="heure" type="time" className="input" defaultValue="19:00" required />
          </div>
          <div className="field">
            <label className="label" htmlFor="duree">Durée (min)</label>
            <input id="duree" name="duree" type="number" min="15" step="15" className="input num" defaultValue={60} />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="lien">Lien de la visio</label>
          <input id="lien" name="lien" type="url" className="input" placeholder="https://meet.google.com/…" autoComplete="off" />
        </div>

        <div className="field">
          <label className="label" htmlFor="description">Ce qu'on y fait</label>
          <textarea id="description" name="description" className="textarea" style={{ minHeight: 72 }}
            placeholder="On passe en revue vos devis en direct. Venez avec un vrai devis en cours." />
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label className="label" htmlFor="repete">Répétition</label>
            <select id="repete" name="repete" className="select" defaultValue="">
              <option value="">Une seule fois</option>
              <option value="hebdo">Toutes les semaines</option>
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="finRepetition">Jusqu'au (si répété)</label>
            <input id="finRepetition" name="finRepetition" type="date" className="input" />
          </div>
        </div>

        <div className="row-between">
          <span className="tiny muted num">{events.length} rendez-vous enregistrés</span>
          <button className="btn btn-primary" type="submit">Ajouter au calendrier</button>
        </div>
      </form>
    </details>
  );
}
