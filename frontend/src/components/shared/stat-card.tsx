import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type StatTone = "primary" | "warning" | "success" | "destructive" | "muted";

const toneClasses: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {hint ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>

        <div className={cn("shrink-0 rounded-xl p-2.5", toneClasses[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
