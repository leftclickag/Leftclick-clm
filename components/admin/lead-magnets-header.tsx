"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuickTooltip } from "@/components/ui/tooltip";
import { PermissionGuard } from "@/components/permissions/permission-guard";
import { 
  Magnet, 
  Plus, 
  Sparkles
} from "lucide-react";

export function LeadMagnetsHeader() {
  return (
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
      <PermissionGuard permission="lead_magnets.create">
        <QuickTooltip content="Erstellen Sie einen neuen Lead-Magnet: Rechner, Checkliste, E-Book oder Quiz">
          <Link href="/admin/lead-magnets/new">
            <Button variant="glow" size="lg" className="group">
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
              Neuer Lead-Magnet
              <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </QuickTooltip>
      </PermissionGuard>
    </div>
  );
}

