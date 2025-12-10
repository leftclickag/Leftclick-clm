"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
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
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  MousePointerClick,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Snowflake,
  Sun,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsDashboardProps {
  tenantId: string;
  leadMagnetId?: string;
}

interface DailyData {
  date: string;
  impressions: number;
  starts: number;
  completions: number;
  abandonments: number;
}

interface SourceData {
  source: string;
  leads: number;
  conversions: number;
}

interface DeviceData {
  device: string;
  count: number;
}

interface LeadScoreData {
  grade: string;
  count: number;
}

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

export function AnalyticsDashboard({
  tenantId,
  leadMagnetId,
}: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);

  // Mock data - in production, fetch from API
  const [stats, setStats] = useState({
    totalLeads: 1247,
    totalLeadsChange: 12.5,
    conversionRate: 34.2,
    conversionRateChange: 2.8,
    avgTimeToComplete: 142,
    avgTimeChange: -8.3,
    activeNow: 7,
  });

  const [dailyData, setDailyData] = useState<DailyData[]>([
    { date: "Mo", impressions: 450, starts: 180, completions: 65, abandonments: 45 },
    { date: "Di", impressions: 520, starts: 210, completions: 78, abandonments: 52 },
    { date: "Mi", impressions: 480, starts: 195, completions: 72, abandonments: 48 },
    { date: "Do", impressions: 610, starts: 245, completions: 95, abandonments: 58 },
    { date: "Fr", impressions: 680, starts: 280, completions: 112, abandonments: 65 },
    { date: "Sa", impressions: 320, starts: 125, completions: 48, abandonments: 32 },
    { date: "So", impressions: 290, starts: 110, completions: 42, abandonments: 28 },
  ]);

  const [sourceData, setSourceData] = useState<SourceData[]>([
    { source: "Google Ads", leads: 425, conversions: 156 },
    { source: "LinkedIn", leads: 312, conversions: 98 },
    { source: "Direct", leads: 245, conversions: 89 },
    { source: "Newsletter", leads: 165, conversions: 72 },
    { source: "Referral", leads: 100, conversions: 45 },
  ]);

  const [deviceData, setDeviceData] = useState<DeviceData[]>([
    { device: "Desktop", count: 680 },
    { device: "Mobile", count: 420 },
    { device: "Tablet", count: 147 },
  ]);

  const [scoreData, setScoreData] = useState<LeadScoreData[]>([
    { grade: "hot", count: 145 },
    { grade: "warm", count: 467 },
    { grade: "cold", count: 635 },
  ]);

  const [funnelData] = useState([
    { stage: "Impressionen", value: 3350, percent: 100 },
    { stage: "Gestartet", value: 1345, percent: 40.1 },
    { stage: "In Bearbeitung", value: 892, percent: 26.6 },
    { stage: "Abgeschlossen", value: 512, percent: 15.3 },
  ]);

  useEffect(() => {
    // Simulate loading
    setIsLoading(false);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        activeNow: Math.max(0, prev.activeNow + Math.floor(Math.random() * 3) - 1),
        totalLeads: prev.totalLeads + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveUpdating]);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Desktop":
        return Monitor;
      case "Mobile":
        return Smartphone;
      case "Tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getScoreColor = (grade: string) => {
    switch (grade) {
      case "hot":
        return "#EF4444";
      case "warm":
        return "#F59E0B";
      case "cold":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getScoreIcon = (grade: string) => {
    switch (grade) {
      case "hot":
        return Flame;
      case "warm":
        return Sun;
      case "cold":
        return Snowflake;
      default:
        return Target;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-500">Echtzeit-Übersicht deiner Lead-Performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Letzte 24h</SelectItem>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={isLiveUpdating ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLiveUpdating(!isLiveUpdating)}
            className={isLiveUpdating ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLiveUpdating ? "animate-spin" : ""}`}
            />
            {isLiveUpdating ? "Live" : "Live Updates"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gesamt Leads"
          value={stats.totalLeads.toLocaleString("de-DE")}
          change={stats.totalLeadsChange}
          icon={Users}
          color="indigo"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change={stats.conversionRateChange}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Ø Abschlusszeit"
          value={`${Math.floor(stats.avgTimeToComplete / 60)}:${String(
            stats.avgTimeToComplete % 60
          ).padStart(2, "0")}`}
          change={stats.avgTimeChange}
          icon={Clock}
          color="purple"
          invertChange
        />
        <MetricCard
          title="Gerade Aktiv"
          value={stats.activeNow.toString()}
          icon={MousePointerClick}
          color="orange"
          isLive
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead-Entwicklung</CardTitle>
            <CardDescription>Impressionen, Starts und Conversions über Zeit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  name="Impressionen"
                  stroke="#6366F1"
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  name="Abschlüsse"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorCompletions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Von Impression bis Conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-gray-500">
                      {stage.value.toLocaleString("de-DE")} ({stage.percent}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stage.percent}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Traffic-Quellen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  dataKey="source"
                  type="category"
                  stroke="#9CA3AF"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="leads" name="Leads" fill="#6366F1" radius={[0, 4, 4, 0]} />
                <Bar
                  dataKey="conversions"
                  name="Conversions"
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geräte-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {deviceData.map((item, index) => {
                const Icon = getDeviceIcon(item.device);
                return (
                  <div key={item.device} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {item.device} ({item.count})
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lead Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Lead-Qualität</CardTitle>
            <CardDescription>Verteilung nach Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreData.map((score) => {
                const Icon = getScoreIcon(score.grade);
                const total = scoreData.reduce((sum, s) => sum + s.count, 0);
                const percent = ((score.count / total) * 100).toFixed(1);

                return (
                  <div key={score.grade} className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${getScoreColor(score.grade)}20` }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: getScoreColor(score.grade) }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium capitalize">{score.grade}</span>
                        <span className="text-sm text-gray-500">
                          {score.count} ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: getScoreColor(score.grade),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Events could go here */}
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: "indigo" | "green" | "purple" | "orange";
  invertChange?: boolean;
  isLive?: boolean;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  invertChange = false,
  isLive = false,
}: MetricCardProps) {
  const colorClasses = {
    indigo: "bg-indigo-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  const isPositive = change !== undefined && (invertChange ? change < 0 : change > 0);
  const isNegative = change !== undefined && (invertChange ? change > 0 : change < 0);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change !== undefined && (
              <div
                className={`flex items-center mt-2 text-sm ${
                  isPositive
                    ? "text-green-600"
                    : isNegative
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : isNegative ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : null}
                <span>
                  {Math.abs(change)}% vs. Vorwoche
                </span>
              </div>
            )}
            {isLive && (
              <div className="flex items-center mt-2 text-sm text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                Live
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

