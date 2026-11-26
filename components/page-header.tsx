import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function PageHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  const userId = typeof user.sub === "string" ? user.sub : null;
  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", userId)
        .maybeSingle()
    : { data: null };

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-700">
        Hey, {fullName || "Learner"}
      </span>
      <LogoutButton />
    </div>
  );
}
