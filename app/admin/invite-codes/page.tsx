"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { CheckCircle, XCircle, Copy, Plus } from "lucide-react";

export default function InviteCodesPage() {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [createForm, setCreateForm] = useState({
    maxUses: 1,
    expiresInDays: 30,
  });

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
      setCreateForm({ maxUses: 1, expiresInDays: 30 });
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
    createCode.mutate(createForm);
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
    alert("Code in Zwischenablage kopiert!");
  };

  const getRegistrationLink = (code: string) => {
    return `${window.location.origin}/auth/register?code=${code}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invite Code Verwaltung
          </h1>
          <p className="text-gray-600 mt-2">
            Erstelle und verwalte Einladungscodes für neue Benutzer
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Neuer Code
        </Button>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-600">Gesamt Codes</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalCodes}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600">Aktive Codes</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {stats.activeCodes}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600">Verwendungen</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {stats.usedCodes}
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4"
            />
            <span className="text-sm">Nur aktive Codes anzeigen</span>
          </label>
        </div>
      </Card>

      {/* Codes Liste */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Lädt Codes...</div>
        ) : !codesData?.inviteCodes.length ? (
          <div className="p-8 text-center text-gray-600">
            Keine Invite Codes gefunden
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verwendungen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Läuft ab
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erstellt von
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codesData.inviteCodes.map((code: any) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {code.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Code kopieren"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              copyToClipboard(getRegistrationLink(code.code))
                            }
                            className="text-blue-400 hover:text-blue-600 text-xs"
                            title="Link kopieren"
                          >
                            Link
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {code.is_active ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Aktiv
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Inaktiv
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {code.current_uses} / {code.max_uses}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${
                                (code.current_uses / code.max_uses) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {code.expires_at
                          ? new Date(code.expires_at).toLocaleDateString("de-DE")
                          : "Nie"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        System
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          {code.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(code.id, code.code)}
                              disabled={deactivateCode.isLoading}
                            >
                              Deaktivieren
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(code.id, code.code)}
                            disabled={deleteCode.isLoading}
                          >
                            Löschen
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
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Neuen Invite Code erstellen</h2>

            <div className="space-y-4">
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
                />
                <p className="text-xs text-gray-500 mt-1">
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nach wie vielen Tagen läuft der Code ab?
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createCode.isLoading}
                  className="flex-1"
                >
                  {createCode.isLoading ? "Erstelle..." : "Erstellen"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

