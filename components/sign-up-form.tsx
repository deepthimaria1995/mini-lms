"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "password" | "repeatPassword", string>
>;

function isValidName(value: string): boolean {
  const name = value.trim();
  return (
    name.length >= 1 &&
    name.length <= 50 &&
    /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(name)
  );
}

function validateField(field: keyof FieldErrors, values: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
}): string | undefined {
  if (field === "firstName") {
    return isValidName(values.firstName)
      ? undefined
      : "First name must contain 1–50 valid characters.";
  }
  if (field === "lastName") {
    return isValidName(values.lastName)
      ? undefined
      : "Last name must contain 1–50 valid characters.";
  }
  if (field === "email") {
    const email = values.email.trim();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
      ? undefined
      : "Please provide a valid email address.";
  }
  if (field === "password") {
    const length = [...values.password].length;
    const valid =
      length >= 12 &&
      length <= 128 &&
      /[a-z]/.test(values.password) &&
      /[A-Z]/.test(values.password) &&
      /[0-9]/.test(values.password) &&
      /[^A-Za-z0-9]/.test(values.password);
    return valid
      ? undefined
      : "Password must contain 12–128 characters, including uppercase, lowercase, a number and a special character.";
  }
  if (!values.repeatPassword) return "Please repeat your password.";
  return values.repeatPassword === values.password
    ? undefined
    : "Passwords do not match.";
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const values = { firstName, lastName, email, password, repeatPassword };

  const validateFieldAndSet = (field: keyof FieldErrors) => {
    const message = validateField(field, values);
    setFieldErrors((current) => ({ ...current, [field]: message }));
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fields: (keyof FieldErrors)[] = [
      "firstName",
      "lastName",
      "email",
      "password",
      "repeatPassword",
    ];
    const nextErrors: FieldErrors = {};
    fields.forEach((field) => {
      const message = validateField(field, values);
      if (message) nextErrors[field] = message;
    });
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/auth/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message || "Unable to create account.");
      }

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      setFieldErrors({});
      router.push("/auth/sign-up-success");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle className="text-2xl text-slate-950">Create your account</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your details to start learning
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6">
          <form onSubmit={handleSignUp} noValidate>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 items-start gap-x-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="text-slate-700">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    placeholder="Jane"
                    autoComplete="given-name"
                    maxLength={50}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    className="h-10 border-slate-300 bg-white text-slate-950 placeholder:text-slate-500"
                    onChange={(event) => setFirstName(event.target.value)}
                    onBlur={() => validateFieldAndSet("firstName")}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-sm text-red-600" role="alert">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="text-slate-700">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    placeholder="Doe"
                    autoComplete="family-name"
                    maxLength={50}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    className="h-10 border-slate-300 bg-white text-slate-950 placeholder:text-slate-500"
                    onChange={(event) => setLastName(event.target.value)}
                    onBlur={() => validateFieldAndSet("lastName")}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-sm text-red-600" role="alert">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  autoComplete="email"
                  value={email}
                  maxLength={254}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className="h-10 border-slate-300 bg-white text-slate-950 placeholder:text-slate-500"
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => validateFieldAndSet("email")}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-600" role="alert">{fieldErrors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  maxLength={128}
                  aria-invalid={Boolean(fieldErrors.password)}
                  className="h-10 border-slate-300 bg-white text-slate-950 placeholder:text-slate-500"
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() => validateFieldAndSet("password")}
                />
                <p className="text-xs text-slate-500">12+ characters with uppercase, lowercase, a number, and a symbol.</p>
                {fieldErrors.password && (
                  <p className="text-sm text-red-600" role="alert">{fieldErrors.password}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-slate-700">Repeat password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  autoComplete="new-password"
                  value={repeatPassword}
                  maxLength={128}
                  aria-invalid={Boolean(fieldErrors.repeatPassword)}
                  className="h-10 border-slate-300 bg-white text-slate-950 placeholder:text-slate-500"
                  onChange={(event) => setRepeatPassword(event.target.value)}
                  onBlur={() => validateFieldAndSet("repeatPassword")}
                />
                {fieldErrors.repeatPassword && (
                  <p className="text-sm text-red-600" role="alert">{fieldErrors.repeatPassword}</p>
                )}
              </div>

              {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
              <Button type="submit" className="mt-1 h-10 w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-blue-700 underline-offset-4 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
