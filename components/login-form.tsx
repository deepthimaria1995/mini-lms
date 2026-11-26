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
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setEmail("");
      setPassword("");
      router.push("/protected");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50">
        <CardHeader className="px-4 pb-4 sm:px-6">
          <CardTitle className="text-2xl text-slate-950">Log in</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your details to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6">
          <form onSubmit={handleLogin} noValidate>
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-sm font-medium text-blue-700 underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  className="h-10 border-slate-300 bg-white text-slate-950"
                  onChange={(e) => setPassword(e.target.value)}
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
                className="mt-1 h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-blue-700 underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
