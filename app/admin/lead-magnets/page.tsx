import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import Link from "next/link";
import { 
  Plus, 
  Magnet, 
  Calculator, 
  FileText, 
  CheckSquare, 
  BookOpen,
  ExternalLink,
  MoreHorizontal,
  TrendingUp,
  Eye,
  Sparkles
} from "lucide-react";

export default async function LeadMagnetsPage() {
  const supabase = await createClient();
  const { data: leadMagnets } = await supabase
    .from("lead_magnets")
    .select("*")
    .order("created_at", { ascending: false });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "calculator":
        return Calculator;
      case "checklist":
        return CheckSquare;
      case "ebook":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "calculator":
        return { bg: "from-purple-500/20 to-purple-600/10", text: "text-purple-400", border: "border-purple-500/30" };
      case "checklist":
        return { bg: "from-cyan-500/20 to-cyan-600/10", text: "text-cyan-400", border: "border-cyan-500/30" };
      case "ebook":
        return { bg: "from-emerald-500/20 to-emerald-600/10", text: "text-emerald-400", border: "border-emerald-500/30" };
      default:
        return { bg: "from-blue-500/20 to-blue-600/10", text: "text-blue-400", border: "border-blue-500/30" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-40" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <Magnet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Lead-Magnete</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Verwalte deine Lead-Generierungs-Tools
            </p>
          </div>
        </div>
        <Link href="/admin/lead-magnets/new">
          <Button variant="glow" size="lg" className="group">
            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
            Neuer Lead-Magnet
            <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <Magnet className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{leadMagnets?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/20">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{leadMagnets?.filter(m => m.active).length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Aktiv</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/20">
            <Eye className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">--</p>
            <p className="text-sm text-muted-foreground">Views (7d)</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {leadMagnets?.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative p-6 rounded-full bg-card/60 border border-border">
              <Magnet className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Noch keine Lead-Magnete</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Erstelle deinen ersten Lead-Magnet und beginne mit der Lead-Generierung
          </p>
          <Link href="/admin/lead-magnets/new">
            <Button variant="glow" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Ersten Lead-Magnet erstellen
            </Button>
          </Link>
        </div>
      )}

      {/* Lead Magnets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {leadMagnets?.map((magnet, index) => {
          const TypeIcon = getTypeIcon(magnet.type);
          const colors = getTypeColor(magnet.type);
          
          return (
            <GlowCard 
              key={magnet.id} 
              className="group animate-fade-in cursor-pointer"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              {/* Type Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-30 group-hover:opacity-50 transition-opacity`} />
              
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border`}>
                      <TypeIcon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-purple-300 transition-colors">
                        {magnet.title}
                      </CardTitle>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colors.text} mt-1`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {magnet.type.charAt(0).toUpperCase() + magnet.type.slice(1)}
                      </span>
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
                <CardDescription className="mt-3 line-clamp-2">
                  {magnet.description || "Keine Beschreibung verfügbar"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative pt-0">
                {/* Slug */}
                <div className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Widget URL</p>
                  <p className="text-sm font-mono text-purple-500 dark:text-purple-400 truncate">/widget/{magnet.slug}</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/admin/lead-magnets/${magnet.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Bearbeiten
                    </Button>
                  </Link>
                  <Link href={`/widget/${magnet.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}
