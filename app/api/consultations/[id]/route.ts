import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
    consultationIdSchema,
    updateConsultationSchema,
} from "@/lib/validations/consultation";
import {
    errorResponse,
    successResponse,
    validationErrorResponse,
} from "@/lib/api-response";
import { parseJson } from "@/lib/parse-json";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return errorResponse("Unauthorised", 401);
        }

        const { id } = await params;

        const idResult = consultationIdSchema.safeParse(id);

        if (!idResult.success) {
            return errorResponse("Invalid consultation ID", 400);
        }

        const { data, error } = await currentUser.supabase
            .from("consultations")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            console.error("Fetch consultation failed:", error.code);
            return errorResponse("Unable to fetch consultation", 500);
        }

        if (!data) {
            return errorResponse("Consultation not found", 404);
        }

        return successResponse(data);
    } catch (error) {
        console.error("GET consultation failed:", error);
        return errorResponse("Internal server error", 500);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return errorResponse("Unauthorised", 401);
        }

        const { id } = await params;

        const idResult = consultationIdSchema.safeParse(id);

        if (!idResult.success) {
            return errorResponse("Invalid consultation ID", 400);
        }
        
        const { data: body, error: parseError } =
            await parseJson(request);

        if (parseError) {
            return errorResponse(parseError, 400);
        }

        // Validate the supplied fields
        const result = updateConsultationSchema.safeParse(body);

        if (!result.success) {
            return validationErrorResponse(result.error);
        }

        // Update only the supplied fields.
        const { data, error } = await currentUser.supabase
            .from("consultations")
            .update({
                ...result.data,
            })
            .eq("id", id)
            .select()
            .maybeSingle();

        if (error) {
            console.error("Update consultation failed:", error.code);
            return errorResponse("Unable to update consultation", 500);
        }

        if (!data) {
            return errorResponse("Consultation not found", 404);
        }

        return successResponse(
            data,
            "Consultation updated successfully"
        );
    } catch (error) {
        console.error("PATCH consultation failed:", error);
        return errorResponse("Internal server error", 500);
    }
}
