import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function BloodTag({ group, className }: { group: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-11 items-center justify-center rounded-lg bg-blood px-2 py-1 font-display text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      {group}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    critical: "bg-critical text-critical-foreground animate-pulse-ring",
    urgent: "bg-urgent text-urgent-foreground",
    standard: "bg-secondary text-secondary-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        styles[urgency] ?? styles["standard"],
      )}
    >
      {t(urgency)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    pending: "border-urgent text-urgent",
    in_progress: "border-primary text-primary",
    fulfilled: "border-success text-success",
    expired: "border-muted-foreground text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status] ?? styles["pending"],
      )}
    >
      {t(status)}
    </span>
  );
}
