"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50">
          <CardHeader className="px-4 pt-4 text-center sm:px-6">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
              ✓
            </div>
            <CardTitle className="text-2xl text-slate-950">
              Check your email
            </CardTitle>
            <CardDescription className="text-slate-500">
              Password reset instructions sent
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6 text-center sm:px-6">
            <p className="mb-5 text-sm leading-6 text-slate-600">
              If an account exists for this email, you will receive a password
              reset link.
            </p>
            <Button
              asChild
              className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50">
          <CardHeader className="px-4 pb-4 sm:px-6">
            <CardTitle className="text-2xl text-slate-950">
              Reset your password
            </CardTitle>
            <CardDescription className="text-slate-500">
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6 sm:px-6">
            <form onSubmit={handleForgotPassword} noValidate>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    className="h-10 border-slate-300 bg-white text-slate-950 placeholder:text-slate-500"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <p
                    className="rounded-md bg-red-50 p-3 text-sm text-red-700"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-700 underline-offset-4 hover:underline"
                >
                  Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
