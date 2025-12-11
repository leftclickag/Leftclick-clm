"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  BarChart3,
  PieChart,
  TrendingUp,
  GitCompare,
  Palette,
  Eye,
} from "lucide-react";
import { ChartConfig, ChartType } from "@/types/wizard-builder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChartBuilderProps {
  charts: ChartConfig[];
  calculations: Array<{ id: string; formula: string; label?: string }>;
  onChange: (charts: ChartConfig[]) => void;
}

const CHART_TYPES: Array<{
  value: ChartType;
  label: string;
  icon: any;
  description: string;
}> = [
  {
    value: "bar",
    label: "Balkendiagramm",
    icon: BarChart3,
    description: "Für Kostenvergleiche und Kategorien",
  },
  {
    value: "pie",
    label: "Kreisdiagramm",
    icon: PieChart,
    description: "Für Aufteilungen und Anteile",
  },
  {
    value: "line",
    label: "Liniendiagramm",
    icon: TrendingUp,
    description: "Für Zeitverläufe und Trends",
  },
  {
    value: "comparison",
    label: "Vergleichsdiagramm",
    icon: GitCompare,
    description: "Vorher/Nachher Vergleiche",
  },
];

export function ChartBuilder({
  charts,
  calculations,
  onChange,
}: ChartBuilderProps) {
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);

  const addChart = () => {
    const newChart: ChartConfig = {
      id: `chart_${Date.now()}`,
      type: "bar",
      title: "Neues Diagramm",
      dataSource: [],
      position: "middle",
      showLegend: true,
      showLabels: true,
    };
    setEditingChart(newChart);
  };

  const updateChart = (updated: ChartConfig) => {
    if (editingChart?.id.startsWith("chart_")) {
      // Neues Diagramm
      onChange([...charts, updated]);
    } else {
      // Existierendes Diagramm
      onChange(
        charts.map((c) => (c.id === updated.id ? updated : c))
      );
    }
    setEditingChart(null);
  };

  const deleteChart = (id: string) => {
    if (confirm("Möchten Sie dieses Diagramm wirklich löschen?")) {
      onChange(charts.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Diagramme</h3>
          <p className="text-xs text-muted-foreground">
            Visualisieren Sie Ihre Berechnungsergebnisse
          </p>
        </div>
        <Button onClick={addChart} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Diagramm hinzufügen
        </Button>
      </div>

      {charts.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-white/20 bg-white/5">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Noch keine Diagramme definiert
          </p>
          <Button onClick={addChart} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Erstes Diagramm erstellen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {charts.map((chart) => {
            const ChartIcon =
              CHART_TYPES.find((t) => t.value === chart.type)?.icon ||
              BarChart3;
            return (
              <Card
                key={chart.id}
                className="border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <ChartIcon className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{chart.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {CHART_TYPES.find((t) => t.value === chart.type)?.label} •{" "}
                          {chart.dataSource.length} Datenquelle
                          {chart.dataSource.length !== 1 ? "n" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingChart(chart)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => deleteChart(chart.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      {editingChart && (
        <Dialog open={!!editingChart} onOpenChange={() => setEditingChart(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChart.id.startsWith("chart_")
                  ? "Neues Diagramm"
                  : "Diagramm bearbeiten"}
              </DialogTitle>
              <DialogDescription>
                Konfigurieren Sie ein Diagramm für Ihre Ergebnisse
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titel</Label>
                <Input
                  value={editingChart.title}
                  onChange={(e) =>
                    setEditingChart({ ...editingChart, title: e.target.value })
                  }
                  placeholder="z.B. Kostenvergleich"
                />
              </div>

              <div className="space-y-2">
                <Label>Diagramm-Typ</Label>
                <div className="grid grid-cols-2 gap-3">
                  {CHART_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setEditingChart({ ...editingChart, type: type.value })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          editingChart.type === type.value
                            ? "border-purple-500/50 bg-purple-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Datenquellen (Berechnungen)</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {calculations.map((calc) => (
                    <div key={calc.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`calc-${calc.id}`}
                        checked={editingChart.dataSource.includes(calc.id)}
                        onChange={(e) => {
                          const dataSource = e.target.checked
                            ? [...editingChart.dataSource, calc.id]
                            : editingChart.dataSource.filter((id) => id !== calc.id);
                          setEditingChart({ ...editingChart, dataSource });
                        }}
                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                      />
                      <Label
                        htmlFor={`calc-${calc.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-sm">
                          {calc.label || calc.id}
                        </div>
                        <code className="text-xs text-muted-foreground font-mono">
                          {calc.formula}
                        </code>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <select
                    value={editingChart.position}
                    onChange={(e) =>
                      setEditingChart({
                        ...editingChart,
                        position: e.target.value as ChartConfig["position"],
                      })
                    }
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
                  >
                    <option value="top">Oben</option>
                    <option value="middle">Mitte</option>
                    <option value="bottom">Unten</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showLegend"
                    checked={editingChart.showLegend !== false}
                    onChange={(e) =>
                      setEditingChart({
                        ...editingChart,
                        showLegend: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                  <Label htmlFor="showLegend" className="cursor-pointer">
                    Legende anzeigen
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showLabels"
                    checked={editingChart.showLabels !== false}
                    onChange={(e) =>
                      setEditingChart({
                        ...editingChart,
                        showLabels: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                  <Label htmlFor="showLabels" className="cursor-pointer">
                    Labels anzeigen
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingChart(null)}
                >
                  Abbrechen
                </Button>
                <Button onClick={() => updateChart(editingChart)}>
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

