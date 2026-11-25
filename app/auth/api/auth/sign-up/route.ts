
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { parseJson } from "@/lib/parse-json";

function isValidName(value: string): boolean {
  const name = value.trim();

  return (
    name.length >= 1 &&
    name.length <= 50 &&
    /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(name)
  );
}

function isValidEmail(value: string): boolean {
  const email = value.trim();

  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  );
}

function isValidPassword(password: string): boolean {
  const length = [...password].length;

  return (
    length >= 12 &&
    length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function POST(request: Request) {
  try {
    const { data: body, error: parseError } =
      await parseJson(request);

    if (parseError) {
      return errorResponse(parseError, 400);
    }

    const { firstName, lastName, email, password } = body;

    // Validate field types.
    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return errorResponse("All fields must be valid strings", 400);
    }

    // Validate names.
    if (!isValidName(firstName) || !isValidName(lastName)) {
      return errorResponse(
        "First name and last name must contain 1–50 valid characters.",
        400
      );
    }

    // Validate email.
    if (!isValidEmail(email)) {
      return errorResponse("Please provide a valid email address.", 400);
    }

    // Validate password.
    if (!isValidPassword(password)) {
      return errorResponse(
        "Password must contain 12–128 characters, including uppercase, lowercase, a number and a special character.",
        400
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse({
      message: "Registration successful",
      user: data.user,
      status: 201
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to register user" },
      { status: 500 }
    );
  }
}
