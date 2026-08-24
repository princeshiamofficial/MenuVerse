"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export interface ModernDatePickerProps {
  value?: string; // Supports "19 Nov 2006", "YYYY-MM-DD", "MM/DD/YYYY", "Jan 2024", etc.
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  outputFormat?: "nice" | "iso" | "us";
}

// Helpers
function parseDate(input?: string): Date | null {
  if (!input || !input.trim()) return null;
  const str = input.trim();

  // Check "19 Nov 2006" or "19 November 2006" or "19-Nov-2006"
  const matchNice = str.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s-]+(\d{4})$/);
  if (matchNice) {
    const day = parseInt(matchNice[1], 10);
    const monthStr = matchNice[2].toLowerCase();
    const year = parseInt(matchNice[3], 10);
    const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(monthStr));
    if (monthIndex !== -1) {
      const date = new Date(year, monthIndex, day);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  // Check YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }

  // Check MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [m, d, y] = str.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }

  // Check "Jan 2024" or "November 2006"
  const matchMonthYear = str.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (matchMonthYear) {
    const monthStr = matchMonthYear[1].toLowerCase();
    const year = parseInt(matchMonthYear[2], 10);
    const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(monthStr));
    if (monthIndex !== -1) {
      const date = new Date(year, monthIndex, 1);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

function formatDateNice(date: Date): string {
  const d = date.getDate();
  const mStr = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const y = date.getFullYear();
  return `${d} ${mStr} ${y}`;
}

export function ModernDatePicker({
  value,
  onChange,
  placeholder = "e.g. 19 Nov 2006",
  className,
  disabled = false,
  allowClear = true,
  outputFormat = "nice",
}: ModernDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDate(value);

  // Active viewing month/year
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate || new Date());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [value, selectedDate]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Generate grid days for current viewing month
  const gridDays = React.useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] =
      [];

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Previous month days to pad
    const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(viewYear, viewMonth - 1, prevMonthLastDate - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(viewYear, viewMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      });
    }

    // Next month days to pad to 42 cells (6 rows)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(viewYear, viewMonth + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const getFormattedOutput = (d: Date) => {
    if (outputFormat === "iso") return formatDateISO(d);
    if (outputFormat === "us") return formatDateDisplay(d);
    return formatDateNice(d);
  };

  const handleSelectDay = (dayDate: Date) => {
    const formattedStr = getFormattedOutput(dayDate);
    onChange(formattedStr);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setViewDate(new Date());
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(getFormattedOutput(today));
    setViewDate(today);
    setOpen(false);
  };

  const displayString = selectedDate ? getFormattedOutput(selectedDate) : value || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <div
          className={cn(
            "relative flex items-center justify-between rounded-lg border border-neutral-300 bg-white dark:bg-card px-3 py-2 text-sm shadow-xs transition-colors hover:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 cursor-pointer min-w-40",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <input
            type="text"
            readOnly
            value={displayString}
            placeholder={placeholder}
            className="w-full bg-transparent text-neutral-800 dark:text-neutral-100 outline-none font-medium placeholder:text-neutral-400 cursor-pointer text-sm"
          />
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {allowClear && displayString && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <CalendarIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl text-neutral-800 dark:text-neutral-100 z-50 select-none"
      >
        {/* Header: Month & Year Title + Arrow Navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
              className="flex items-center gap-1 text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5 rounded"
            >
              <span>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </button>

            {/* Quick Month & Year Dropdown */}
            {showMonthYearPicker && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-xl p-2.5 z-50 space-y-2 text-xs">
                <div className="flex items-center justify-between px-1 border-b border-neutral-100 dark:border-neutral-700 pb-2">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Year</span>
                  <select
                    value={viewYear}
                    onChange={(e) => setViewDate(new Date(Number(e.target.value), viewMonth, 1))}
                    className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-xs font-bold cursor-pointer text-neutral-900 dark:text-neutral-100"
                  >
                    {Array.from({ length: 85 }, (_, i) => 1950 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {MONTH_NAMES.map((mName, idx) => (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setViewDate(new Date(viewYear, idx, 1));
                        setShowMonthYearPicker(false);
                      }}
                      className={cn(
                        "py-1.5 px-1.5 text-center rounded-md hover:bg-blue-50 dark:hover:bg-neutral-700 font-medium text-xs transition-colors",
                        idx === viewMonth && "bg-blue-600 text-white font-bold hover:bg-blue-600",
                      )}
                    >
                      {mName.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Up & Down Month Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Previous Month"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Next Month"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Weekday Labels (Su Mo Tu We Th Fr Sa) */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* 6-Row Grid of Days */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-3">
          {gridDays.map((cell, index) => {
            const dayNum = cell.date.getDate();

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectDay(cell.date)}
                className={cn(
                  "h-8 w-8 mx-auto flex items-center justify-center rounded-md font-normal transition-all text-sm leading-none",
                  cell.isCurrentMonth
                    ? "text-neutral-800 dark:text-neutral-100 font-medium hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                    : "text-neutral-400 dark:text-neutral-600 hover:text-neutral-600",
                  cell.isSelected &&
                    "bg-blue-600 text-white font-bold hover:bg-blue-600 dark:bg-blue-600 dark:text-white shadow-sm ring-2 ring-blue-700/60 rounded-md",
                  !cell.isSelected &&
                    cell.isToday &&
                    "border border-blue-500 text-blue-600 dark:text-blue-400 font-bold",
                )}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Footer Action Bar: Clear & Today Buttons */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleClear}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm px-1 py-0.5"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm px-1 py-0.5"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
