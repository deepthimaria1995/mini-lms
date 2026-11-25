import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function successResponse(
  data: unknown,
  message = "Request successful",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export function validationErrorResponse(error: ZodError) {
  return errorResponse(
    "Validation failed",
    400,
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }))
  );
}