import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createWaiterRequestServer } from "@/lib/db-queries.server";
import type { WaiterRequestType } from "@/lib/db-queries.server";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/{$restaurantUsername}-{$branchId}-{$tableNo}")({
  head: ({ params }) => ({
    meta: [
      {
        title: `Table ${params.tableNo} — ${params.restaurantUsername}`,
      },
      {
        name: "description",
        content: `Order from table ${params.tableNo} at ${params.restaurantUsername} (branch ${params.branchId}).`,
      },
      { name: "robots", content: "noindex" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { name: "theme-color", content: "#0f172a" },
    ],
  }),
  component: TableLandingPage,
});

const REQUEST_TYPES: {
  type: WaiterRequestType;
  emoji: string;
  label: string;
  sublabel: string;
  gradient: string;
  ring: string;
}[] = [
  {
    type: "call",
    emoji: "🔔",
    label: "Call Waiter",
    sublabel: "Need assistance",
    gradient: "from-violet-500 to-indigo-600",
    ring: "ring-violet-400/40",
  },
  {
    type: "water",
    emoji: "💧",
    label: "Water Please",
    sublabel: "Refill water",
    gradient: "from-sky-400 to-cyan-600",
    ring: "ring-sky-400/40",
  },
  {
    type: "bill",
    emoji: "🧾",
    label: "Request Bill",
    sublabel: "Ready to pay",
    gradient: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-400/40",
  },
];

function ElapsedTag({ submittedAt }: { submittedAt: Date }) {
  const [, forceUpdate] = useState(0);
  const secs = Math.floor((Date.now() - submittedAt.getTime()) / 1000);

  // Force re-render every second
  if (typeof window !== "undefined") {
    setTimeout(() => forceUpdate((n) => n + 1), 1000);
  }

  if (secs < 60) return <span>{secs}s ago</span>;
  return <span>{Math.floor(secs / 60)}m ago</span>;
}

function TableLandingPage() {
  const { restaurantUsername, branchId, tableNo } = Route.useParams();

  const [loading, setLoading] = useState<WaiterRequestType | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [submitted, setSubmitted] = useState<{
    type: WaiterRequestType;
    at: Date;
  } | null>(null);

  const displayName = restaurantUsername
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  async function handleRequest(type: WaiterRequestType, note?: string) {
    setLoading(type);
    try {
      await createWaiterRequestServer({
        data: {
          restaurantUsername,
          branchId,
          tableNo,
          type,
          note: note || undefined,
        },
      });
      setSubmitted({ type, at: new Date() });
      setShowCustom(false);
      setCustomNote("");
    } catch {
      toast.error("Could not send request. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const successLabels: Record<WaiterRequestType, string> = {
    call: "Waiter is on the way!",
    water: "Water is coming!",
    bill: "Bill is being prepared!",
    custom: "Your request was sent!",
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-start px-4 py-8 sm:py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-125 w-125 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header card */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl shadow-2xl">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 text-3xl shadow-lg shadow-violet-500/30">
            🍽️
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Welcome! You&apos;re seated.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-xs text-slate-400">Branch</span>
              <span className="text-xs font-semibold text-white">{branchId}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
              <span className="text-xs text-slate-400">Table</span>
              <span className="text-sm font-black text-violet-300">{tableNo}</span>
            </div>
          </div>
        </div>

        {/* Success State */}
        {submitted && (
          <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center backdrop-blur">
            <div className="mb-1 text-2xl">✅</div>
            <p className="font-semibold text-emerald-300">{successLabels[submitted.type]}</p>
            <p className="mt-1 text-xs text-slate-400">
              Sent <ElapsedTag submittedAt={submitted.at} /> • Table {tableNo}
            </p>
            <button
              onClick={() => setSubmitted(null)}
              className="mt-3 rounded-full bg-white/8 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/15"
            >
              Send another request
            </button>
          </div>
        )}

        {/* Quick Action Buttons */}
        {!submitted && (
          <>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-slate-500">
              Quick Actions
            </p>
            <div className="space-y-3">
              {REQUEST_TYPES.map(({ type, emoji, label, sublabel, gradient, ring }) => (
                <button
                  key={type}
                  id={`request-btn-${type}`}
                  disabled={loading !== null}
                  onClick={() => handleRequest(type)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-2xl p-px transition-all duration-200",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "active:scale-[0.97]",
                    loading === type && "animate-pulse",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl bg-linear-to-r opacity-80",
                      gradient,
                    )}
                  />
                  <div
                    className={cn(
                      "relative flex items-center gap-4 rounded-2xl bg-slate-900/70 px-5 py-4 backdrop-blur-sm",
                      "ring-1",
                      ring,
                      "group-hover:bg-slate-900/50 transition-colors",
                    )}
                  >
                    <span className="text-2xl leading-none">{emoji}</span>
                    <div className="text-left">
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-xs text-slate-400">{sublabel}</p>
                    </div>
                    <div className="ml-auto">
                      {loading === type ? (
                        <svg
                          className="h-5 w-5 animate-spin text-white/60"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-white/40 group-hover:text-white/80 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {/* Custom request toggle */}
              <button
                id="request-btn-custom"
                disabled={loading !== null}
                onClick={() => setShowCustom((v) => !v)}
                className={cn(
                  "w-full rounded-2xl border border-white/10 bg-white/4 py-3 text-sm text-slate-400 transition",
                  "hover:border-white/20 hover:text-slate-300 disabled:opacity-50",
                )}
              >
                ✏️ &nbsp;Custom request...
              </button>

              {showCustom && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <textarea
                    id="custom-note-input"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Describe your request…"
                    rows={3}
                    maxLength={200}
                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30"
                  />
                  <button
                    id="custom-send-btn"
                    disabled={loading !== null || customNote.trim().length === 0}
                    onClick={() => handleRequest("custom", customNote.trim())}
                    className="mt-2.5 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
                  >
                    {loading === "custom" ? "Sending…" : "Send Request"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer hint */}
        <p className="mt-8 text-center text-xs text-slate-600">
          Powered by <span className="text-slate-500">aMenuVerse</span>
        </p>
      </div>
    </main>
  );
}
