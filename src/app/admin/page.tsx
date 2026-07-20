import { redirect } from "next/navigation";
import { getAdminId } from "@/lib/auth";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminId = await getAdminId();
  if (!adminId) redirect("/admin/login");

  return <AdminClient />;
}
