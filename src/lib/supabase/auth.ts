import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
}

/**
 * Server-side helper to verify that the incoming request belongs
 * to an authenticated user who possesses an active record in admin_profiles.
 */
export async function verifyAdminSession(): Promise<AdminSession | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, role, active")
      .eq("auth_user_id", user.id)
      .eq("active", true)
      .in("role", ["admin", "super_admin"])
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || "",
      role: profile.role,
    };
  } catch (error) {
    console.error("Admin session verification error:", error);
    return null;
  }
}
