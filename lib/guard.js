import { redirect } from "next/navigation";
import { currentUser } from "./auth";
import { listProofs } from "./store";

/** Exige un compte actif. Renvoie l'utilisateur et le badge admin. */
export async function requireActive() {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  if (user.statut !== "actif") redirect("/attente");
  let badge = 0;
  if (user.role === "admin") {
    const proofs = await listProofs();
    badge = proofs.filter((p) => p.statut === "attente").length;
  }
  return { user, badge };
}

export async function requireAdmin() {
  const { user, badge } = await requireActive();
  if (user.role !== "admin") redirect("/parcours");
  return { user, badge };
}
