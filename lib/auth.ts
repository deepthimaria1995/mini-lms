import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, first_name, last_name, role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    return null;
  }

  return { user, profile };
}