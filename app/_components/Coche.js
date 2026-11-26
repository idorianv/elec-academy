"use client";

import { useOptimistic, useTransition } from "react";
import { toggleLessonById } from "../actions";

/**
 * Case à cocher d'une leçon.
 * Le changement est affiché immédiatement, l'enregistrement suit en arrière-plan.
 */
export default function Coche({ lessonKey, fait, titre }) {
  const [vu, setVu] = useOptimistic(fait, (_, suivant) => suivant);
  const [enCours, demarrer] = useTransition();

  return (
    <button
      type="button"
      className="coche"
      data-on={vu}
      data-attente={enCours}
      aria-pressed={vu}
      aria-label={`${vu ? "Retirer" : "Marquer"} « ${titre} » ${vu ? "des leçons vues" : "comme vue"}`}
      onClick={() => {
        demarrer(async () => {
          setVu(!vu);
          await toggleLessonById(lessonKey);
        });
      }}
    >
      ✓
    </button>
  );
}
