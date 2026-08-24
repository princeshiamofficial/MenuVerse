import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 85 }, (_, i) => String(2035 - i));

interface DateDropdownPickerProps {
  value?: string;
  onChange: (val: string) => void;
  className?: string;
}

export function DateDropdownPicker({ value = "", onChange }: DateDropdownPickerProps) {
  const parsed = useMemo(() => {
    let day = "1";
    let month = "Jan";
    let year = "2026";

    if (value && value.trim()) {
      const str = value.trim();
      const matchNice = str.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s-]+(\d{4})$/);
      if (matchNice) {
        day = String(parseInt(matchNice[1], 10));
        const mStr = matchNice[2].toLowerCase();
        const foundM = MONTHS.find((m) => m.toLowerCase().startsWith(mStr));
        if (foundM) month = foundM;
        year = matchNice[3];
      } else {
        const matchISO = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (matchISO) {
          year = matchISO[1];
          const mIdx = parseInt(matchISO[2], 10) - 1;
          if (MONTHS[mIdx]) month = MONTHS[mIdx];
          day = String(parseInt(matchISO[3], 10));
        } else {
          const matchMY = str.match(/^([A-Za-z]+)\s+(\d{4})$/);
          if (matchMY) {
            const mStr = matchMY[1].toLowerCase();
            const foundM = MONTHS.find((m) => m.toLowerCase().startsWith(mStr));
            if (foundM) month = foundM;
            year = matchMY[2];
          }
        }
      }
    }
    return { day, month, year };
  }, [value]);

  const handleUpdate = (newDay: string, newMonth: string, newYear: string) => {
    onChange(`${newDay} ${newMonth} ${newYear}`);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Day Select */}
      <Select value={parsed.day} onValueChange={(v) => handleUpdate(v, parsed.month, parsed.year)}>
        <SelectTrigger className="h-9 text-xs font-semibold cursor-pointer">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {DAYS.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Select */}
      <Select value={parsed.month} onValueChange={(v) => handleUpdate(parsed.day, v, parsed.year)}>
        <SelectTrigger className="h-9 text-xs font-semibold cursor-pointer">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {MONTHS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Select */}
      <Select value={parsed.year} onValueChange={(v) => handleUpdate(parsed.day, parsed.month, v)}>
        <SelectTrigger className="h-9 text-xs font-semibold cursor-pointer">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {YEARS.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
