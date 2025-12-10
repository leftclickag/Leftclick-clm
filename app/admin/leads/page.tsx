"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import {
  Contact,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  ExternalLink,
  Trash2,
  Search,
  Filter,
  FileText,
  Calculator,
  ListChecks,
  HelpCircle,
} from "lucide-react";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"all" | "completed" | "in_progress" | "started" | "abandoned">("all");
  const [search, setSearch] = useState("");
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState<string | undefined>();

  const utils = trpc.useUtils();

  // Lade Leads
  const { data: leadsData, isLoading } = trpc.leads.list.useQuery({
    page,
    pageSize: 20,
    status,
    leadMagnetId: selectedLeadMagnet,
  });

  // Lade Statistiken
  const { data: stats } = trpc.leads.stats.useQuery();

  // Lade Lead-Magnete für Filter
  const { data: leadMagnets } = trpc.leadMagnets.list.useQuery();

  // Delete Mutation
  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.leads.stats.invalidate();
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Lead wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      deleteLead.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      completed: {
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: "Abgeschlossen",
      },
      in_progress: {
        color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "In Bearbeitung",
      },
      started: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Gestartet",
      },
      abandoned: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: "Abgebrochen",
      },
    };

    const config = statusConfig[status] || statusConfig.started;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getLeadMagnetIcon = (type: string) => {
    switch (type) {
      case "ebook":
        return <FileText className="h-4 w-4" />;
      case "calculator":
        return <Calculator className="h-4 w-4" />;
      case "checklist":
        return <ListChecks className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4 text-muted-foreground" />;
      case "tablet":
        return <Tablet className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Monitor className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const colorClasses = {
    purple: { bg: "from-purple-500/20 to-purple-600/10", iconBg: "bg-purple-500/20", icon: "text-purple-400" },
    emerald: { bg: "from-emerald-500/20 to-emerald-600/10", iconBg: "bg-emerald-500/20", icon: "text-emerald-400" },
    amber: { bg: "from-amber-500/20 to-amber-600/10", iconBg: "bg-amber-500/20", icon: "text-amber-400" },
    cyan: { bg: "from-cyan-500/20 to-cyan-600/10", iconBg: "bg-cyan-500/20", icon: "text-cyan-400" },
  };

  const statsData = [
    {
      title: "Gesamt Leads",
      value: stats?.totalLeads ?? 0,
      icon: Contact,
      color: "purple",
      description: "Alle eingegangenen Leads",
    },
    {
      title: "Abgeschlossen",
      value: stats?.completedLeads ?? 0,
      icon: CheckCircle,
      color: "emerald",
      description: "Erfolgreich konvertiert",
    },
    {
      title: "Letzte 7 Tage",
      value: stats?.recentLeads ?? 0,
      icon: TrendingUp,
      color: "cyan",
      description: "Neue Leads diese Woche",
    },
    {
      title: "Abgebrochen",
      value: stats?.abandonedLeads ?? 0,
      icon: XCircle,
      color: "amber",
      description: "Nicht fertiggestellt",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-40" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <Contact className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Leads</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Übersicht aller eingegangenen Leads
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const colors = colorClasses[stat.color as keyof typeof colorClasses];
          return (
            <Card
              key={stat.title}
              className="relative overflow-hidden hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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

      {/* Lead-Magnete Stats */}
      {stats?.leadsByMagnet && stats.leadsByMagnet.length > 0 && (
        <GlowCard className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="text-lg">Leads nach Lead-Magnet</CardTitle>
            <CardDescription>Verteilung der abgeschlossenen Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.leadsByMagnet.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/30 dark:bg-white/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                    {getLeadMagnetIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlowCard>
      )}

      {/* Filter */}
      <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach E-Mail oder Name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value: any) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="started">Gestartet</SelectItem>
                <SelectItem value="abandoned">Abgebrochen</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedLeadMagnet || "all"}
              onValueChange={(value) => {
                setSelectedLeadMagnet(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-64">
                <FileText className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lead-Magnet filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Lead-Magnete</SelectItem>
                {leadMagnets?.map((lm: any) => (
                  <SelectItem key={lm.id} value={lm.id}>
                    {lm.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <GlowCard className="animate-fade-in overflow-hidden" style={{ animationDelay: "0.5s" }}>
        <CardHeader>
          <CardTitle className="text-lg">Alle Leads</CardTitle>
          <CardDescription>
            {leadsData?.total ?? 0} Leads gefunden
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
              Lädt Leads...
            </div>
          ) : !leadsData?.leads.length ? (
            <div className="p-12 text-center text-muted-foreground">
              <Contact className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine Leads gefunden</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50 dark:bg-white/5 border-y border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Kontakt
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lead-Magnet
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Quelle
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Gerät / Standort
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Datum
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leadsData.leads.map((lead: any, index: number) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-secondary/30 dark:hover:bg-white/5 transition-colors animate-fade-in"
                        style={{ animationDelay: `${0.6 + index * 0.03}s` }}
                      >
                        {/* Kontakt */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {lead.contactInfo?.name && (
                              <p className="font-medium text-foreground">{lead.contactInfo.name}</p>
                            )}
                            {lead.contactInfo?.email && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                {lead.contactInfo.email}
                              </div>
                            )}
                            {lead.contactInfo?.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                {lead.contactInfo.phone}
                              </div>
                            )}
                            {!lead.contactInfo?.email && !lead.contactInfo?.name && (
                              <span className="text-sm text-muted-foreground italic">Keine Daten</span>
                            )}
                          </div>
                        </td>

                        {/* Lead-Magnet */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                              {getLeadMagnetIcon(lead.leadMagnet?.type)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{lead.leadMagnet?.title || "Unbekannt"}</p>
                              <p className="text-sm text-muted-foreground capitalize">{lead.leadMagnet?.type}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(lead.status)}
                        </td>

                        {/* Quelle */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {lead.utmSource && (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                                <span className="text-foreground">{lead.utmSource}</span>
                              </div>
                            )}
                            {lead.utmMedium && (
                              <span className="text-xs text-muted-foreground">{lead.utmMedium}</span>
                            )}
                            {lead.utmCampaign && (
                              <span className="text-xs px-2 py-0.5 rounded bg-secondary dark:bg-white/10 text-muted-foreground">
                                {lead.utmCampaign}
                              </span>
                            )}
                            {!lead.utmSource && !lead.referrer && (
                              <span className="text-sm text-muted-foreground">Direkt</span>
                            )}
                          </div>
                        </td>

                        {/* Gerät / Standort */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(lead.deviceType)}
                            <div className="space-y-0.5">
                              {lead.browser && (
                                <p className="text-sm text-foreground">{lead.browser}</p>
                              )}
                              {(lead.city || lead.country) && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {[lead.city, lead.country].filter(Boolean).join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Datum */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">
                            {new Date(lead.createdAt).toLocaleDateString("de-DE")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Aktionen */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                              onClick={() => handleDelete(lead.id)}
                              disabled={deleteLead.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {leadsData && leadsData.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-secondary/30 dark:bg-white/5">
                  <div className="text-sm text-muted-foreground">
                    Seite {page} von {leadsData.totalPages} ({leadsData.total} Leads)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Zurück
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === leadsData.totalPages}
                    >
                      Weiter
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </GlowCard>
    </div>
  );
}

