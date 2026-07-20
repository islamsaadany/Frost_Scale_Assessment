import { redirect } from "next/navigation";
import { getAdminId } from "@/lib/auth";
import { AccountSettings } from "./account-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const adminId = await getAdminId();
  if (!adminId) redirect("/admin/login");

  return <AccountSettings />;
}
