import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
    createConsultationSchema,
} from "@/lib/validations/consultation";
import {
    errorResponse,
    successResponse,
    validationErrorResponse,
} from "@/lib/api-response";
import { parseJson } from "@/lib/parse-json";

export async function POST(request: Request) {
    try {
        // 1. Authenticate user
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return errorResponse("Unauthorised", 401);
        }

        // 2. Parse request body
        const { data: body, error: parseError } =
            await parseJson(request);

        if (parseError) {
            return errorResponse(parseError, 400);
        }

        // 3. Validate input
        const result = createConsultationSchema.safeParse(body);

        if (!result.success) {
            return validationErrorResponse(result.error);
        }

        // 4. Insert consultation
        const { data, error } = await currentUser.supabase
            .from("consultations")
            .insert({
                student_id: currentUser.user.id,
                reason: result.data.reason,
                scheduled_at: result.data.scheduled_at,
            })
            .select()
            .single();

        if (error) {
            console.error("Create consultation failed:", error.code);

            return errorResponse(
                "Unable to create consultation",
                500
            );
        }

        // 5. Return response
        return successResponse(
            data,
            "Consultation created successfully",
            201
        );
    } catch (error) {
        console.error("POST /api/consultations failed:", error);

        return errorResponse("Internal server error", 500);
    }
}

export async function GET() {
    try {
        // 1. Authenticate user
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return errorResponse("Unauthorised", 401);
        }

        // 2. Fetch consultations
        const { data, error } = await currentUser.supabase
            .from("consultations")
            .select("*")
            .order("scheduled_at", { ascending: true });

        if (error) {
            console.error("Fetch consultations failed:", error.code);

            return errorResponse(
                "Unable to fetch consultations",
                500
            );
        }

        // 3. Return accessible consultations
        return successResponse(
            data,
            "Consultations retrieved successfully"
        );
    } catch (error) {
        console.error("GET /api/consultations failed:", error);

        return errorResponse("Internal server error", 500);
    }
}