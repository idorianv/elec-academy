"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser, setSession, clearSession, adminCode } from "@/lib/auth";
import {
  requestAccess,
  userByCode,
  setStatut,
  toggleLesson,
  addPost,
  addReply,
  addProof,
  reviewProof,
  putImage,
  setVideos,
} from "@/lib/store";

export async function connexionAction(formData) {
  const code = String(formData.get("code") || "").trim();
  if (!code) redirect("/connexion?e=vide");

  if (code.toUpperCase() === adminCode().toUpperCase()) {
    await setSession("admin");
    redirect("/admin");
  }

  const user = await userByCode(code);
  if (!user) redirect("/connexion?e=inconnu");
  await setSession(user.id);
  redirect(user.statut === "actif" ? "/parcours" : "/attente");
}

export async function inscriptionAction(formData) {
  const prenom = String(formData.get("prenom") || "").trim();
  if (!prenom) redirect("/inscription?e=prenom");

  const user = await requestAccess({
    prenom,
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    situation: formData.get("situation"),
    message: formData.get("message"),
  });
  await setSession(user.id);
  redirect(`/attente?nouveau=1`);
}

export async function deconnexionAction() {
  await clearSession();
  redirect("/connexion");
}

export async function toggleLessonAction(formData) {
  const user = await currentUser();
  if (!user || user.statut !== "actif") return;
  const key = String(formData.get("key") || "");
  if (!key) return;
  await toggleLesson(user.id, key);
  revalidatePath("/parcours", "layout");
}

/** Bascule une leçon depuis le composant client (retour visuel immédiat). */
export async function toggleLessonById(key) {
  const user = await currentUser();
  if (!user || user.statut !== "actif") return;
  if (!key) return;
  await toggleLesson(user.id, String(key));
  revalidatePath("/parcours", "layout");
}

export async function postAction(formData) {
  const user = await currentUser();
  if (!user || user.statut !== "actif") return;
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  await addPost({
    userId: user.id,
    prenom: user.prenom,
    body,
    moduleNumber: formData.get("moduleNumber") || null,
  });
  revalidatePath("/communaute");
}

export async function replyAction(formData) {
  const user = await currentUser();
  if (!user || user.statut !== "actif") return;
  const body = String(formData.get("body") || "").trim();
  const postId = String(formData.get("postId") || "");
  if (!body || !postId) return;
  await addReply(postId, { userId: user.id, prenom: user.prenom, role: user.role, body });
  revalidatePath("/communaute");
}

export async function proofAction(formData) {
  const user = await currentUser();
  if (!user || user.statut !== "actif") return;
  const titre = String(formData.get("titre") || "").trim();
  if (!titre) return;

  let imageUrl = null;
  const file = formData.get("photo");
  if (file && typeof file === "object" && file.size > 0 && file.size < 8_000_000) {
    const buf = Buffer.from(await file.arrayBuffer());
    imageUrl = await putImage(buf, file.type || "image/jpeg");
  }

  await addProof({
    userId: user.id,
    prenom: user.prenom,
    titre,
    contexte: String(formData.get("contexte") || "").trim(),
    moduleNumber: formData.get("moduleNumber") || null,
    imageUrl,
  });
  revalidatePath("/chantiers");
  revalidatePath("/admin");
}

export async function reviewProofAction(formData) {
  const user = await currentUser();
  if (!user || user.role !== "admin") return;
  await reviewProof(String(formData.get("id")), {
    statut: String(formData.get("statut")),
    verdict: String(formData.get("verdict") || "").trim(),
    by: user.prenom,
  });
  revalidatePath("/admin");
  revalidatePath("/chantiers");
}

export async function saveVideosAction(formData) {
  const user = await currentUser();
  if (!user || user.role !== "admin") return;
  const entries = {};
  for (const [name, value] of formData.entries()) {
    if (name.startsWith("v_")) entries[name.slice(2)] = value;
  }
  await setVideos(entries);
  revalidatePath("/admin");
  revalidatePath("/parcours", "layout");
  const mod = formData.get("retourModule");
  redirect(mod ? `/admin?videos=${mod}&ok=1` : "/admin?ok=1");
}

export async function statutAction(formData) {
  const user = await currentUser();
  if (!user || user.role !== "admin") return;
  await setStatut(String(formData.get("userId")), String(formData.get("statut")));
  revalidatePath("/admin");
}
