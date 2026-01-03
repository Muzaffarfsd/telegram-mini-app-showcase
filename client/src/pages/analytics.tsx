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
import { useLanguage } from "@/contexts/LanguageContext";

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

const NoDataPlaceholder = ({ message = "No data" }: { message?: string }) => (
  <div className="h-[180px] flex flex-col items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>
    <Activity className="w-8 h-8 mb-2 opacity-50" />
    <p className="text-sm">{message}</p>
  </div>
);

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
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{title}</p>
          {isLoading ? (
            <Skeleton className="h-6 w-16 mt-0.5" />
          ) : (
            <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {value}
              {suffix && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{suffix}</span>}
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
        className="analytics-tooltip rounded-lg px-3 py-2 text-sm"
        style={{
          background: 'var(--tooltip-bg, rgba(0, 0, 0, 0.85))',
          border: '1px solid var(--tooltip-border, rgba(255, 255, 255, 0.1))',
          backdropFilter: "blur(10px)",
        }}
      >
        <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-medium" style={{ color: 'var(--text-primary)' }}>
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
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>("7days");

  const { data, isLoading } = useQuery<AnalyticsData>({
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

  const emptyData: AnalyticsData = {
    stats: { totalUsers: 0, activeToday: 0, conversionRate: 0, avgSessionMinutes: 0 },
    userGrowth: [],
    activeUsers: [],
    funnel: [],
    topDemos: [],
  };
  
  const analyticsData = data || emptyData;
  
  const { stats, userGrowth, activeUsers, funnel, topDemos } = analyticsData;
  
  const formatAvgSession = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const dateRangeOptions: { value: DateRange; labelKey: string }[] = [
    { value: "today", labelKey: "analyticsPage.dateRange.today" },
    { value: "7days", labelKey: "analyticsPage.dateRange.days7" },
    { value: "30days", labelKey: "analyticsPage.dateRange.days30" },
  ];

  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case "today": return t("analyticsPage.dateRange.today");
      case "7days": return t("analyticsPage.dateRange.days7");
      case "30days": return t("analyticsPage.dateRange.days30");
    }
  };

  return (
    <div className="analytics-page min-h-screen px-3 pb-32" style={{ paddingTop: '160px' }}>
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }} data-testid="text-analytics-title">
            {t("analyticsPage.title")}
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
                    : "text-xs px-2"
                }
                data-testid={`button-range-${option.value}`}
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title={t("analyticsPage.stats.totalUsers")}
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            trend={{ value: 12.5, positive: true }}
            isLoading={isLoading}
          />
          <StatCard
            title={t("analyticsPage.stats.activeToday")}
            value={stats.activeToday.toLocaleString()}
            icon={Activity}
            trend={{ value: 8.3, positive: true }}
            isLoading={isLoading}
          />
          <StatCard
            title={t("analyticsPage.stats.conversion")}
            value={stats.conversionRate}
            suffix="%"
            icon={TrendingUp}
            trend={{ value: 2.1, positive: true }}
            isLoading={isLoading}
          />
          <StatCard
            title={t("analyticsPage.stats.avgSession")}
            value={formatAvgSession(stats.avgSessionMinutes)}
            icon={Clock}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-4">
          <Card data-testid="chart-total-users">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t("analyticsPage.charts.userGrowth")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {isLoading ? (
                <ChartSkeleton />
              ) : userGrowth.length === 0 ? (
                <NoDataPlaceholder message={t("analyticsPage.charts.noGrowthData")} />
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
                        name={t("analyticsPage.charts.users")}
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
              <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t("analyticsPage.charts.dailyActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {isLoading ? (
                <ChartSkeleton />
              ) : activeUsers.length === 0 ? (
                <NoDataPlaceholder message={t("analyticsPage.charts.noActivityData")} />
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
                      <Bar dataKey="active" name={t("analyticsPage.charts.active")} fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="new" name={t("analyticsPage.charts.new")} fill="#34D399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="chart-funnel">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t("analyticsPage.charts.conversionFunnel")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {isLoading ? (
                <ChartSkeleton />
              ) : funnel.length === 0 ? (
                <NoDataPlaceholder message={t("analyticsPage.charts.noConversionData")} />
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
                      <Bar dataKey="value" name={t("analyticsPage.charts.users")} radius={[0, 4, 4, 0]}>
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
              <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t("analyticsPage.charts.topDemos")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {isLoading ? (
                <ChartSkeleton />
              ) : topDemos.length === 0 ? (
                <NoDataPlaceholder message={t("analyticsPage.charts.noDemoData")} />
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
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t("analyticsPage.insights.title")}
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
                  <div className="analytics-insight p-3 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                    <p className="text-emerald-400 font-medium text-sm">{t("analyticsPage.insights.growth")} +12.5%</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {t("analyticsPage.insights.newUsersFor")} {getDateRangeLabel(dateRange).toLowerCase()}
                    </p>
                  </div>
                  <div className="analytics-insight p-3 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                    <p className="text-emerald-400 font-medium text-sm">
                      {t("analyticsPage.insights.top")}: {topDemos[0]?.name || (language === 'ru' ? "Ресторан" : "Restaurant")}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {t("analyticsPage.insights.leadsInViews")}
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
