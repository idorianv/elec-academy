"use client";

import { useOptimistic, useTransition } from "react";
import { likeById } from "../actions";

/** Le « j'aime » d'un message. Le compte bouge tout de suite, l'enregistrement suit. */
export default function Jaime({ postId, aime, total }) {
  const [etat, setEtat] = useOptimistic({ aime, total }, (_, suivant) => suivant);
  const [enCours, demarrer] = useTransition();

  return (
    <button
      type="button"
      className="jaime"
      data-on={etat.aime}
      data-attente={enCours}
      aria-pressed={etat.aime}
      aria-label={etat.aime ? "Retirer mon j'aime" : "J'aime ce message"}
      onClick={() => {
        demarrer(async () => {
          setEtat({ aime: !etat.aime, total: etat.total + (etat.aime ? -1 : 1) });
          await likeById(postId);
        });
      }}
    >
      <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
        <path
          d="M10 16.5 3.6 10.4a3.7 3.7 0 0 1 5.2-5.2l1.2 1.1 1.2-1.1a3.7 3.7 0 0 1 5.2 5.2z"
          fill={etat.aime ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="num">{etat.total}</span>
    </button>
  );
}
