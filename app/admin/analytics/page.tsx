import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { 
  BarChart3, 
  Send, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Activity,
  Zap,
  Clock,
  MousePointer
} from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Get submission stats
  const { count: totalSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  const { count: completedSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { count: abandonedSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "abandoned");

  // Get recent events
  const { data: recentEvents } = await supabase
    .from("tracking_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const conversionRate =
    totalSubmissions && totalSubmissions > 0
      ? ((completedSubmissions || 0) / totalSubmissions) * 100
      : 0;

  const stats = [
    {
      title: "Gesamt Submissions",
      value: totalSubmissions ?? 0,
      icon: Send,
      color: "purple",
      description: "Alle eingegangenen Leads",
    },
    {
      title: "Abgeschlossen",
      value: completedSubmissions ?? 0,
      icon: CheckCircle,
      color: "emerald",
      description: "Erfolgreich konvertiert",
    },
    {
      title: "Abgebrochen",
      value: abandonedSubmissions ?? 0,
      icon: XCircle,
      color: "red",
      description: "Nicht fertiggestellt",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "cyan",
      description: "Erfolgsquote",
    },
  ];

  const colorClasses = {
    purple: { bg: "from-purple-500/20 to-purple-600/10", iconBg: "bg-purple-500/20", icon: "text-purple-400" },
    emerald: { bg: "from-emerald-500/20 to-emerald-600/10", iconBg: "bg-emerald-500/20", icon: "text-emerald-400" },
    red: { bg: "from-red-500/20 to-red-600/10", iconBg: "bg-red-500/20", icon: "text-red-400" },
    cyan: { bg: "from-cyan-500/20 to-cyan-600/10", iconBg: "bg-cyan-500/20", icon: "text-cyan-400" },
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes("click")) return MousePointer;
    if (eventType.includes("view")) return Activity;
    if (eventType.includes("submit")) return Send;
    return Zap;
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes("click")) return "text-purple-400";
    if (eventType.includes("view")) return "text-cyan-400";
    if (eventType.includes("submit")) return "text-emerald-400";
    return "text-amber-400";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-40" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Analytics</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Übersicht über Leads und Conversion-Metriken
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color as keyof typeof colorClasses];
          return (
            <Card 
              key={stat.title}
              className="relative overflow-hidden hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-50`} />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold tracking-tight mb-1 text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Events Section */}
      <GlowCard className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Neueste Events</CardTitle>
              <CardDescription>Die letzten Tracking-Events in Echtzeit</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Noch keine Events getrackt</p>
              </div>
            )}
            {recentEvents?.map((event, index) => {
              const EventIcon = getEventIcon(event.event_type);
              const eventColor = getEventColor(event.event_type);
              return (
                <div
                  key={event.id}
                  className="group flex items-center justify-between rounded-xl border border-border bg-secondary/30 dark:bg-white/5 p-4 transition-all duration-300 hover:border-purple-500/30 hover:bg-secondary/50 dark:hover:bg-white/10 animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary dark:bg-gradient-to-br dark:from-white/5 dark:to-white/10">
                      <EventIcon className={`h-5 w-5 ${eventColor}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors">
                        {event.event_type}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString("de-DE")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${eventColor} bg-secondary dark:bg-white/5`}>
                      Event
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </GlowCard>
    </div>
  );
}
