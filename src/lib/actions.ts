"use server";

import { revalidatePath } from "next/cache";
import { compare, hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { ensureSeeded, getStore } from "@/lib/store";

export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (error: string): ActionState => ({ ok: false, error });
const done = (message: string): ActionState => ({ ok: true, message });

export async function registerUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2) return fail("nameRequired");
  if (!EMAIL_RE.test(email)) return fail("invalidEmail");
  if (password.length < 8) return fail("passwordShort");
  if (password !== confirmPassword) return fail("passwordMismatch");

  try {
    await ensureSeeded();
    const store = await getStore();
    await store.createUser({ name, email, passwordHash: await hash(password, 10) });
    return done("welcome");
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") return fail("emailTaken");
    console.error("[farja] registerUser failed:", error);
    return fail("genericError");
  }
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return fail("unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (name.length < 2) return fail("nameRequired");
  if (!EMAIL_RE.test(email)) return fail("invalidEmail");

  try {
    const store = await getStore();
    await store.updateUser(session.user.id, { name, email });
    revalidatePath("/", "layout");
    return done("profileSaved");
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") return fail("emailTaken");
    console.error("[farja] updateProfile failed:", error);
    return fail("genericError");
  }
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return fail("unauthorized");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) return fail("passwordShort");

  try {
    const store = await getStore();
    const user = await store.findUserById(session.user.id);
    if (!user) return fail("genericError");
    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) return fail("wrongPassword");
    await store.updateUser(user.id, { passwordHash: await hash(newPassword, 10) });
    await store.setSetting("admin.defaultPassword", "0");
    return done("passwordChanged");
  } catch (error) {
    console.error("[farja] changePassword failed:", error);
    return fail("genericError");
  }
}

export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return fail("unauthorized");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (confirmation !== "DELETE") return fail("genericError");

  try {
    const store = await getStore();
    await store.deleteUser(session.user.id);
    return done("accountDeleted");
  } catch (error) {
    console.error("[farja] deleteAccount failed:", error);
    return fail("genericError");
  }
}

export async function updateAdminCredentials(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return fail("forbidden");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!EMAIL_RE.test(email)) return fail("invalidEmail");
  if (newPassword && newPassword.length < 8) return fail("passwordShort");

  try {
    const store = await getStore();
    const user = await store.findUserById(session.user.id);
    if (!user) return fail("genericError");

    if (newPassword) {
      const valid = await compare(currentPassword, user.passwordHash);
      if (!valid) return fail("wrongPassword");
    }

    await store.updateUser(user.id, {
      name: name || user.name,
      email,
      ...(newPassword ? { passwordHash: await hash(newPassword, 10) } : {}),
    });
    if (newPassword) await store.setSetting("admin.defaultPassword", "0");
    return done("settingsSaved");
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") return fail("emailInUse");
    console.error("[farja] updateAdminCredentials failed:", error);
    return fail("genericError");
  }
}

export async function updateSiteSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return fail("forbidden");

  const tagline = String(formData.get("tagline") ?? "").trim().slice(0, 160);
  const announcement = String(formData.get("announcement") ?? "").trim().slice(0, 220);

  try {
    const store = await getStore();
    await store.setSetting("site.tagline", tagline);
    await store.setSetting("site.announcement", announcement);
    revalidatePath("/", "layout");
    return done("settingsSaved");
  } catch (error) {
    console.error("[farja] updateSiteSettings failed:", error);
    return fail("genericError");
  }
}

export async function setUserRole(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!id || (role !== "ADMIN" && role !== "USER")) return;
  if (id === session.user.id) return;

  const store = await getStore();
  await store.updateUser(id, { role });
  revalidatePath("/", "layout");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  if (!id || id === session.user.id) return;

  const store = await getStore();
  await store.deleteUser(id);
  revalidatePath("/", "layout");
}

export async function ensureSeedAction(): Promise<void> {
  await ensureSeeded();
  revalidatePath("/", "layout");
}
