"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminCookie, isAdmin, keyMatches, setAdminCookie } from "@/lib/auth";
import { deleteRsvp } from "@/lib/store";

export async function login(formData) {
  if (!keyMatches(String(formData.get("key") || ""))) redirect("/admin?error=1");
  await setAdminCookie();
  redirect("/admin");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/admin");
}

export async function remove(formData) {
  if (!(await isAdmin())) redirect("/admin");
  await deleteRsvp(String(formData.get("id") || ""));
  revalidatePath("/admin");
}
