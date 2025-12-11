"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Search,
  Filter,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { PriceVariable } from "@/types/wizard-builder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PriceVariableManagerProps {
  variables: PriceVariable[];
  calculations: Array<{ id: string; formula: string; label?: string }>;
  onChange: (variables: PriceVariable[]) => void;
}

export function PriceVariableManager({
  variables,
  calculations,
  onChange,
}: PriceVariableManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingVar, setEditingVar] = useState<PriceVariable | null>(null);
  const [showUsageDialog, setShowUsageDialog] = useState<string | null>(null);

  // Finde Verwendungen für jede Variable
  const getVariableUsage = (varName: string) => {
    return calculations.filter((calc) =>
      calc.formula.includes(varName)
    );
  };

  // Kategorien extrahieren
  const categories = Array.from(
    new Set(variables.map((v) => v.category))
  ).filter(Boolean);

  // Gefilterte Variablen
  const filteredVariables = variables.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.variableName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addVariable = () => {
    const newVar: PriceVariable = {
      id: `var_${Date.now()}`,
      name: "Neuer Preis",
      variableName: `newPrice_${Date.now()}`,
      value: 0,
      unit: "EUR",
      category: "Sonstiges",
      usedIn: [],
    };
    setEditingVar(newVar);
  };

  const updateVariable = (updated: PriceVariable) => {
    // Finde Verwendungen
    const usedIn = getVariableUsage(updated.variableName).map((c) => c.id);
    const finalVar = { ...updated, usedIn };

    onChange(
      editingVar
        ? variables.map((v) => (v.id === editingVar.id ? finalVar : v))
        : [...variables, finalVar]
    );
    setEditingVar(null);
  };

  const deleteVariable = (id: string) => {
    if (confirm("Möchten Sie diese Variable wirklich löschen?")) {
      onChange(variables.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header mit Suche und Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Preise durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex h-10 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
        >
          <option value="all">Alle Kategorien</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <Button onClick={addVariable} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Preis hinzufügen
        </Button>
      </div>

      {/* Preis-Tabelle */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            Preis-Tabelle ({filteredVariables.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVariables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedCategory !== "all"
                ? "Keine Preise gefunden"
                : "Noch keine Preise definiert"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                      Variable
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                      Preis
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                      Kategorie
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                      Verwendet in
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVariables.map((variable) => {
                    const usage = getVariableUsage(variable.variableName);
                    return (
                      <tr
                        key={variable.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs font-mono text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                            {variable.variableName}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-sm">
                              {variable.name}
                            </div>
                            {variable.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {variable.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm">
                            {variable.value.toFixed(2)} {variable.unit}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded bg-white/10 text-muted-foreground">
                            {variable.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {usage.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setShowUsageDialog(variable.id)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              {usage.length} Formel{usage.length !== 1 ? "n" : ""}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Nicht verwendet
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingVar(variable)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              onClick={() => deleteVariable(variable.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingVar && (
        <Dialog open={!!editingVar} onOpenChange={() => setEditingVar(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVar.id.startsWith("var_") ? "Neuer Preis" : "Preis bearbeiten"}
              </DialogTitle>
              <DialogDescription>
                Definieren Sie einen Preis oder eine Konstante für Ihre Berechnungen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingVar.name}
                    onChange={(e) =>
                      setEditingVar({ ...editingVar, name: e.target.value })
                    }
                    placeholder="z.B. Phone System Lizenz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Variable-Name (ID)</Label>
                  <Input
                    value={editingVar.variableName}
                    onChange={(e) =>
                      setEditingVar({
                        ...editingVar,
                        variableName: e.target.value,
                      })
                    }
                    placeholder="z.B. phoneSystemPrice"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Wert</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingVar.value}
                    onChange={(e) =>
                      setEditingVar({
                        ...editingVar,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Einheit</Label>
                  <Input
                    value={editingVar.unit}
                    onChange={(e) =>
                      setEditingVar({ ...editingVar, unit: e.target.value })
                    }
                    placeholder="EUR/User/Monat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Input
                    value={editingVar.category}
                    onChange={(e) =>
                      setEditingVar({ ...editingVar, category: e.target.value })
                    }
                    placeholder="Lizenzen"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Beschreibung (optional)</Label>
                <Input
                  value={editingVar.description || ""}
                  onChange={(e) =>
                    setEditingVar({ ...editingVar, description: e.target.value })
                  }
                  placeholder="Kurze Beschreibung..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingVar(null)}
                >
                  Abbrechen
                </Button>
                <Button onClick={() => updateVariable(editingVar)}>
                  <Check className="mr-2 h-4 w-4" />
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Usage Dialog */}
      {showUsageDialog && (
        <Dialog
          open={!!showUsageDialog}
          onOpenChange={() => setShowUsageDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verwendung</DialogTitle>
              <DialogDescription>
                Diese Variable wird in folgenden Berechnungen verwendet:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              {getVariableUsage(
                variables.find((v) => v.id === showUsageDialog)?.variableName ||
                  ""
              ).map((calc) => (
                <div
                  key={calc.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="font-medium text-sm mb-1">
                    {calc.label || calc.id}
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {calc.formula}
                  </code>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

