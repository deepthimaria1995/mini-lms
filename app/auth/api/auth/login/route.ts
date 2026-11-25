import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { parseJson } from "@/lib/parse-json";

export async function POST(request: Request) {
  try {
    const { data: body, error: parseError } =
      await parseJson(request);

    if (parseError) {
      return errorResponse(parseError, 400);
    }
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const supabase = await createClient();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return errorResponse("Invalid email or password", 401);
    }

    return successResponse({
      message: "Login successful",
      user: data.user,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to log in" },
      { status: 500 }
    );
  }
}