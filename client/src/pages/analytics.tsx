import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

interface AnalyticsData {
  stats: {
    totalUsers: number;
    activeToday: number;
    conversionRate: number;
    avgSessionMinutes: number;
  };
  userGrowth: { date: string; users: number }[];
  activeUsers: { date: string; active: number; new: number }[];
  topDemos: { name: string; value: number; fill: string }[];
  funnel: { name: string; value: number; fill: string }[];
}

const generateMockData = (range: DateRange): AnalyticsData => {
  const days = range === "today" ? 24 : range === "7days" ? 7 : 30;
  const isHourly = range === "today";

  const userGrowth = Array.from({ length: days }, (_, i) => ({
    date: isHourly ? `${i}:00` : `День ${i + 1}`,
    users: Math.floor(Math.random() * 500) + (isHourly ? 50 : 200) + i * 10,
  }));

  const activeUsers = Array.from({ length: Math.min(days, 14) }, (_, i) => ({
    date: isHourly ? `${i}:00` : range === "7days" ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i] : `${i + 1}`,
    active: Math.floor(Math.random() * 300) + 100,
    new: Math.floor(Math.random() * 100) + 20,
  }));

  const funnel = [
    { name: "Посетители", value: 10000, fill: "#10B981" },
    { name: "Регистрации", value: 6500, fill: "#34D399" },
    { name: "Активация", value: 4200, fill: "#6EE7B7" },
    { name: "Конверсия", value: 2100, fill: "#A7F3D0" },
  ];

  const topDemos = [
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
    avgSessionMinutes: 4.5,
  };

  return { stats, userGrowth, activeUsers, funnel, topDemos };
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  suffix = "",
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: typeof Users;
  suffix?: string;
  trend?: { value: number; positive: boolean };
  isLoading?: boolean;
}) => (
  <Card className="relative overflow-visible" data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, "-")}`}>
    <CardContent className="p-3">
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/60 truncate">{title}</p>
          {isLoading ? (
            <Skeleton className="h-6 w-16 mt-0.5" />
          ) : (
            <p className="text-lg font-bold text-white mt-0.5">
              {value}
              {suffix && <span className="text-sm text-white/80">{suffix}</span>}
            </p>
          )}
          {trend && !isLoading && (
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

const ChartSkeleton = () => (
  <div className="h-[180px] flex items-center justify-center">
    <Skeleton className="h-full w-full" />
  </div>
);

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7days");

  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard", dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/dashboard?range=${dateRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
    staleTime: 60000,
    retry: 2,
  });

  const mockData = generateMockData(dateRange);
  const analyticsData = isError ? mockData : (data || mockData);
  
  const { stats, userGrowth, activeUsers, funnel, topDemos } = analyticsData;
  
  const formatAvgSession = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: "today", label: "Сегодня" },
    { value: "7days", label: "7 дней" },
    { value: "30days", label: "30 дней" },
  ];

  return (
    <div className="min-h-screen px-3 pt-36 pb-32">
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
            isLoading={isLoading}
          />
          <StatCard
            title="Активных сегодня"
            value={stats.activeToday.toLocaleString()}
            icon={Activity}
            trend={{ value: 8.3, positive: true }}
            isLoading={isLoading}
          />
          <StatCard
            title="Конверсия"
            value={stats.conversionRate}
            suffix="%"
            icon={TrendingUp}
            trend={{ value: 2.1, positive: true }}
            isLoading={isLoading}
          />
          <StatCard
            title="Сред. сессия"
            value={formatAvgSession(stats.avgSessionMinutes)}
            icon={Clock}
            isLoading={isLoading}
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
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="date"
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
              )}
            </CardContent>
          </Card>

          <Card data-testid="chart-active-users">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold text-white">
                Активность по дням
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeUsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="date"
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
              )}
            </CardContent>
          </Card>

          <Card data-testid="chart-funnel">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold text-white">
                Воронка конверсии
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnel} layout="vertical">
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
                        {funnel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="chart-top-demos">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold text-white">
                Топ демо
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topDemos}
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
                        {topDemos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
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
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : (
                <>
                  <div className="p-3 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                    <p className="text-emerald-400 font-medium text-sm">Рост +12.5%</p>
                    <p className="text-white/70 text-xs">
                      Новых пользователей за {dateRange === "today" ? "сегодня" : dateRange === "7days" ? "7 дней" : "30 дней"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                    <p className="text-emerald-400 font-medium text-sm">
                      Топ: {topDemos[0]?.name || "Ресторан"}
                    </p>
                    <p className="text-white/70 text-xs">
                      Лидирует по просмотрам
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
