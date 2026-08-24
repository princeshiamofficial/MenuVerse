import { createFileRoute } from "@tanstack/react-router";
import { useAdminContext } from "@/lib/admin-context";
import { KpiCard } from "../admin";
import { REVENUE_TREND, PLAN_MIX, PLAN_COLORS, tooltipStyle, USERS } from "@/lib/admin-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Store, CreditCard, DollarSign, Users } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardIndexComponent,
});

function DashboardIndexComponent() {
  const { restaurantsList } = useAdminContext();

  const totalRestaurants = restaurantsList.length;
  const activeSubs = restaurantsList.filter(
    (r) => r.status === "active" && r.plan !== "Free",
  ).length;
  const mrr = restaurantsList.reduce((s, r) => s + (r.mrr || 0), 0);
  const totalUsers = USERS.length + 1200;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Restaurants"
          value={String(totalRestaurants)}
          delta="+18 this week"
          icon={Store}
          tone="warm"
        />
        <KpiCard
          label="Active subs"
          value={String(activeSubs)}
          delta="+6.4% MoM"
          icon={CreditCard}
          tone="cool"
        />
        <KpiCard
          label="MRR"
          value={`$${mrr.toLocaleString()}`}
          delta="+$1,240"
          icon={DollarSign}
          tone="mint"
        />
        <KpiCard
          label="Users"
          value={totalUsers.toLocaleString()}
          delta="+112 today"
          icon={Users}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-base font-semibold">MRR trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="mrrFillDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="hsl(var(--primary))"
                  fill="url(#mrrFillDashboard)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="glass rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-base font-semibold">Plan distribution</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PLAN_MIX}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {PLAN_MIX.map((_, i) => (
                    <Cell key={i} fill={PLAN_COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
