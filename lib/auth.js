import crypto from "crypto";
import { cookies } from "next/headers";
import { getUser } from "./store";

const COOKIE = "ea_session";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function makeToken(userId) {
  return `${userId}.${sign(userId)}`;
}

export function readToken(token) {
  if (!token || !token.includes(".")) return null;
  const [userId, sig] = token.split(".");
  const expected = sign(userId);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}

export async function setSession(userId) {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 120,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** L'utilisateur courant, ou null. Le compte admin ne vit pas dans le store. */
export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const userId = readToken(token);
  if (!userId) return null;
  if (userId === "admin") {
    return { id: "admin", prenom: "Emre", role: "admin", statut: "actif" };
  }
  const user = await getUser(userId);
  if (!user) return null;
  return user;
}

export function adminCode() {
  return process.env.ADMIN_CODE || "EMRE-ADMIN";
}
