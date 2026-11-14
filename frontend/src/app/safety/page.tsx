import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Backpack,
  Building2,
  Car,
  Check,
  ChevronDown,
  ExternalLink,
  Flame,
  HeartPulse,
  Home,
  Info,
  LifeBuoy,
  MapPin,
  Phone,
  ShieldCheck,
  Siren,
  Waves,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DemoDataNotice } from "@/components/shared/demo-data-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Safety guidance | DISHA",
  description:
    "Emergency contact information and preparedness guidance for the DISHA academic prototype.",
};

const emergencyContacts = [
  {
    number: "112",
    label: "Unified emergency",
    description: "Police, fire or medical emergency — start here.",
    urgent: true,
  },
  {
    number: "108",
    label: "Ambulance",
    description: "Emergency medical response listed by UP-112.",
    urgent: true,
  },
  {
    number: "101",
    label: "Fire and rescue",
    description: "Fire, rescue and related emergencies.",
    urgent: true,
  },
  {
    number: "102",
    label: "Additional ambulance line",
    description: "Second ambulance number listed by UP-112.",
    urgent: false,
  },
  {
    number: "1070",
    label: "Disaster helpline",
    description: "State disaster-management helpline.",
    urgent: false,
  },
  {
    number: "1098",
    label: "Child helpline",
    description: "Support for children in distress.",
    urgent: false,
  },
  {
    number: "1090",
    label: "Women and child security",
    description: "UP Women Power Line / women's helpline.",
    urgent: false,
  },
  {
    number: "1033",
    label: "Highway assistance",
    description: "NHAI helpline for national-highway issues.",
    urgent: false,
  },
];

const preparednessGuides = [
  {
    id: "fire",
    title: "Fire",
    icon: Flame,
    accent: "text-orange-600 bg-orange-500/10 dark:text-orange-300",
    summary:
      "Raise the alarm, leave the building and stay low under smoke. Call 101 or 112 once you are safe.",
    dos: [
      "Raise the alarm so others know there is a fire.",
      "Leave by the nearest safe exit and stay low under smoke.",
      "Close doors behind you to slow the spread of fire.",
      "Call 101 or 112 once you are outside and safe.",
      "If your clothes catch fire, stop, drop and roll.",
    ],
    donts: [
      "Do not go back inside for belongings or pets.",
      "Do not use lifts during a fire evacuation.",
      "Do not use water on an electrical fire.",
      "Do not open a door that feels hot to the touch.",
    ],
  },
  {
    id: "road-accident",
    title: "Road accident",
    icon: Car,
    accent: "text-amber-600 bg-amber-500/10 dark:text-amber-300",
    summary:
      "Protect the scene, call 112 or 108 and share the exact location. Do not move seriously injured people unless there is immediate danger.",
    dos: [
      "Stop in a safe place, switch on hazard lights and warn traffic.",
      "Call 112 or 108 and share the road, landmark and direction of travel.",
      "Check whether anyone is responsive and breathing.",
      "Give first aid only if you are trained and it is safe to do so.",
      "Keep the injured person warm and calm while help is arranged.",
    ],
    donts: [
      "Do not move a seriously injured person unless there is immediate danger.",
      "Do not crowd the injured person or block emergency access.",
      "Do not give food or water to an unconscious person.",
      "Do not stand in a live traffic lane to take photos or videos.",
    ],
  },
  {
    id: "flooding",
    title: "Flooding or waterlogging",
    icon: Waves,
    accent: "text-blue-600 bg-blue-500/10 dark:text-blue-300",
    summary:
      "Move to higher ground and avoid floodwater. Water can hide open drains, sharp debris and live electrical hazards.",
    dos: [
      "Move to higher ground as soon as water starts rising.",
      "Follow local weather and administration updates.",
      "Switch off electricity at the main switch only if it is safe to reach.",
      "Keep documents, medicines, a torch and drinking water ready.",
      "Stay away from electric poles and fallen power lines.",
    ],
    donts: [
      "Do not walk or drive through moving floodwater.",
      "Do not let children play in or near floodwater.",
      "Do not touch electrical equipment that has been in contact with water.",
      "Do not return to a flooded basement or ground floor while water is rising.",
    ],
  },
  {
    id: "building-damage",
    title: "Building damage",
    icon: Building2,
    accent: "text-slate-600 bg-slate-500/10 dark:text-slate-300",
    summary:
      "Leave the building if it is safe to do so, keep clear of loose structures and call 112. Do not re-enter until authorities say it is safe.",
    dos: [
      "Evacuate calmly using stairs if the building is still safe to leave.",
      "Keep away from walls, balconies, glass and hanging debris.",
      "Call 112 and report the address, visible damage and anyone trapped.",
      "Warn neighbours only if you can do so without entering danger.",
      "Follow instructions from local authorities and emergency responders.",
    ],
    donts: [
      "Do not re-enter a damaged building for belongings.",
      "Do not shelter directly under cracked walls or leaning structures.",
      "Do not use lifts or touch damaged wiring.",
      "Do not spread unverified claims about the extent of the damage.",
    ],
  },
  {
    id: "medical",
    title: "Medical emergency",
    icon: HeartPulse,
    accent: "text-red-600 bg-red-500/10 dark:text-red-300",
    summary:
      "Call 108 or 112 immediately for a medical emergency. Keep the person still and monitor breathing while you wait for help.",
    dos: [
      "Call 108 or 112 and give the exact location and nearest landmark.",
      "Check whether the person responds and is breathing normally.",
      "Keep the person still, warm and as comfortable as possible.",
      "Start CPR only if you are trained and the person is not breathing normally.",
      "Stay with the person until help arrives, if it is safe to do so.",
    ],
    donts: [
      "Do not leave a seriously unwell person alone.",
      "Do not give food or drink to an unconscious person.",
      "Do not move someone with a suspected spinal injury unless there is immediate danger.",
      "Do not delay the emergency call to search for information online.",
    ],
  },
  {
    id: "other",
    title: "Other incidents",
    icon: LifeBuoy,
    accent: "text-cyan-600 bg-cyan-500/10 dark:text-cyan-300",
    summary:
      "If there is immediate danger, call 112 first. If it is safe, note the location and report the incident clearly.",
    dos: [
      "Move yourself and others away from immediate danger.",
      "Call 112 if anyone is injured, trapped or at risk.",
      "Note the nearest landmark, road and direction to help responders.",
      "Report only what you saw or know to be true.",
      "Keep a safe distance and let trained responders take over.",
    ],
    donts: [
      "Do not put yourself in danger to get a better view or photo.",
      "Do not block access routes used by emergency vehicles.",
      "Do not share another person's private information unnecessarily.",
      "Do not treat a DISHA report as a call for emergency help.",
    ],
  },
];

const preparednessKit = [
  "Drinking water for at least three days",
  "Battery torch and spare batteries",
  "Charged power bank and phone cable",
  "Basic first-aid kit and regular medicines",
  "Copies of important documents",
  "Whistle, mask and a small radio",
  "Emergency contact list on paper",
  "Some cash and a warm layer",
];

const sources = [
  {
    name: "Uttar Pradesh Police — UP-112 emergency contact information",
    href: "https://112.up.gov.in/emergencycontactinformation",
    detail:
      "Source for 112, 108, 102, 101, 1070, 1090, 1098 and 1033.",
  },
  {
    name: "National Disaster Management Authority — Do's and Don'ts",
    href: "https://ndma.gov.in/",
    detail:
      "Source for the fire, flood, earthquake and general preparedness guidance.",
  },
  {
    name: "NDMA — Pocketbook of Do's and Don'ts",
    href: "https://ndma.gov.in/sites/default/files/PDF/pocketbook-do-dont.pdf",
    detail:
      "Reference booklet for incident-specific do's and don'ts.",
  },
];

export default function SafetyPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="block text-xl font-bold tracking-tight">
              DISHA<span className="text-primary">.</span>
            </span>
            <span className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
              HUMANITARIAN ASSISTANCE
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/">
              <Home />
              Home
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/explore">
              Explore DISHA
              <ArrowRight />
            </Link>
          </Button>
          <ThemeToggle />
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard">
              Open portal
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-14 pt-8 lg:px-10 lg:pb-20 lg:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-48 top-0 size-[420px] rounded-full bg-primary/10 blur-[120px]"
        />

        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-background/70 text-primary">
              <ShieldCheck />
              Verified emergency information
            </Badge>
            <Badge variant="secondary">Greater Noida, Uttar Pradesh</Badge>
          </div>

          <h1 className="mt-6 text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl">
            Prepare before you need help.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Know the right number to call, what to do in the first few minutes
            and how to report an incident to the DISHA demo without putting
            yourself at risk.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/report-incident">
                <Siren />
                Report an incident
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="#emergency-contacts">
                <Phone />
                Emergency contacts
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-destructive">
                In immediate danger, call 112 first.
              </p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                DISHA is an academic prototype. It does not contact emergency
                services, dispatch real help or guarantee that an officer will
                see a report immediately.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border bg-background/70 p-4 text-sm backdrop-blur">
            <Info
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Calling comes first.
              </span>{" "}
              Use DISHA to document an incident for the demo workflow, not as a
              replacement for a phone call.
            </p>
          </div>
        </div>
      </section>

      <section
        id="emergency-contacts"
        aria-labelledby="emergency-contacts-heading"
        className="scroll-mt-8 border-y border-border/60 bg-background/70 py-16 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                Emergency contacts
              </p>
              <h2
                id="emergency-contacts-heading"
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Numbers to call directly
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Verified against the Uttar Pradesh Police UP-112 emergency
                contact page on 14 November 2026. Phone numbers can change —
                confirm locally before relying on them.
              </p>
            </div>

            <Button asChild variant="outline" className="shrink-0 rounded-full">
              <a
                href="https://112.up.gov.in/emergencycontactinformation"
                target="_blank"
                rel="noreferrer"
              >
                View official source
                <ExternalLink />
              </a>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={
                      contact.urgent
                        ? "flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                        : "flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    }
                  >
                    <Phone className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-bold tracking-tight">
                    {contact.number}
                  </span>
                </div>

                <p className="mt-4 font-semibold">{contact.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {contact.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  Tap to call
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="call-or-report-heading" className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Choose the right action
            </p>
            <h2
              id="call-or-report-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Call first, report when it is safe
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              A DISHA report is a record for a simulated coordination workflow.
              It does not start a real response.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="border-destructive/25 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <Phone className="size-5" aria-hidden="true" />
                  <CardTitle className="text-lg">Call 112 or 108 now</CardTitle>
                </div>
                <CardDescription>
                  Use a phone call when life, safety or property is at
                  immediate risk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Someone is injured, trapped or not breathing.",
                    "There is active fire, smoke or a gas leak.",
                    "Water is rising quickly or a structure is collapsing.",
                    "A road accident is blocking traffic or causing injury.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-destructive"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/25 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Siren className="size-5" aria-hidden="true" />
                  <CardTitle className="text-lg">
                    Report in DISHA when safe
                  </CardTitle>
                </div>
                <CardDescription>
                  Use the demo report form to document an incident for the
                  citizen-to-officer workflow.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm">
                  {[
                    "You are not in immediate danger.",
                    "You can add a useful description and location.",
                    "You want to track the report's demo status.",
                    "You have already called emergency services if needed.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/report-incident">
                    Open the report form
                    <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="preparedness-heading"
        className="border-y border-border/60 bg-background/60 py-16 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Preparedness guidance
            </p>
            <h2
              id="preparedness-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              What to do by incident type
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              General guidance adapted from NDMA&apos;s Do&apos;s and
              Don&apos;ts. It does not replace training, local instructions or
              professional emergency advice.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {preparednessGuides.map((guide) => {
              const Icon = guide.icon;

              return (
                <details
                  key={guide.id}
                  className="group rounded-2xl border bg-card shadow-sm open:border-primary/30 open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${guide.accent}`}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{guide.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {guide.summary}
                      </span>
                    </span>

                    <ChevronDown
                      className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>

                  <div className="grid gap-5 border-t px-5 py-5 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        <Check className="size-4" aria-hidden="true" />
                        Do
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                        {guide.dos.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check
                              className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                        <X className="size-4" aria-hidden="true" />
                        Don&apos;t
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                        {guide.donts.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <X
                              className="mt-0.5 size-3.5 shrink-0 text-destructive"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="kit-heading" className="py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-10">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Be prepared
            </p>
            <h2
              id="kit-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Keep a small readiness kit
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              A few basic items can help your household act calmly during a
              disruption. Check expiry dates and batteries regularly.
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Local tip:
                </span>{" "}
                know the nearest landmark to your home and workplace so you can
                describe a location clearly during a call or a DISHA report.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Backpack className="size-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-lg">Household checklist</CardTitle>
              </div>
              <CardDescription>
                Not a substitute for official emergency kits or local advice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {preparednessKit.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        aria-labelledby="sources-heading"
        className="border-t border-border/60 bg-background/70 py-16 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                Sources and limits
              </p>
              <h2
                id="sources-heading"
                className="mt-3 text-3xl font-bold tracking-tight"
              >
                Where this information comes from
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Emergency numbers were checked against the official UP-112
                page. Preparedness guidance is adapted from NDMA material.
                DISHA does not independently verify that a service is available
                in your area at a given time.
              </p>

              <DemoDataNotice>
                Incident records, officer decisions and resource deployments in
                DISHA are simulated for an academic project.
              </DemoDataNotice>
            </div>

            <ul className="space-y-3">
              {sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {source.name}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {source.detail}
                      </span>
                    </span>
                    <ExternalLink
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background/80 px-6 py-7 backdrop-blur-sm lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-foreground">DISHA.</span> Disaster
            Intelligence System for Humanitarian Assistance
          </p>
          <p>
            Academic prototype · Greater Noida · Not an emergency service
          </p>
        </div>
      </footer>
    </main>
  );
}
