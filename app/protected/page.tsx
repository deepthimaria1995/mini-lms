import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminConsultationsDashboard } from "@/components/admin-consultations-dashboard";
import { StudentConsultationDashboard } from "@/components/student-consultation-dashboard";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    const { data: consultations, error } = await supabase
      .from("consultations")
      .select(`
        id,
        reason,
        scheduled_at,
        status,
        student:profiles!consultations_student_id_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .order("scheduled_at", { ascending: true });

    const normalizedConsultations = (consultations || []).map((consultation) => ({
      ...consultation,
      student: Array.isArray(consultation.student)
        ? consultation.student[0] || null
        : consultation.student,
    }));

    return (
      <AdminConsultationsDashboard
        consultations={normalizedConsultations}
        fetchError={error ? "Unable to load consultations." : null}
      />
    );
  }

  const { data: consultations, error } = await supabase
    .from("consultations")
    .select("id,reason,scheduled_at,status,created_at,updated_at")
    .eq("student_id", user.id)
    .order("scheduled_at", { ascending: true });

  return (
    <StudentConsultationDashboard
      firstName={profile?.first_name || "Learner"}
      lastName={profile?.last_name || ""}
      initialConsultations={consultations || []}
      fetchError={error ? "Unable to load consultations." : null}
    />
  );
}
