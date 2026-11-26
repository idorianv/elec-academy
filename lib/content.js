// Le parcours Elec Academy — 4 parties, 11 modules.
// Source : document « Elec Academy » (Dorian / Emre, déc. 2025).

export const PARTS = [
  {
    id: "technique",
    index: 1,
    name: "Les compétences techniques",
    tagline: "Le métier",
    goal: "Transformer l'apprenti en quelqu'un de fiable, qui sait ce qu'il fait et qui ne fait pas de conneries.",
    result: "Technicien solide et rapide.",
  },
  {
    id: "mentalite",
    index: 2,
    name: "La mentalité & le professionnalisme",
    tagline: "Mindset",
    goal: "Construire une réputation. Devenir un pro qu'on respecte et qu'on veut garder.",
    result: "Devenir la personne que tout le monde veut dans son équipe.",
  },
  {
    id: "entrepreneuriat",
    index: 3,
    name: "L'entrepreneuriat",
    tagline: "Game changer",
    goal: "Reproduire exactement le chemin d'Emre : salarié → indépendant → patron.",
    result: "Monter une boîte rentable, respectée et stable.",
  },
  {
    id: "accompagnement",
    index: 4,
    name: "L'accompagnement perso",
    tagline: "Ce qui change tout",
    goal: "La différence avec une formation technique de base : quelqu'un te suit, en vrai.",
    result: "Tu n'es jamais seul devant ton écran.",
  },
];

export const MODULES = [
  {
    n: 1,
    part: "technique",
    title: "Les fondations",
    summary: "Ce qu'on te montre mal à l'école : la sécurité, le bon matos, et comment t'organiser.",
    lessons: [
      { t: "La sécurité (base)", d: "Consignation, VAT, EPI. Les gestes qui font que tu rentres chez toi le soir.", min: 14 },
      { t: "Les outils qu'il te faut vraiment", d: "Ce qui sert tous les jours, ce qui dort dans le sac, ce qui ne vaut pas son prix.", min: 11 },
      { t: "Lire un plan sans te perdre", d: "Symboles, unifilaire, repérage. Méthode pour attaquer un plan inconnu.", min: 18 },
      { t: "Organiser ton sac et ton matos comme un pro", d: "Le rangement qui te fait gagner une heure par jour sur chantier.", min: 9 },
    ],
  },
  {
    n: 2,
    part: "technique",
    title: "Les installations",
    summary: "Le vrai boulot : tableau, raccordements, dépannage, mise aux normes.",
    requiertPreuve: "Un tableau que tu as câblé ou repris, photographié et validé par Emre.",
    lessons: [
      { t: "Tableau électrique : lire, analyser, repérer les erreurs", d: "On ouvre de vrais tableaux et on dit ce qui ne va pas.", min: 26 },
      { t: "Les raccordements : comment faire propre", d: "Serrage, longueur de dénudage, cheminement. Le travail qu'on reconnaît.", min: 17 },
      { t: "Le dépannage : méthode claire, pas de panique", d: "L'arbre de décision à suivre quand rien ne marche et que le client regarde.", min: 22 },
      { t: "Mise aux normes", d: "Ce qui bloque un contrôle, et dans quel ordre le reprendre.", min: 19 },
      { t: "Cas réels filmés sur chantier", d: "Le vrai bordel du terrain, sans montage flatteur.", min: 31 },
    ],
  },
  {
    n: 3,
    part: "technique",
    title: "Les erreurs à ne jamais faire",
    summary: "Les fautes que tous les apprentis commettent, montrées sur de vrais chantiers ratés.",
    lessons: [
      { t: "Les 10 erreurs que TOUS les apprentis font", d: "Et comment les éviter avant qu'elles coûtent cher.", min: 24 },
      { t: "Les mauvaises habitudes à virer direct", d: "Celles qu'on prend en 3 semaines et qu'on garde 10 ans.", min: 13 },
      { t: "Avant / après de vrais chantiers ratés", d: "Ce que ça donne quand on reprend le travail de quelqu'un d'autre.", min: 20 },
    ],
  },
  {
    n: 4,
    part: "mentalite",
    title: "La mentalité d'un électricien respecté",
    summary: "Discipline, fiabilité, tenue sur chantier. Ce qui fait qu'on te rappelle.",
    lessons: [
      { t: "Discipline et rigueur", d: "Arriver à l'heure est un savoir-faire, pas une politesse.", min: 12 },
      { t: "Être fiable", d: "Tenir ce que tu annonces, même quand ça t'arrange pas.", min: 10 },
      { t: "Ton attitude sur chantier", d: "Savoir se tenir devant un client, un chef, un autre corps de métier.", min: 15 },
      { t: "Comment parler aux clients", d: "Expliquer un problème sans faire peur et sans mentir.", min: 18 },
      { t: "Respecter les délais", d: "Estimer juste, prévenir tôt, rattraper proprement.", min: 11 },
      { t: "Devenir la référence", d: "Ce qui fait qu'on demande toi et pas un autre.", min: 9 },
    ],
  },
  {
    n: 5,
    part: "mentalite",
    title: "Communication & leadership",
    summary: "Gagner le respect sans jouer le caïd, et commencer à mener une équipe.",
    lessons: [
      { t: "Parler à un chef de chantier", d: "Dire non, demander, négocier un délai, sans passer pour un con.", min: 16 },
      { t: "Gagner le respect sans jouer le caïd", d: "L'autorité vient du travail, pas du ton.", min: 12 },
      { t: "Gérer une équipe", d: "Répartir, contrôler, reprendre sans humilier.", min: 21 },
      { t: "Régler les conflits intelligemment", d: "Le désaccord qui se règle en 5 minutes contre celui qui pourrit un chantier.", min: 14 },
      { t: "Le comportement exemplaire au boulot", d: "Ce que les autres copient sur toi sans te le dire.", min: 10 },
    ],
  },
  {
    n: 6,
    part: "entrepreneuriat",
    title: "Passer indépendant",
    summary: "Premiers clients, prix justes, administratif. Le passage que personne ne t'explique.",
    lessons: [
      { t: "Trouver tes premiers clients", d: "Sans plateforme, sans pub, sans réseau de départ.", min: 23 },
      { t: "Te faire recommander", d: "Comment on transforme un chantier fini en deux chantiers suivants.", min: 15 },
      { t: "Fixer tes prix sans te faire arnaquer", d: "Calcul du taux horaire réel, marge, et ce qu'on oublie toujours de compter.", min: 27 },
      { t: "Créer une offre simple et rentable", d: "Trois prestations claires valent mieux qu'un catalogue.", min: 18 },
      { t: "Éviter les clients relous", d: "Les signaux à repérer au premier appel.", min: 13 },
      { t: "Administratif, assurances, juridique", d: "Statut, RC pro, décennale, conditions générales. Le strict nécessaire.", min: 29 },
      { t: "Comptables, courtiers : qui va t'aider", d: "Qui faire entrer dans ton jeu, et ce que ça coûte.", min: 12 },
    ],
  },
  {
    n: 7,
    part: "entrepreneuriat",
    title: "Construire une vraie entreprise",
    summary: "Passer d'un indépendant qui travaille seul à une boîte qui tourne.",
    requiertPreuve: "Un chantier complet mené de bout en bout, documenté et validé par Emre.",
    lessons: [
      { t: "Créer une marque autour de ton nom", d: "Pourquoi « Emrelec » vaut plus que « électricité générale ».", min: 17 },
      { t: "Bâtir une réputation en béton", d: "Avis, photos, bouche-à-oreille : le système, pas la chance.", min: 19 },
      { t: "Décrocher des gros chantiers", d: "Comment on entre chez un promoteur ou une régie.", min: 22 },
      { t: "Gérer ton planning", d: "Le jour où tu ne peux plus tout tenir de tête.", min: 14 },
      { t: "Gérer le matos et le stock", d: "Ce qu'on garde en camion, ce qu'on commande, ce qui dort.", min: 16 },
      { t: "Monter une équipe solide", d: "Recruter, former, garder. Et quand il faut se séparer de quelqu'un.", min: 25 },
    ],
  },
  {
    n: 8,
    part: "entrepreneuriat",
    title: "Le système d'acquisition client",
    summary: "Être booké toute l'année, sans dépendre du hasard.",
    lessons: [
      { t: "Développer ta visibilité", d: "Être trouvable là où les gens cherchent vraiment.", min: 15 },
      { t: "Instagram, TikTok, bouche-à-oreille", d: "Quoi filmer sur un chantier, et à quelle fréquence.", min: 24 },
      { t: "Outils digitaux, SEO, Google Ads, Meta", d: "Le minimum qui rapporte, sans agence.", min: 28 },
      { t: "Prospection", d: "Qui appeler, quoi dire, combien de fois relancer.", min: 20 },
      { t: "Te différencier des autres", d: "Ce que tu fais que les 40 autres électriciens de ta zone ne font pas.", min: 16 },
      { t: "Être booké toute l'année", d: "Lisser les creux de janvier et d'août.", min: 13 },
    ],
  },
  {
    n: 9,
    part: "accompagnement",
    title: "Mentorat avec Emre",
    summary: "Un point vidéo chaque semaine, sur ton parcours à toi.",
    kind: "mentorat",
    lessons: [
      { t: "Suivi vidéo chaque semaine", d: "Un créneau à réserver, 30 minutes, en direct.", min: 30 },
      { t: "Analyse de ton parcours", d: "Où tu en es vraiment, pas où tu crois être.", min: 20 },
      { t: "Validation de tes progrès", d: "Ce qui est acquis, ce qui ne l'est pas encore.", min: 15 },
      { t: "Conseils adaptés à ton niveau", d: "La prochaine marche, pas le sommet.", min: 15 },
    ],
  },
  {
    n: 10,
    part: "accompagnement",
    title: "Études de cas réels sur le terrain",
    summary: "Tu viens sur un ou deux chantiers avec Emre. Full pratique.",
    kind: "terrain",
    lessons: [
      { t: "Venir sur chantier avec Emre", d: "Une à deux journées, les mains dedans.", min: 480 },
      { t: "Vidéos d'analyse de chantiers", d: "On démonte la décision : pourquoi ce choix et pas l'autre.", min: 35 },
      { t: "La méthodologie concrète", d: "L'ordre dans lequel on attaque un chantier complet.", min: 22 },
      { t: "Résolution de problèmes en live", d: "Un imprévu, une solution, en temps réel.", min: 26 },
    ],
  },
  {
    n: 11,
    part: "accompagnement",
    title: "La communauté",
    summary: "Le groupe privé, les webinaires experts, et les chantiers qu'Emre redistribue.",
    kind: "communaute",
    lessons: [
      { t: "Le groupe privé", d: "Questions / réponses tous les jours.", min: 0 },
      { t: "Partage de chantiers entre élèves", d: "Tu postes, on corrige, tout le monde apprend.", min: 0 },
      { t: "Corrections collectives", d: "Une erreur vue par dix personnes sert à dix personnes.", min: 0 },
      { t: "Webinaire hebdo avec un expert", d: "Électriciens, comptables, marketing, image. Et Emre sur des cas clients.", min: 60 },
      { t: "Recommandation aux clients d'Emre", d: "Les demandes qu'Emre ne peut pas traiter partent aux diplômés.", min: 0 },
    ],
  },
];

export function moduleByNumber(n) {
  return MODULES.find((m) => m.n === Number(n));
}

export function partOf(mod) {
  return PARTS.find((p) => p.id === mod.part);
}

export const TOTAL_LESSONS = MODULES.reduce((s, m) => s + m.lessons.length, 0);

export function lessonId(moduleNumber, lessonIndex) {
  return `${moduleNumber}.${lessonIndex + 1}`;
}
