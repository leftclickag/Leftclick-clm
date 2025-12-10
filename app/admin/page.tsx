import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { 
  Magnet, 
  Send, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  Users,
  Zap
} from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: leadMagnets } = await supabase
    .from("lead_magnets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentSubmissions } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: totalSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  const { count: activeMagnets } = await supabase
    .from("lead_magnets")
    .select("*", { count: "exact", head: true })
    .eq("active", true);

  const stats = [
    {
      title: "Aktive Lead-Magnete",
      value: activeMagnets ?? 0,
      change: "+2",
      trend: "up",
      icon: Magnet,
      color: "purple",
    },
    {
      title: "Gesamt Submissions",
      value: totalSubmissions ?? 0,
      change: "+18%",
      trend: "up",
      icon: Send,
      color: "cyan",
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "+4.3%",
      trend: "up",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      title: "Abbrüche (7d)",
      value: "12",
      change: "-8%",
      trend: "down",
      icon: AlertTriangle,
      color: "amber",
    },
  ];

  const colorClasses = {
    purple: {
      bg: "from-purple-500/20 to-purple-600/10",
      icon: "text-purple-400",
      iconBg: "bg-purple-500/20",
      glow: "shadow-purple-500/20",
    },
    cyan: {
      bg: "from-cyan-500/20 to-cyan-600/10",
      icon: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      glow: "shadow-cyan-500/20",
    },
    emerald: {
      bg: "from-emerald-500/20 to-emerald-600/10",
      icon: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      glow: "shadow-emerald-500/20",
    },
    amber: {
      bg: "from-amber-500/20 to-amber-600/10",
      icon: "text-amber-400",
      iconBg: "bg-amber-500/20",
      glow: "shadow-amber-500/20",
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg mt-2">
          Willkommen zurück! Hier ist dein Überblick.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color as keyof typeof colorClasses];
          return (
            <Card 
              key={stat.title} 
              className={`relative overflow-hidden hover-lift animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-50`} />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold tracking-tight text-foreground">{stat.value}</div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                  }`}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Magnets Card */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Neueste Lead-Magnete</CardTitle>
                  <CardDescription>
                    Deine zuletzt erstellten Lead-Magnete
                  </CardDescription>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leadMagnets?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Magnet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Noch keine Lead-Magnete erstellt</p>
                </div>
              )}
              {leadMagnets?.map((magnet, index) => (
                <div
                  key={magnet.id}
                  className="group flex items-center justify-between rounded-xl border border-border bg-secondary/30 dark:bg-white/5 p-4 transition-all duration-300 hover:border-purple-500/30 hover:bg-secondary/50 dark:hover:bg-white/10"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                      <Magnet className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors">
                        {magnet.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {magnet.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      magnet.active
                        ? "badge-success"
                        : "badge-inactive"
                    }`}
                  >
                    {magnet.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </GlowCard>

        {/* Recent Submissions Card */}
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20">
                  <Users className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Neueste Submissions</CardTitle>
                  <CardDescription>
                    Die letzten Lead-Generierungen
                  </CardDescription>
                </div>
              </div>
              <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Noch keine Submissions erhalten</p>
                </div>
              )}
              {recentSubmissions?.map((submission, index) => (
                <div
                  key={submission.id}
                  className="group flex items-center justify-between rounded-xl border border-border bg-secondary/30 dark:bg-white/5 p-4 transition-all duration-300 hover:border-cyan-500/30 hover:bg-secondary/50 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-sm font-bold text-cyan-500 dark:text-cyan-400">
                      {(submission.contact_info?.email as string)?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                        {(submission.contact_info?.email as string) ?? "Anonym"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(submission.created_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      submission.status === "completed"
                        ? "badge-info"
                        : "badge-warning"
                    }`}
                  >
                    {submission.status === "completed" ? "Abgeschlossen" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </GlowCard>
      </div>
    </div>
  );
}
