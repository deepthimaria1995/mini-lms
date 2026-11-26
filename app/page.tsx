import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-svh bg-white text-slate-950">
      <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold text-blue-700">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            LMS
          </span>
          <span>Learning Portal</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-slate-700">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-blue-600">
            One place for every learner
          </p>
          <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Learning Management System
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-slate-600">
            Organize, track and manage your learning consultations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 bg-blue-600 px-6 text-white hover:bg-blue-700">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 border-slate-300 px-6 text-slate-700 hover:bg-slate-50">
              <Link href="/auth/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
