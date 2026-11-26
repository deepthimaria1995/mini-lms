import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsultationsDashboard } from "@/components/consultations-dashboard";
import { Suspense } from "react";

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <ProtectedContent />
    </Suspense>
  );
}

async function ProtectedContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: consultations, error }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name,last_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("consultations")
      .select("id,reason,scheduled_at,status,created_at,updated_at")
      .eq("student_id", user.id)
      .order("scheduled_at", { ascending: true }),
  ]);

  return (
    <ConsultationsDashboard
      firstName={profile?.first_name || "Learner"}
      lastName={profile?.last_name || ""}
      initialConsultations={consultations || []}
      fetchError={error ? "Unable to load consultations." : null}
    />
  );
}
