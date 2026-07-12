import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "accent" | "accent2" | "warn" | "danger";
}) {
  return (
    <div className="card card-hover">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</div>
      <div
        className={cn(
          "mt-2 text-4xl font-semibold tracking-tight",
          accent === "accent2" && "text-accent2",
          accent === "warn" && "text-warn",
          accent === "danger" && "text-danger",
          (!accent || accent === "accent") && "heading-gradient"
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}
