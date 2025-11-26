import { redirect } from "next/navigation"
import { checkAdminAuth } from "@/lib/admin-auth"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminPage() {
  const { isAdmin } = await checkAdminAuth()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  return <AdminDashboard />
}
