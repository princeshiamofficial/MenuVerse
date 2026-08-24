import { motion } from "framer-motion";
import { Sun, Moon, Star, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

interface CoolThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { button: "w-12 h-6", thumb: "w-4 h-4", icon: "h-2.5 w-2.5", travel: 24, deco: "h-2 w-2" },
  md: {
    button: "w-16 h-8",
    thumb: "w-6 h-6",
    icon: "h-3.5 w-3.5",
    travel: 32,
    deco: "h-2.5 w-2.5",
  },
  lg: { button: "w-20 h-10", thumb: "w-8 h-8", icon: "h-4 w-4", travel: 40, deco: "h-3 w-3" },
};

export function CoolThemeToggle({ className, size = "md" }: CoolThemeToggleProps) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";
  const s = sizes[size];

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex items-center rounded-full p-1 transition-colors duration-500 overflow-hidden",
        s.button,
        isDark
          ? "bg-gradient-to-br from-indigo-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-sky-300 via-sky-200 to-amber-100",
        className,
      )}
    >
      {/* Background decorations */}
      <span className="pointer-events-none absolute inset-0">
        {/* Stars (dark) */}
        <motion.span
          className="absolute inset-0"
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <Star
            className={cn("absolute left-1.5 top-1 fill-white text-white", s.deco)}
            strokeWidth={0}
          />
          <Star
            className={cn("absolute left-4 top-2.5 fill-white/70 text-white/70", s.deco)}
            strokeWidth={0}
            style={{ transform: "scale(0.6)" }}
          />
          <Star
            className={cn("absolute left-2 bottom-1 fill-white/80 text-white/80", s.deco)}
            strokeWidth={0}
            style={{ transform: "scale(0.5)" }}
          />
        </motion.span>
        {/* Clouds (light) */}
        <motion.span
          className="absolute inset-0"
          animate={{ opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <Cloud
            className={cn("absolute right-2 top-1 fill-white text-white", s.deco)}
            strokeWidth={0}
          />
          <Cloud
            className={cn("absolute right-5 bottom-1 fill-white/80 text-white/80", s.deco)}
            strokeWidth={0}
            style={{ transform: "scale(0.7)" }}
          />
        </motion.span>
      </span>

      {/* Thumb */}
      <motion.span
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full shadow-md",
          s.thumb,
          isDark ? "bg-slate-100" : "bg-amber-400",
        )}
        animate={{ x: isDark ? s.travel : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex"
        >
          {isDark ? (
            <Moon className={cn(s.icon, "text-slate-700")} />
          ) : (
            <Sun className={cn(s.icon, "text-amber-900")} />
          )}
        </motion.span>
      </motion.span>
    </button>
  );
}
