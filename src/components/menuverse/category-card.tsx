import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlobImg } from "@/components/ui/blob-img";

export type CategoryCardProps = {
  name: string;
  itemCount?: number;
  icon?: LucideIcon;
  image?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export function CategoryCard({
  name,
  itemCount,
  icon: Icon,
  image,
  active,
  onClick,
  className,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass group flex flex-col items-center gap-3 rounded-2xl p-4 text-center shadow-card transition hover:shadow-elegant",
        active && "ring-2 ring-primary",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl",
          active ? "gradient-warm text-primary-foreground shadow-glow" : "bg-muted",
        )}
      >
        {image ? (
          <BlobImg src={image} alt={name} className="h-full w-full object-cover" />
        ) : Icon ? (
          <Icon className="h-6 w-6" />
        ) : (
          <span className="font-display text-lg font-bold">{name[0]}</span>
        )}
      </span>
      <div>
        <div className="font-display text-sm font-semibold">{name}</div>
        {itemCount !== undefined && (
          <div className="text-xs text-muted-foreground">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </button>
  );
}
