"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CircleAlert,
  Flame,
  HeartPulse,
  House,
  MapPin,
  Phone,
  ShieldAlert,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { incidentCategories, recentIncidents } from "@/lib/mock-data";

const iconMap = {
  car: Car,
  flame: Flame,
  "heart-pulse": HeartPulse,
  "shield-alert": ShieldAlert,
  house: House,
  "circle-alert": CircleAlert,
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Monday, 14th September</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">Good afternoon 👋</h1>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              Greater Noida, Uttar Pradesh
            </div>
          </div>

          <Button asChild size="lg" variant="destructive">
            <Link href="/report">
              <AlertTriangle />
              Report an Incident
            </Link>
          </Button>
        </div>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="size-5 text-destructive" />
              </div>

              <div>
                <p className="font-semibold">Need immediate assistance?</p>
                <p className="text-sm text-muted-foreground">
                  Report an emergency and DISHA will help route it to the
                  appropriate response team.
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href="/report">
                Report Now
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Report an incident</h2>
            <p className="text-sm text-muted-foreground">Select an incident category to get started.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {incidentCategories.map((category) => {
              const Icon =
                iconMap[category.icon as keyof typeof iconMap];

              return (
                <Link href="/report" key={category.title}>
                  <Card className="h-full transition-colors hover:border-primary/40 hover:bg-primary/[0.02]">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Icon className="size-5" />
                      </div>

                      <div>
                        <p className="font-medium">{category.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active incident</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    INC-2026-001 · Road Accident
                  </p>
                </div>

                <Badge>Response Dispatched</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
                <span>Incident response progress</span>
                <span className="font-medium">75%</span>
              </div>

              <Progress value={75} />

              <div className="grid gap-10 text-sm sm:grid-cols-4">
                <div>
                  <p className="font-medium text-primary">Reported</p>
                  <p className="text-muted-foreground">10:32 AM</p>
                </div>

                <div>
                  <p className="font-medium text-primary">Acknowledged</p>
                  <p className="text-muted-foreground">10:34 AM</p>
                </div>

                <div>
                  <p className="font-medium text-primary">Dispatched</p>
                  <p className="text-muted-foreground">10:38 AM</p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Resolved</p>
                  <p className="text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]" id="recent-reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent reports</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your recently submitted incidents.
                  </p>
                </div>

                <Button variant="ghost" asChild>
                  <Link href="/incidents">
                    View all
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{incident.type}</p>
                        <Badge variant="outline">
                          {incident.severity}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {incident.location}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {incident.id} · {incident.date}
                      </p>
                    </div>

                    <Badge
                      variant={
                        incident.status === "Resolved"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {incident.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency contacts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick access to emergency services.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                Police
                <span className="font-semibold">112</span>
              </Button>

              <Button variant="outline" className="w-full justify-between">
                Ambulance
                <span className="font-semibold">108</span>
              </Button>

              <Button variant="outline" className="w-full justify-between">
                Fire
                <span className="font-semibold">101</span>
              </Button>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                <Phone className="size-4 text-primary" />
                <span className="text-muted-foreground">
                  Emergency services are available 24/7.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}