import { type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatCardColor =
  | "amber"
  | "teal"
  | "blue"
  | "green"
  | "violet"
  | "rose"
  | "orange"
  | "cyan"
  | "fuchsia"
  | "indigo"
  | "emerald";

const colorMap: Record<StatCardColor, { bg: string; text: string }> = {
  amber: { bg: "bg-amber-100  dark:bg-amber-500/20", text: "text-amber-600" },
  teal: { bg: "bg-teal-100   dark:bg-teal-500/20", text: "text-teal-600" },
  blue: { bg: "bg-blue-100   dark:bg-blue-500/20", text: "text-blue-600" },
  green: { bg: "bg-green-100  dark:bg-green-500/20", text: "text-green-600" },
  violet: { bg: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-600" },
  rose: { bg: "bg-rose-100   dark:bg-rose-500/20", text: "text-rose-600" },
  orange: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-600" },
  cyan: { bg: "bg-cyan-100   dark:bg-cyan-500/20", text: "text-cyan-600" },
  fuchsia: { bg: "bg-fuchsia-100 dark:bg-fuchsia-500/20", text: "text-fuchsia-600" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-500/20", text: "text-indigo-600" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-600" },
};

function getStatValueFontSize(val: string) {
  const len = String(val || "").length;
  if (len > 24) return "text-xs sm:text-xs";
  if (len > 18) return "text-xs sm:text-sm";
  if (len > 14) return "text-sm sm:text-base";
  if (len > 10) return "text-base sm:text-xl";
  return "text-[15px] sm:text-2xl";
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "teal",
  className,
  isLoading = false,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  color?: StatCardColor;
  className?: string;
  isLoading?: boolean;
}) {
  const c = colorMap[color];

  return (
    <div
      className={cn(
        "group relative overflow-hidden transition-all duration-300 font-sans",
        "bg-card p-2.5 sm:p-4 rounded-2xl sm:rounded-lg",
        "border-none sm:border sm:border-border shadow-sm sm:shadow-md",
        "hover:shadow-lg active:scale-95 sm:active:scale-100",
        className,
      )}
    >
      {/* Mobile: subtle tinted background overlay (amplifies on tap) */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03] sm:hidden transition-opacity group-active:opacity-[0.06]",
          c.bg,
        )}
      />

      {/* Content row */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center space-y-2.5 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
        {/* Icon bubble */}
        <div
          className={cn(
            "p-2.5 sm:p-3 rounded-xl sm:rounded-full shadow-sm sm:shadow-none",
            "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            c.bg,
          )}
        >
          <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", c.text)} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 w-full">
          <p className="text-[10px] sm:text-sm font-bold sm:font-medium uppercase sm:capitalize tracking-widest sm:tracking-normal text-muted-foreground/80 sm:text-muted-foreground truncate px-1">
            {label}
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center sm:justify-start px-1 mt-1">
              <Skeleton className="h-6 sm:h-7 w-20 sm:w-28 rounded-md" />
            </div>
          ) : (
            <p
              className={cn(
                "stat-card-value font-bold text-foreground font-mono mt-0.5 sm:mt-0 px-1 leading-tight truncate whitespace-nowrap",
                getStatValueFontSize(value),
              )}
              title={value}
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              {value}
            </p>
          )}
        </div>
      </div>

      {/* Mobile only: large decorative background icon (bottom-right) */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.04] sm:hidden pointer-events-none rotate-12 scale-110">
        <Icon className={cn("h-20 w-20", c.text)} />
      </div>

      {/* Mobile only: bottom shimmer line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/10 to-transparent sm:hidden" />
    </div>
  );
}
