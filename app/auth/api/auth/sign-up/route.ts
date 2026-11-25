
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const input = await request.json();

    const { firstName, lastName, email, password } = input;

    // Validate field types.
    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "All fields must be valid strings" },
        { status: 400 }
      );
    }

    // Validate names.
    if (!isValidName(firstName) || !isValidName(lastName)) {
      return NextResponse.json(
        {
          error:
            "First name and last name must contain 1–50 valid characters.",
        },
        { status: 400 }
      );
    }

    // Validate email.
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Validate password.
    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must contain 12–128 characters, including uppercase, lowercase, a number and a special character.",
        },
        { status: 400 }
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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Registration successful",
        user: data.user,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to register user" },
      { status: 500 }
    );
  }
}
