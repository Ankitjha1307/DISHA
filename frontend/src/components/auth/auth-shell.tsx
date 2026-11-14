import Link from "next/link";
import { ArrowLeft, MapPin, ShieldCheck, Siren } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-primary/10 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-40 size-80 rounded-full bg-cyan-400/10 blur-[100px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Siren className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">
              DISHA<span className="text-primary">.</span>
            </span>
            <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Humanitarian assistance
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/safety">
              <ShieldCheck />
              <span className="hidden sm:inline">Safety</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1fr_28rem] lg:items-center lg:gap-16 lg:pt-12">
        <section className="hidden lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur">
            <MapPin className="size-3.5" />
            Greater Noida demo environment
          </p>

          <h2 className="mt-6 max-w-xl text-4xl leading-tight font-bold tracking-tight">
            A clear path from a citizen report to an officer decision.
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
            Sign in to report an incident, follow its status, or review citizen
            reports in the officer console. DISHA is an academic decision-support
            prototype and does not contact emergency services.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                1
              </span>
              <span>
                <span className="font-medium">Citizens</span> report an incident
                with location and optional photo evidence.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                2
              </span>
              <span>
                <span className="font-medium">Officers</span> review, verify and
                reject reports with recorded notes.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                3
              </span>
              <span>
                A demo deployment is confirmed manually and reflected in the
                citizen&apos;s status.
              </span>
            </li>
          </ul>
        </section>

        <Card className="border-border/70 bg-background/90 shadow-xl shadow-primary/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="leading-relaxed">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent>{children}</CardContent>

          <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4 text-sm text-muted-foreground">
            {footer}
            <Button asChild variant="ghost" size="sm" className="justify-start px-0">
              <Link href="/">
                <ArrowLeft />
                Back to public site
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <p className="relative z-10 mx-auto max-w-6xl px-6 pb-6 text-center text-xs text-muted-foreground lg:text-left">
        Academic prototype · Simulated incidents and resources · Not an emergency
        service
      </p>
    </div>
  );
}
