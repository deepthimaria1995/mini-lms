import { ForgotPasswordForm } from "@/components/forgot-password-form";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-md flex-col justify-center">
        <Link
          href="/"
          className="mb-5 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
        >
          <span aria-hidden="true">←</span>
          Return to home
        </Link>

        <Link href="/" className="mb-6 flex items-center justify-center gap-3 font-semibold text-blue-700">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            LMS
          </span>
          <span className="text-lg">Learning Portal</span>
        </Link>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
