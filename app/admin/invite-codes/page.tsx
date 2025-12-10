"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc/client";
import { Ticket, Plus, CheckCircle, XCircle, Copy, Link, Trash2, Ban } from "lucide-react";

export default function InviteCodesPage() {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: "",
    maxUses: 1,
    expiresInDays: 30,
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Lade Invite Codes
  const { data: codesData, isLoading } = trpc.inviteCodes.list.useQuery({
    page,
    pageSize: 10,
    activeOnly,
  });

  // Lade Statistiken
  const { data: stats } = trpc.inviteCodes.stats.useQuery();

  // Mutations
  const createCode = trpc.inviteCodes.create.useMutation({
    onSuccess: () => {
      utils.inviteCodes.list.invalidate();
      utils.inviteCodes.stats.invalidate();
      setShowCreateModal(false);
      setCreateForm({ code: "", maxUses: 1, expiresInDays: 30 });
      setCreateError(null);
    },
    onError: (error) => {
      setCreateError(error.message || "Fehler beim Erstellen des Codes");
    },
  });

  const deactivateCode = trpc.inviteCodes.deactivate.useMutation({
    onSuccess: () => {
      utils.inviteCodes.list.invalidate();
      utils.inviteCodes.stats.invalidate();
    },
  });

  const deleteCode = trpc.inviteCodes.delete.useMutation({
    onSuccess: () => {
      utils.inviteCodes.list.invalidate();
      utils.inviteCodes.stats.invalidate();
    },
  });

  const handleCreate = () => {
    setCreateError(null);
    createCode.mutate({
      code: createForm.code.trim() || undefined,
      maxUses: createForm.maxUses,
      expiresInDays: createForm.expiresInDays,
    });
  };

  const handleDeactivate = (codeId: string, code: string) => {
    if (confirm(`Code "${code}" wirklich deaktivieren?`)) {
      deactivateCode.mutate({ codeId });
    }
  };

  const handleDelete = (codeId: string, code: string) => {
    if (
      confirm(
        `Code "${code}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      deleteCode.mutate({ codeId });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRegistrationLink = (code: string) => {
    return `${window.location.origin}/auth/register?code=${code}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Invite Codes</h1>
          </div>
          <p className="text-muted-foreground text-lg mt-2">
            Erstelle und verwalte Einladungscodes für neue Benutzer
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neuer Code
        </Button>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden hover-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/10 opacity-50" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamt Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-foreground">
                {stats.totalCodes}
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden hover-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 opacity-50" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktive Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-emerald-400">
                {stats.activeCodes}
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden hover-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 opacity-50" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verwendungen
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-cyan-400">
                {stats.usedCodes}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="activeOnly"
              checked={activeOnly}
              onCheckedChange={(checked) => {
                setActiveOnly(checked as boolean);
                setPage(1);
              }}
            />
            <label
              htmlFor="activeOnly"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Nur aktive Codes anzeigen
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Codes Liste */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-8 w-8 text-purple-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <span className="text-muted-foreground">Lädt Codes...</span>
          </div>
        ) : !codesData?.inviteCodes.length ? (
          <div className="p-8 text-center">
            <div className="mb-4">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">Keine Invite Codes gefunden</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Klicke auf &quot;Neuer Code&quot; um den ersten Einladungscode zu erstellen.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Verwendungen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Läuft ab
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Erstellt von
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {codesData.inviteCodes.map((code: any) => (
                    <tr key={code.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="bg-secondary/50 px-2 py-1 rounded text-sm font-mono text-foreground">
                            {code.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Code kopieren"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              copyToClipboard(getRegistrationLink(code.code))
                            }
                            className="text-cyan-500 hover:text-cyan-400 transition-colors"
                            title="Link kopieren"
                          >
                            <Link className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {code.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Aktiv
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            <XCircle className="w-3 h-3" />
                            Inaktiv
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          {code.current_uses} / {code.max_uses}
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1.5 rounded-full transition-all"
                            style={{
                              width: `${
                                (code.current_uses / code.max_uses) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {code.expires_at
                          ? new Date(code.expires_at).toLocaleDateString("de-DE")
                          : "Nie"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        System
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          {code.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(code.id, code.code)}
                              disabled={deactivateCode.isPending}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Deaktivieren
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(code.id, code.code)}
                            disabled={deleteCode.isPending}
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
            {codesData && codesData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-secondary/20">
                <div className="text-sm text-muted-foreground">
                  Seite {page} von {codesData.totalPages} ({codesData.total}{" "}
                  Codes)
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
                    disabled={page === codesData.totalPages}
                  >
                    Weiter
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Neuen Invite Code erstellen</CardTitle>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Code (optional)</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="z.B. TEAM-2024 oder PARTNER-ACME"
                    value={createForm.code}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        code: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Eigenen Code vergeben oder leer lassen für automatische Generierung
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxUses">Maximale Verwendungen</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={createForm.maxUses}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        maxUses: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Wie oft kann dieser Code verwendet werden?
                  </p>
                </div>

                <div>
                  <Label htmlFor="expiresInDays">Gültigkeit (Tage)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    min="1"
                    max="365"
                    value={createForm.expiresInDays}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        expiresInDays: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nach wie vielen Tagen läuft der Code ab?
                  </p>
                </div>

                {createCode.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {createCode.error.message}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createCode.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
                  >
                    {createCode.isPending ? "Erstelle..." : "Erstellen"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
