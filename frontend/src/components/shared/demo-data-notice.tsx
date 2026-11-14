import { FlaskConical } from "lucide-react";

export function DemoDataNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm">
      <FlaskConical
        className="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <p className="leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Demo data.</span>{" "}
        {children}
      </p>
    </div>
  );
}
