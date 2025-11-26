import { createClient as createServerClient } from "@/lib/supabase/server"

export async function checkAdminAuth() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { isAdmin: false, user: null }
  }

  // Check if user is in admin_profiles
  const { data: adminProfile } = await supabase.from("admin_profiles").select("*").eq("id", user.id).single()

  return {
    isAdmin: adminProfile?.is_admin === true,
    user,
    adminProfile,
  }
}
