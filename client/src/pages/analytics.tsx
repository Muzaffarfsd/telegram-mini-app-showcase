import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, Activity, TrendingUp, Clock } from "lucide-react";

type DateRange = "today" | "7days" | "30days";

const generateMockData = (range: DateRange) => {
  const days = range === "today" ? 24 : range === "7days" ? 7 : 30;
  const isHourly = range === "today";

  const totalUsersData = Array.from({ length: days }, (_, i) => ({
    name: isHourly ? `${i}:00` : `День ${i + 1}`,
    users: Math.floor(Math.random() * 500) + (isHourly ? 50 : 200) + i * 10,
  }));

  const activeUsersData = Array.from({ length: Math.min(days, 14) }, (_, i) => ({
    name: isHourly ? `${i}:00` : range === "7days" ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i] : `${i + 1}`,
    active: Math.floor(Math.random() * 300) + 100,
    new: Math.floor(Math.random() * 100) + 20,
  }));

  const funnelData = [
    { name: "Посетители", value: 10000, fill: "#10B981" },
    { name: "Регистрации", value: 6500, fill: "#34D399" },
    { name: "Активация", value: 4200, fill: "#6EE7B7" },
    { name: "Конверсия", value: 2100, fill: "#A7F3D0" },
  ];

  const topDemosData = [
    { name: "Ресторан", value: 2450, fill: "#10B981" },
    { name: "Магазин", value: 1890, fill: "#34D399" },
    { name: "Фитнес", value: 1560, fill: "#6EE7B7" },
    { name: "Красота", value: 1230, fill: "#A7F3D0" },
    { name: "Курсы", value: 980, fill: "#D1FAE5" },
  ];

  const stats = {
    totalUsers: range === "today" ? 1247 : range === "7days" ? 8456 : 34521,
    activeToday: 847,
    conversionRate: 21.4,
    avgSession: "4:32",
  };

  return { totalUsersData, activeUsersData, funnelData, topDemosData, stats };
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  suffix = "",
  trend,
}: {
  title: string;
  value: string | number;
  icon: typeof Users;
  suffix?: string;
  trend?: { value: number; positive: boolean };
}) => (
  <Card className="relative overflow-visible" data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, "-")}`}>
    <CardContent className="p-3">
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/60 truncate">{title}</p>
          <p className="text-lg font-bold text-white mt-0.5">
            {value}
            {suffix && <span className="text-sm text-white/80">{suffix}</span>}
          </p>
          {trend && (
            <p className={`text-[10px] mt-0.5 ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
              {trend.positive ? "+" : ""}{trend.value}%
            </p>
          )}
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(16, 185, 129, 0.15)" }}
        >
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-sm"
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white font-medium">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const { totalUsersData, activeUsersData, funnelData, topDemosData, stats } = generateMockData(dateRange);

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: "today", label: "Сегодня" },
    { value: "7days", label: "7 дней" },
    { value: "30days", label: "30 дней" },
  ];

  return (
    <div className="min-h-screen px-3 py-4 pb-32">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-white" data-testid="text-analytics-title">
            Аналитика
          </h1>

          <div className="flex items-center gap-1" data-testid="select-date-range">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setDateRange(option.value)}
                className={
                  dateRange === option.value
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2"
                    : "text-white/60 text-xs px-2"
                }
                data-testid={`button-range-${option.value}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Всего пользователей"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            trend={{ value: 12.5, positive: true }}
          />
          <StatCard
            title="Активных сегодня"
            value={stats.activeToday.toLocaleString()}
            icon={Activity}
            trend={{ value: 8.3, positive: true }}
          />
          <StatCard
            title="Конверсия"
            value={stats.conversionRate}
            suffix="%"
            icon={TrendingUp}
            trend={{ value: 2.1, positive: true }}
          />
          <StatCard
            title="Сред. сессия"
            value={stats.avgSession}
            icon={Clock}
          />
        </div>

        <div className="space-y-4">
          <Card data-testid="chart-total-users">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold text-white">
                Рост пользователей
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalUsersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="Пользователи"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="chart-active-users">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold text-white">
                Активность по дням
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeUsersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                    />
                    <Bar dataKey="active" name="Активные" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new" name="Новые" fill="#34D399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="chart-funnel">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold text-white">
                Воронка конверсии
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      type="number"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Пользователи" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="chart-top-demos">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold text-white">
                Топ демо
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topDemosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {topDemosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="section-insights">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-base font-semibold text-white">
              Инсайты
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-2">
              <div className="p-3 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                <p className="text-emerald-400 font-medium text-sm">Рост +12.5%</p>
                <p className="text-white/70 text-xs">
                  Новых пользователей за 7 дней
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                <p className="text-emerald-400 font-medium text-sm">Топ: Ресторан</p>
                <p className="text-white/70 text-xs">
                  Лидирует по просмотрам
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
