"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  HeartPulse,
  Home,
  MapPin,
  Phone,
  ShieldCheck,
  Siren,
  Users,
  AlertTriangle,
  LifeBuoy,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
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

const steps = [
  {
    number: "01",
    title: "Stay Aware",
    description:
      "Stay informed about your surroundings. Pay attention to weather alerts, local news, and community advisories, especially during monsoon or extreme weather in Greater Noida.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Report Incidents",
    description:
      "Use DISHA's report form to document emergencies with location, description, and optional photo evidence. Provide clear details to help others understand the situation.",
    icon: Siren,
  },
  {
    number: "03",
    title: "Share Location",
    description:
      "Mark the incident location accurately. Use the map or manual location to help identify the affected area. In case of location permission issues, provide a nearby landmark.",
    icon: MapPin,
  },
  {
    number: "04",
    title: "Track & Follow Up",
    description:
      "Monitor your reports in 'My Reports'. The status will update as the information is reviewed in this demo environment. Remember: this is a prototype, not a live dispatch system.",
    icon: FileText,
  },
];

const disasterGuides = [
  {
    title: "Fire Emergency",
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
    doList: [
      "Raise the alarm and alert others nearby.",
      "Evacuate immediately using the nearest safe exit. Do not use elevators.",
      "Call emergency services if safe to do so.",
      "Stay low to avoid smoke inhalation.",
    ],
    dontList: [
      "Don't go back inside for belongings.",
      "Don't use water on electrical fires.",
      "Don't hide; move to a designated assembly point.",
    ],
  },
  {
    title: "Road Accident",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    doList: [
      "Ensure your own safety first and switch on hazard lights.",
      "Call for medical/traffic assistance if needed.",
      "Document the scene safely if possible.",
      "Report via DISHA with location and description.",
    ],
    dontList: [
      "Don't move seriously injured people unless there's immediate danger.",
      "Don't leave the scene without reporting if it's your responsibility.",
      "Don't argue on the road; prioritize safety.",
    ],
  },
  {
    title: "Flooding / Waterlogging",
    icon: LifeBuoy,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    doList: [
      "Move to higher ground immediately.",
      "Disconnect electrical appliances if safe.",
      "Avoid walking/driving through flooded areas.",
      "Keep emergency supplies and ID documents ready.",
    ],
    dontList: [
      "Don't wade through floodwater (hidden hazards/electrocution risk).",
      "Don't stay in basement/ground floor if water rising.",
      "Don't touch electrical poles/equipment in wet areas.",
    ],
  },
  {
    title: "Medical Emergency",
    icon: HeartPulse,
    color: "text-red-600",
    bg: "bg-red-500/10",
    doList: [
      "Check responsiveness and breathing; call for help immediately.",
      "Keep the person calm and in a safe position.",
      "Follow first-aid basics you're trained in.",
      "Report location clearly via DISHA or call local emergency numbers.",
    ],
    dontList: [
      "Don't leave the person alone if serious.",
      "Don't give food/water to an unconscious person.",
      "Don't guess treatments beyond your training.",
    ],
  },
];

const emergencyContacts = [
  { name: "Police", number: "112", description: "National emergency number" },
  { name: "Ambulance", number: "108", description: "Medical emergency" },
  { name: "Fire", number: "101", description: "Fire & rescue" },
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 text-foreground">
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

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/report" className="transition-colors hover:text-primary">
            Report Incident
          </Link>
        </div>

        <Button
          asChild
          size="lg"
          className="rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        >
          <Link href="/dashboard" className="gap-2">
            Open portal <ArrowRight size={16} />
          </Link>
        </Button>
      </motion.nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10 lg:pb-24 lg:pt-16">
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
          className="relative z-10 max-w-4xl"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-xs font-semibold text-primary shadow-lg shadow-primary/5 backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Learn · Prepare · Respond
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl leading-[1.08] font-bold tracking-[-0.055em] sm:text-5xl lg:text-6xl"
          >
            How to use <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">DISHA</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg"
          >
            A simple guide for citizens in Greater Noida on using the DISHA prototype to report incidents, stay aware,
            and take safe actions during emergencies. This platform is for demonstration only — it is not a live emergency
            dispatch service.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-6">
              <Link href="/report">
                Report an Incident <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* How to use steps */}
      <section className="relative border-y border-border/50 bg-background/50 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Step by step</p>
            <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Using DISHA in 4 simple steps
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Follow these steps to report incidents quickly and responsibly.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 md:grid-cols-2"
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.number} variants={fadeInUp}>
                  <Card className="group h-full rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                    <CardContent className="p-7">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-blue-600 group-hover:text-primary-foreground">
                            <Icon size={22} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground">STEP {step.number}</p>
                            <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 leading-7 text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Disaster guides */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Important steps during disaster</p>
            <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              What to do in common emergencies
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              General safety guidance for the Greater Noida demo environment. Adapt to local instructions when available.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 lg:grid-cols-2"
          >
            {disasterGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <motion.div key={guide.title} variants={fadeInUp}>
                  <Card className="h-full rounded-3xl border-border/50 shadow-sm transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-11 items-center justify-center rounded-2xl ${guide.bg} ${guide.color}`}>
                          <Icon size={21} />
                        </div>
                        <CardTitle className="text-xl">{guide.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={16} />
                          Do
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {guide.doList.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-1.5 size-1.5 rounded-full bg-emerald-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                          <AlertTriangle size={16} />
                          Don't
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {guide.dontList.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-1.5 size-1.5 rounded-full bg-red-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Emergency contacts */}
      <section className="border-y border-border/50 bg-background/50 px-6 py-20 backdrop-blur-sm lg:px-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Emergency contacts</p>
              <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                Verified quick contacts
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                These are widely used emergency numbers in India. DISHA is a prototype and does not directly call these
                services — use them directly when in immediate danger.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-2 text-sm text-muted-foreground">
              <Phone size={16} className="text-primary" />
              Available 24/7
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {emergencyContacts.map((contact) => (
              <Card key={contact.name} className="rounded-2xl border-border/50">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                  <Badge className="text-base">{contact.number}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative mx-auto flex max-w-7xl flex-col justify-between gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 p-8 text-white shadow-2xl sm:p-12 lg:flex-row lg:items-center"
        >
          <motion.div
            animate={{
              x: [0, 80, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute -left-20 top-0 size-[280px] rounded-full bg-primary/20 blur-[80px]"
          />
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-300">
              <Users size={18} /> Be prepared, stay safe
            </div>
            <h2 className="mt-5 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Ready to report or learn more?
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Head to the citizen portal to report an incident, or explore your dashboard to track reports. Every second
              matters — act responsibly and safely.
            </p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-2xl bg-white px-8 text-base font-semibold text-slate-900 shadow-xl transition-all hover:bg-blue-50 hover:-translate-y-1"
            >
              <Link href="/dashboard">
                Enter citizen portal <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-2xl border-white/40 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/20 hover:-translate-y-1"
            >
              <Link href="/report">Report an incident</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-border bg-background/80 px-6 py-7 backdrop-blur-sm lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-foreground">DISHA.</span> Disaster Intelligence System for Humanitarian Assistance
          </p>
          <p>Academic prototype · Greater Noida</p>
        </div>
      </footer>
    </main>
  );
}
