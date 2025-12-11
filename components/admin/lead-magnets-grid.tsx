"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { LeadMagnetActions } from "@/components/admin/lead-magnet-actions";
import { QuickTooltip } from "@/components/ui/tooltip";
import { PermissionGuard } from "@/components/permissions/permission-guard";
import { 
  Calculator, 
  FileText, 
  CheckSquare, 
  BookOpen,
  ExternalLink,
  Search,
  Filter,
  X,
  SlidersHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadMagnet {
  id: string;
  title: string;
  slug: string;
  type: string;
  description?: string;
  active: boolean;
  created_at: string;
}

interface LeadMagnetsGridProps {
  leadMagnets: LeadMagnet[];
}

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

const getTypeLabel = (type: string) => {
  switch (type) {
    case "calculator":
      return "Rechner";
    case "checklist":
      return "Checkliste";
    case "ebook":
      return "E-Book";
    case "quiz":
      return "Quiz";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export function LeadMagnetsGrid({ leadMagnets }: LeadMagnetsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(["active", "inactive"]);

  // Alle verfügbaren Typen aus den Lead Magnets extrahieren
  const availableTypes = useMemo(() => {
    const types = new Set(leadMagnets.map(m => m.type));
    return Array.from(types);
  }, [leadMagnets]);

  // Gefilterte Lead Magnets
  const filteredMagnets = useMemo(() => {
    return leadMagnets.filter(magnet => {
      // Suchfilter
      const matchesSearch = searchQuery === "" || 
        magnet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (magnet.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        magnet.slug.toLowerCase().includes(searchQuery.toLowerCase());

      // Typ-Filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(magnet.type);

      // Status-Filter
      const matchesStatus = 
        (selectedStatus.includes("active") && magnet.active) ||
        (selectedStatus.includes("inactive") && !magnet.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leadMagnets, searchQuery, selectedTypes, selectedStatus]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedStatus(["active", "inactive"]);
  };

  const hasActiveFilters = searchQuery !== "" || selectedTypes.length > 0 || selectedStatus.length < 2;

  return (
    <div className="space-y-6">
      {/* Suche und Filter */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {/* Suchfeld */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Lead-Magnete durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-11 bg-card/60 border-border/60 backdrop-blur-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Typ-Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="h-11 bg-card/60 border-border/60 backdrop-blur-sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Typ
              {selectedTypes.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Nach Typ filtern</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableTypes.map(type => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
              >
                {getTypeLabel(type)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status-Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="h-11 bg-card/60 border-border/60 backdrop-blur-sm"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Status
              {selectedStatus.length < 2 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Nach Status filtern</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatus.includes("active")}
              onCheckedChange={() => toggleStatus("active")}
            >
              Aktiv
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus.includes("inactive")}
              onCheckedChange={() => toggleStatus("inactive")}
            >
              Inaktiv
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter zurücksetzen */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="lg"
            onClick={clearFilters}
            className="h-11"
          >
            <X className="mr-2 h-4 w-4" />
            Filter zurücksetzen
          </Button>
        )}
      </div>

      {/* Ergebnis-Anzeige */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredMagnets.length} von {leadMagnets.length} Lead-Magneten</span>
        </div>
      )}

      {/* Kein Ergebnis */}
      {filteredMagnets.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="relative p-6 rounded-full bg-card/60 border border-border">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Keine Lead-Magnete gefunden</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Versuche andere Suchbegriffe oder passe deine Filter an
          </p>
          <Button onClick={clearFilters} variant="outline">
            Filter zurücksetzen
          </Button>
        </div>
      )}

      {/* Lead Magnets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMagnets.map((magnet, index) => {
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
                       {getTypeLabel(magnet.type)}
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
                <PermissionGuard permission="lead_magnets.edit">
                  <QuickTooltip content="Lead-Magnet bearbeiten: Schritte, Design und Einstellungen anpassen">
                    <Link href={`/admin/lead-magnets/${magnet.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Bearbeiten
                      </Button>
                    </Link>
                  </QuickTooltip>
                </PermissionGuard>
                <QuickTooltip content="Lead-Magnet in neuem Tab öffnen und testen">
                  <Link href={`/widget/${magnet.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </QuickTooltip>
                <PermissionGuard permission="lead_magnets.delete">
                  <LeadMagnetActions magnet={{
                    id: magnet.id,
                    slug: magnet.slug,
                    title: magnet.title
                  }} />
                </PermissionGuard>
              </div>
            </CardContent>
          </GlowCard>
         );
       })}
      </div>
    </div>
  );
}
