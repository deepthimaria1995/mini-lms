import { getCurrentUser } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
} from "@/lib/api-response";

export async function GET() {
  try {
    // 1. Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse("Unauthorised", 401);
    }

    // 2. Check admin role
    if (currentUser.profile.role !== "admin") {
      return errorResponse(
        "You do not have permission to access this resource",
        403
      );
    }

    // 3. Fetch all consultations
    const { data, error } = await currentUser.supabase
      .from("consultations")
      .select(`
        id,
        reason,
        scheduled_at,
        is_completed,
        created_at,
        updated_at,
        student:profiles!consultations_student_id_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .order("scheduled_at", { ascending: true });

    if (error) {
      console.error("Admin consultation fetch failed:", error.code);

      return errorResponse(
        "Unable to retrieve consultations",
        500
      );
    }

    return successResponse(
      data,
      "All consultations retrieved successfully"
    );
  } catch (error) {
    console.error("Admin API failed:", error);
    return errorResponse("Internal server error", 500);
  }
}