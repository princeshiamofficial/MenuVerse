import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  defaultValue = "",
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = "Search…",
  className,
}: SearchInputProps) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const current = controlled ? value! : inner;

  useEffect(() => {
    if (!onDebouncedChange) return;
    const t = setTimeout(() => onDebouncedChange(current), debounceMs);
    return () => clearTimeout(t);
  }, [current, debounceMs, onDebouncedChange]);

  const set = (v: string) => {
    if (!controlled) setInner(v);
    onChange?.(v);
  };

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={current}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {current && (
        <button
          type="button"
          onClick={() => set("")}
          aria-label="Clear"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
