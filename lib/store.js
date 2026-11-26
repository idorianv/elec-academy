import { put, list, del } from "@vercel/blob";
import crypto from "crypto";

// Préfixe secret : les chemins restent indevinables même si l'hôte du store fuite.
const PREFIX = process.env.DATA_PREFIX || "ea-dev";
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
export const hasStore = Boolean(TOKEN);

// Repli mémoire quand le store n'est pas encore branché : l'app reste navigable.
const memory = globalThis.__eaMemory || (globalThis.__eaMemory = new Map());

const full = (key) => `${PREFIX}/${key}`;

export function newId() {
  return crypto.randomBytes(9).toString("base64url");
}

export async function putJson(key, value) {
  if (!hasStore) {
    memory.set(key, JSON.stringify(value));
    return;
  }
  await put(full(key), JSON.stringify(value), {
    access: "public",
    token: TOKEN,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function getJson(key) {
  if (!hasStore) {
    const raw = memory.get(key);
    return raw ? JSON.parse(raw) : null;
  }
  const { blobs } = await list({ prefix: full(key), limit: 1, token: TOKEN });
  const hit = blobs.find((b) => b.pathname === full(key));
  if (!hit) return null;
  const res = await fetch(hit.url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function listJson(prefix, { limit = 200 } = {}) {
  if (!hasStore) {
    const out = [];
    for (const [k, v] of memory) if (k.startsWith(prefix)) out.push(JSON.parse(v));
    return out.slice(0, limit);
  }
  const { blobs } = await list({ prefix: full(prefix), limit, token: TOKEN });
  const rows = await Promise.all(
    blobs.map(async (b) => {
      const res = await fetch(b.url, { cache: "no-store" });
      return res.ok ? res.json() : null;
    })
  );
  return rows.filter(Boolean);
}

export async function delJson(key) {
  if (!hasStore) {
    memory.delete(key);
    return;
  }
  const { blobs } = await list({ prefix: full(key), limit: 1, token: TOKEN });
  const hit = blobs.find((b) => b.pathname === full(key));
  if (hit) await del(hit.url, { token: TOKEN });
}

/** Photo de chantier : stockée sous un chemin aléatoire, servie telle quelle. */
export async function putImage(buffer, contentType) {
  if (!hasStore) return null;
  const ext = (contentType.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const blob = await put(`${PREFIX}/photos/${newId()}.${ext}`, buffer, {
    access: "public",
    token: TOKEN,
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

// ---------------------------------------------------------------- domaine

export const K = {
  user: (id) => `users/${id}.json`,
  code: (code) => `codes/${code.toUpperCase()}.json`,
  progress: (userId) => `progress/${userId}.json`,
  post: (id) => `posts/${id}.json`,
  proof: (id) => `proofs/${id}.json`,
  videos: () => `videos/all.json`,
};

/** Les liens de vidéos, indexés par identifiant de leçon ("3.2"). */
export async function getVideos() {
  return (await getJson(K.videos())) || {};
}

/** Enregistre les liens d'un module sans toucher aux autres. */
export async function setVideos(entries) {
  const current = await getVideos();
  const next = { ...current };
  for (const [key, url] of Object.entries(entries)) {
    const clean = String(url || "").trim();
    if (clean) next[key] = clean;
    else delete next[key];
  }
  next.majLe = Date.now();
  await putJson(K.videos(), next);
  return next;
}

function freshCode() {
  // 6 caractères sans O/0/I/1 : dictable au téléphone sans ambiguïté.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.randomBytes(6))
    .map((b) => alphabet[b % alphabet.length])
    .join("");
}

/**
 * Inscription libre : le candidat crée sa demande et repart avec son code.
 * Le compte reste en attente tant qu'Emre ne l'a pas ouvert.
 */
export async function requestAccess({ prenom, nom, email, telephone, situation, message, statut = "en_attente" }) {
  const id = newId();
  const code = freshCode();
  const user = {
    id,
    code,
    prenom: (prenom || "").trim(),
    nom: (nom || "").trim(),
    email: (email || "").trim(),
    telephone: (telephone || "").trim(),
    situation: situation || "",
    message: (message || "").trim(),
    role: "apprenti",
    statut, // en_attente | actif | refuse
    createdAt: Date.now(),
  };
  await putJson(K.user(id), user);
  await putJson(K.code(code), { code, userId: id });
  await putJson(K.progress(id), { userId: id, done: [], updatedAt: Date.now() });
  return user;
}

export async function userByCode(code) {
  const entry = await getJson(K.code(String(code || "").toUpperCase().trim()));
  if (!entry) return null;
  return getJson(K.user(entry.userId));
}

export async function setStatut(userId, statut) {
  const user = await getJson(K.user(userId));
  if (!user) return null;
  const next = { ...user, statut, decidedAt: Date.now() };
  await putJson(K.user(userId), next);
  return next;
}

export async function getUser(id) {
  return getJson(K.user(id));
}

export async function listUsers() {
  return (await listJson("users/")).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProgress(userId) {
  return (await getJson(K.progress(userId))) || { userId, done: [], updatedAt: 0 };
}

export async function toggleLesson(userId, lessonKey) {
  const p = await getProgress(userId);
  const done = new Set(p.done);
  if (done.has(lessonKey)) done.delete(lessonKey);
  else done.add(lessonKey);
  const next = { userId, done: [...done], updatedAt: Date.now() };
  await putJson(K.progress(userId), next);
  return next;
}

export async function addPost({ userId, prenom, body, moduleNumber }) {
  const id = `${Date.now()}_${newId()}`;
  const post = { id, userId, prenom, body, moduleNumber: moduleNumber || null, createdAt: Date.now(), replies: [] };
  await putJson(K.post(id), post);
  return post;
}

export async function listPosts() {
  return (await listJson("posts/")).sort((a, b) => b.createdAt - a.createdAt);
}

export async function addReply(postId, { userId, prenom, body, role }) {
  const post = await getJson(K.post(postId));
  if (!post) return null;
  post.replies = [...(post.replies || []), { id: newId(), userId, prenom, role, body, createdAt: Date.now() }];
  await putJson(K.post(postId), post);
  return post;
}

export async function addProof({ userId, prenom, titre, contexte, imageUrl, moduleNumber }) {
  const id = `${Date.now()}_${newId()}`;
  const proof = {
    id,
    userId,
    prenom,
    titre,
    contexte,
    imageUrl: imageUrl || null,
    moduleNumber: moduleNumber || null,
    statut: "attente", // attente | valide | a_revoir
    verdict: null,
    createdAt: Date.now(),
  };
  await putJson(K.proof(id), proof);
  return proof;
}

export async function listProofs() {
  return (await listJson("proofs/")).sort((a, b) => b.createdAt - a.createdAt);
}

export async function reviewProof(id, { statut, verdict, by }) {
  const proof = await getJson(K.proof(id));
  if (!proof) return null;
  const next = { ...proof, statut, verdict, reviewedBy: by, reviewedAt: Date.now() };
  await putJson(K.proof(id), next);
  return next;
}
