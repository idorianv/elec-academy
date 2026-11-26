// Transforme un lien Vimeo ou YouTube en adresse de lecteur intégrable.
// Rien n'est hébergé ici : la plateforme ne fait qu'afficher.

export function parseVideo(input) {
  const url = String(input || "").trim();
  if (!url) return null;

  // Vimeo : vimeo.com/123456789 ou vimeo.com/123456789/HASH (lien non répertorié)
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-zA-Z]+))?/);
  if (vimeo) {
    const [, id, hash] = vimeo;
    const params = new URLSearchParams({ badge: "0", autopause: "0", player_id: "0", app_id: "58479" });
    if (hash) params.set("h", hash);
    return { hote: "Vimeo", id, src: `https://player.vimeo.com/video/${id}?${params.toString()}` };
  }

  // Déjà une adresse de lecteur Vimeo
  const player = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (player) {
    return { hote: "Vimeo", id: player[1], src: url };
  }

  // YouTube : youtu.be/ID, watch?v=ID, embed/ID, shorts/ID
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  if (yt) {
    return { hote: "YouTube", id: yt[1], src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  }

  return null;
}

/** Un lien est-il exploitable ? Sert à prévenir dans l'écran d'administration. */
export function videoValide(input) {
  return parseVideo(input) !== null;
}
