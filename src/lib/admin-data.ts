import type { Ticket, Flag, Announcement } from "./admin-context";

// -------- Static Sample Data & UI Helpers --------
export const RESTAURANTS = [
  {
    id: "r1",
    name: "MenuVerse Kitchen",
    username: "menuverse",
    cuisine: "Multi-Cuisine",
    location: "Global",
    plan: "Business",
    status: "active",
    branches: 3,
    mrr: 89,
    joined: "2025-11-12",
  },
  {
    id: "r2",
    name: "Bella Napoli",
    username: "bellanapoli",
    cuisine: "Italian",
    location: "Naples",
    plan: "Starter",
    status: "active",
    branches: 1,
    mrr: 29,
    joined: "2026-01-04",
  },
  {
    id: "r3",
    name: "Sakura Ramen",
    username: "sakuraramen",
    cuisine: "Japanese",
    location: "Tokyo",
    plan: "Business",
    status: "trial",
    branches: 2,
    mrr: 0,
    joined: "2026-06-01",
  },
  {
    id: "r4",
    name: "El Fuego",
    username: "elfuego",
    cuisine: "Mexican",
    location: "Madrid",
    plan: "Enterprise",
    status: "active",
    branches: 5,
    mrr: 299,
    joined: "2025-09-18",
  },
  {
    id: "r5",
    name: "Green Fork",
    username: "greenfork",
    cuisine: "Vegan",
    location: "Portland",
    plan: "Free",
    status: "suspended",
    branches: 1,
    mrr: 0,
    joined: "2026-02-20",
  },
];

export const USERS = [
  { id: "u1", name: "Hana Sato", email: "hana@sakura.jp", role: "Owner", lastActive: "Just now" },
  { id: "u2", name: "Priya Patel", email: "priya@bella.co", role: "Owner", lastActive: "12m ago" },
  { id: "u3", name: "Diego Gomez", email: "diego@fuego.mx", role: "Staff", lastActive: "1h ago" },
  { id: "u4", name: "Sam Green", email: "sam@greenfork.co", role: "Owner", lastActive: "3d ago" },
];

export const REVENUE_TREND = [
  { m: "Jan", mrr: 12400 },
  { m: "Feb", mrr: 13100 },
  { m: "Mar", mrr: 14250 },
  { m: "Apr", mrr: 15020 },
  { m: "May", mrr: 16340 },
  { m: "Jun", mrr: 17880 },
  { m: "Jul", mrr: 19210 },
];

export const QR_TREND = Array.from({ length: 14 }).map((_, i) => ({
  d: `D${i + 1}`,
  scans: 400 + Math.round(Math.sin(i / 2) * 120) + i * 18,
}));

export const PLAN_MIX = [
  { name: "Free", value: 620 },
  { name: "Starter", value: 240 },
  { name: "Business", value: 128 },
  { name: "Enterprise", value: 14 },
];
export const PLAN_COLORS = ["#94a3b8", "#60a5fa", "#f59e0b", "#e11d48"];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "T-2041",
    subject: "QR code not scanning on iOS",
    from: "hana@sakura.jp",
    priority: "high",
    status: "open",
    updated: "10m ago",
  },
  {
    id: "T-2039",
    subject: "Change billing plan",
    from: "priya@bella.co",
    priority: "med",
    status: "pending",
    updated: "1h ago",
  },
  {
    id: "T-2035",
    subject: "How to add a branch?",
    from: "sam@greenfork.co",
    priority: "low",
    status: "resolved",
    updated: "yesterday",
  },
  {
    id: "T-2028",
    subject: "Duplicate charge on invoice",
    from: "diego@fuego.mx",
    priority: "high",
    status: "open",
    updated: "3h ago",
  },
];

export const INITIAL_FLAGS: Flag[] = [
  {
    key: "ai_menu_writer",
    label: "AI Menu Writer",
    desc: "Generate item descriptions with AI.",
    enabled: true,
    rollout: 100,
  },
  {
    key: "table_ordering_v2",
    label: "Table Ordering v2",
    desc: "New ordering flow with cart.",
    enabled: true,
    rollout: 40,
  },
  {
    key: "advanced_analytics",
    label: "Advanced analytics",
    desc: "Cohort + funnel reporting.",
    enabled: false,
    rollout: 0,
  },
  {
    key: "print_shop",
    label: "Color Hut print shop",
    desc: "Enable print ordering module.",
    enabled: true,
    rollout: 100,
  },
  {
    key: "loyalty_beta",
    label: "Loyalty (beta)",
    desc: "Points & rewards for guests.",
    enabled: false,
    rollout: 10,
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Scheduled maintenance",
    body: "Brief downtime Sunday 3am UTC.",
    audience: "all",
    date: "2026-07-08",
    live: true,
  },
  {
    id: "a2",
    title: "New: QR analytics",
    body: "Track device, country, and language.",
    audience: "owners",
    date: "2026-06-30",
    live: false,
  },
];

export const SYSTEM_LOGS = [
  { t: "2026-07-10 09:41:22", level: "info", service: "api", msg: "POST /orders → 201 (r4)" },
  {
    t: "2026-07-10 09:40:11",
    level: "warn",
    service: "qr",
    msg: "Rate limit near threshold for r7",
  },
  {
    t: "2026-07-10 09:38:04",
    level: "error",
    service: "billing",
    msg: "Stripe webhook retry (evt_9f2)",
  },
  { t: "2026-07-10 09:36:55", level: "info", service: "auth", msg: "User u4 signed in" },
  { t: "2026-07-10 09:35:31", level: "info", service: "api", msg: "GET /menu → 200 (r2)" },
  {
    t: "2026-07-10 09:34:07",
    level: "warn",
    service: "email",
    msg: "Bounce for lena@roastroom.co",
  },
  {
    t: "2026-07-10 09:33:00",
    level: "error",
    service: "worker",
    msg: "PDF export failed job#8821",
  },
  { t: "2026-07-10 09:31:44", level: "info", service: "api", msg: "PATCH /profile → 200 (r1)" },
];

export const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
  },
};
