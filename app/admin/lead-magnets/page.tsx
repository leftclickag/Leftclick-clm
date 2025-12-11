import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions/page-guard";
import { LeadMagnetsGrid } from "@/components/admin/lead-magnets-grid";
import { LeadMagnetsHeader } from "@/components/admin/lead-magnets-header";
import { QuickTooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Magnet, 
  TrendingUp,
  Eye,
  Plus
} from "lucide-react";

export default async function LeadMagnetsPage() {
  // Prüfe Berechtigung
  await requirePermission("lead_magnets.view");
  
  const supabase = await createClient();
  const { data: leadMagnets } = await supabase
    .from("lead_magnets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <LeadMagnetsHeader />

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <QuickTooltip content="Gesamtanzahl aller erstellten Lead-Magnete">
          <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Magnet className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{leadMagnets?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </QuickTooltip>
        <QuickTooltip content="Anzahl der veröffentlichten und aktiven Lead-Magnete">
          <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{leadMagnets?.filter(m => m.active).length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Aktiv</p>
            </div>
          </div>
        </QuickTooltip>
        <QuickTooltip content="Gesamtansichten aller Lead-Magnete in den letzten 7 Tagen">
          <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-cyan-500/20">
              <Eye className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-sm text-muted-foreground">Views (7d)</p>
            </div>
          </div>
        </QuickTooltip>
      </div>

      {/* Empty State oder Lead Magnets Grid */}
      {leadMagnets?.length === 0 ? (
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
      ) : (
        <LeadMagnetsGrid leadMagnets={leadMagnets || []} />
      )}
    </div>
  );
}
