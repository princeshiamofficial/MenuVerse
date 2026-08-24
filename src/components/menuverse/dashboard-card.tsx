import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function DashboardCard({
  title,
  description,
  icon: Icon,
  actions,
  footer,
  className,
  children,
}: DashboardCardProps) {
  return (
    <section className={cn("glass flex flex-col rounded-2xl p-5 shadow-card", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-warm text-primary-foreground">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <h3 className="font-display text-base font-semibold">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </header>
      {children && <div className="mt-4 flex-1">{children}</div>}
      {footer && <div className="mt-4 border-t border-border/60 pt-3 text-sm">{footer}</div>}
    </section>
  );
}
