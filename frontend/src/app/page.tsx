"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  Activity,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Siren,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const KnowledgeParkMap = dynamic(
  () => import("@/components/landing/knowledge-park-map"),
  { ssr: false, loading: () => <div className="h-full w-full rounded-2xl bg-muted/50 animate-pulse" /> }
);

const features = [
  {
    icon: Siren,
    title: "Report incidents",
    description:
      "Report emergencies with precise locations, descriptions and photo evidence.",
    number: "01",
  },
  {
    icon: MapPin,
    title: "Location intelligence",
    description:
      "Visualize incident locations and understand where assistance may be needed.",
    number: "02",
  },
  {
    icon: Activity,
    title: "Track your reports",
    description:
      "Follow your submitted reports and see their latest recorded status.",
    number: "03",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.25, 0, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 text-foreground">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/30"
          >
            <ShieldCheck size={25} strokeWidth={2.2} />
          </motion.div>
          <div>
            <span className="block text-xl font-bold tracking-tight">
              DISHA<span className="text-primary">.</span>
            </span>
            <span className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
              HUMANITARIAN ASSISTANCE
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <motion.a
            href="#about"
            whileHover={{ y: -2 }}
            className="transition-colors hover:text-primary"
          >
            About DISHA
          </motion.a>
          <motion.a
            href="#features"
            whileHover={{ y: -2 }}
            className="transition-colors hover:text-primary"
          >
            Features
          </motion.a>
          <motion.div whileHover={{ y: -2 }}>
            <Link
              href="/safety"
              className="transition-colors hover:text-primary"
            >
              Safety guidance
            </Link>
          </motion.div>
        </div>

        <Button
          asChild
          size="lg"
          className="rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        >
          <Link href="/login" className="gap-2">
            Sign in <ArrowRight size={16} />
          </Link>
        </Button>
      </motion.nav>

      {/* Hero */}
      <section
        id="about"
        className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-20"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="pointer-events-none absolute -left-48 top-0 size-[500px] rounded-full bg-primary/10 blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="pointer-events-none absolute right-0 top-10 size-[350px] rounded-full bg-cyan-400/10 blur-[100px]"
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="relative z-10"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-xs font-semibold text-primary shadow-lg shadow-primary/5 backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            A smarter approach to disaster response
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="max-w-2xl text-5xl leading-[1.08] font-bold tracking-[-0.055em] sm:text-6xl lg:text-7xl"
          >
            When every
            <br />
            second <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">matters.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg"
          >
            One platform to report incidents, understand what is happening
            around you, and help communities connect with disaster-response
            efforts.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 text-base font-semibold shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30"
            >
              <Link href="/login">
                Enter citizen portal
                <ArrowRight
                  size={18}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-2xl border-border bg-background/80 px-8 text-base font-semibold backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-background"
            >
              <a href="#features">
                Discover DISHA <ArrowDownRight size={17} className="ml-2" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Citizen-focused
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Location-aware
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Real-time tracking
            </span>
          </motion.div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mx-auto w-full max-w-xl lg:ml-auto"
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-cyan-400/20 to-blue-600/30 blur-2xl"
          />

          <Card className="relative overflow-hidden rounded-[2rem] border-border/50 bg-background/80 p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    CITIZEN OVERVIEW
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">Your community</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="size-2 rounded-full bg-emerald-500"
                  />
                  Live
                </div>
              </div>

              <div className="relative mt-5 flex min-h-[245px] items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-cyan-400/5">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

                <div className="absolute inset-0 z-10">
                  <KnowledgeParkMap />
                </div>

                

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute bottom-4 right-4 z-20 flex items-center gap-3 rounded-xl border border-border bg-background/95 px-3 py-2.5 shadow-lg backdrop-blur"
                >
                  <span className="size-2.5 rounded-full bg-orange-500" />
                  <span className="text-xs text-foreground/80">Incident</span>
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-foreground/80">Relief</span>
                  <span className="size-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs text-foreground/80">Hub</span>
                </motion.div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck size={17} className="text-primary" />
                    <span className="text-xs">Your reports</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">Stay informed</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Follow your submissions
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap size={17} className="text-amber-500" />
                    <span className="text-xs">Quick access</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">Report now</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Share incident details
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute left-4 top-4 z-20 rounded-xl border border-border bg-background/95 px-3 py-2 shadow-md backdrop-blur"
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              <MapPin size={14} className="text-primary" />
              Knowledge Park II, Greater Noida
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Illustrative · Mock data
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature section */}
      <section id="features" className="relative border-y border-border/50 bg-background/50 py-24 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="pointer-events-none absolute left-1/4 top-0 size-[400px] rounded-full bg-primary/5 blur-[100px]"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Built around people
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
              Making the first step
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> easier.</span>
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              DISHA brings incident reporting, location awareness and report
              tracking together in one straightforward citizen experience.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div key={feature.number} variants={fadeInUp}>
                  <Card className="group h-full rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/20 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-blue-600 group-hover:text-primary-foreground"
                        >
                          <Icon size={23} />
                        </motion.div>
                        <span className="text-sm font-medium text-muted-foreground/50">
                          {feature.number}
                        </span>
                      </div>
                      <h3 className="mt-7 text-xl font-semibold tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                        Designed for citizens
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Safety section */}
      <section id="safety" className="px-6 py-20 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative mx-auto flex max-w-7xl flex-col justify-between gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 p-8 text-white shadow-2xl sm:p-12 lg:flex-row lg:items-center"
        >
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute -left-20 top-0 size-[300px] rounded-full bg-primary/20 blur-[80px]"
          />
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-300">
              <ShieldCheck size={18} /> Preparedness matters
            </div>
            <h2 className="mt-5 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Knowledge is part of every response.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Explore safety guidance and verified emergency contact
              information to help you prepare for unexpected situations.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="relative shrink-0 h-14 rounded-2xl bg-white px-8 text-base font-semibold text-slate-900 shadow-xl transition-all hover:bg-blue-50 hover:-translate-y-1"
          >
            <Link href="/safety">
              Safety guidance <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </motion.div>
      </section>

      <footer className="border-t border-border bg-background/80 px-6 py-7 backdrop-blur-sm lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-foreground">DISHA.</span> Disaster
            Intelligence System for Humanitarian Assistance
          </p>
          <p>Academic prototype · Greater Noida</p>
        </div>
      </footer>
    </main>
  );
}
