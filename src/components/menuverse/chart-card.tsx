import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardCard, type DashboardCardProps } from "./dashboard-card";

type Datum = Record<string, string | number>;

export type ChartCardProps = Omit<DashboardCardProps, "children"> & {
  type: "line" | "area" | "bar" | "pie";
  data: Datum[];
  xKey?: string;
  dataKey?: string;
  nameKey?: string;
  height?: number;
  colors?: string[];
  emptyLabel?: string;
};

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
];

export function ChartCard({
  type,
  data,
  xKey = "name",
  dataKey = "value",
  nameKey = "name",
  height = 240,
  colors = DEFAULT_COLORS,
  emptyLabel = "No data yet",
  ...card
}: ChartCardProps) {
  const isEmpty = !data || data.length === 0;
  const stroke = colors[0];

  const chart = useMemo(() => {
    if (isEmpty) return null;
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              fill={stroke}
              fillOpacity={0.2}
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={stroke} radius={[6, 6, 0, 0]} />
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Tooltip />
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={50} outerRadius={90}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );
    }
  }, [type, data, xKey, dataKey, nameKey, colors, stroke, isEmpty]);

  return (
    <DashboardCard {...card}>
      {isEmpty ? (
        <div
          className="flex items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground"
          style={{ height }}
        >
          {emptyLabel}
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chart!}
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}
