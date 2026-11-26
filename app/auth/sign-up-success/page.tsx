import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-md flex-col justify-center">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-3 font-semibold text-blue-700"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            LMS
          </span>
          <span className="text-lg">Learning Portal</span>
        </Link>

        <Card className="border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50">
          <CardHeader className="px-4 pt-4 text-center sm:px-6">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
              ✓
            </div>
            <CardTitle className="text-2xl text-slate-950">
              Successfully signed up
            </CardTitle>
            <CardDescription className="text-slate-500">
              Your account is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6 text-center sm:px-6">
            <p className="mb-6 text-sm leading-6 text-slate-600">
              You have successfully signed up. Log in to access your account.
            </p>
            <Button
              asChild
              className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
