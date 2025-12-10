"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<{
    id: string;
    currentRole: string;
  } | null>(null);

  const utils = trpc.useUtils();

  // Lade Benutzer
  const { data: usersData, isLoading } = trpc.users.list.useQuery({
    page,
    pageSize: 10,
    search,
  });

  // Lade Statistiken
  const { data: stats } = trpc.users.stats.useQuery();

  // Mutations
  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
      setRoleChangeUser(null);
    },
  });

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
      setSelectedUser(null);
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    if (confirm(`Rolle wirklich zu "${newRole}" ändern?`)) {
      updateRole.mutate({
        userId,
        role: newRole as "user" | "admin" | "super_admin",
      });
    }
  };

  const handleDeleteUser = (userId: string, email: string) => {
    if (
      confirm(
        `Benutzer "${email}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      deleteUser.mutate({ userId });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Benutzerverwaltung</h1>
        <p className="text-gray-600 mt-2">
          Verwalte Benutzer, Rollen und Berechtigungen
        </p>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-600">Gesamt Benutzer</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalUsers}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600">Neue (30 Tage)</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {stats.newUsers}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600">Nach Rolle</div>
            <div className="mt-2 space-y-1">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between text-sm">
                  <span className="capitalize">{role}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Suche */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Input
            placeholder="Suche nach Name oder E-Mail..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Benutzerliste */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Lädt Benutzer...</div>
        ) : !usersData?.users.length ? (
          <div className="p-8 text-center text-gray-600">
            Keine Benutzer gefunden
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Benutzer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-Mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rolle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erstellt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersData.users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {user.raw_user_meta_data?.name || "Unbekannt"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(
                            user.user_roles?.role || "user"
                          )}`}
                        >
                          {user.user_roles?.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString("de-DE")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Select
                            value={user.user_roles?.role || "user"}
                            onValueChange={(newRole) =>
                              handleRoleChange(user.id, newRole)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">
                                Super Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            disabled={deleteUser.isLoading}
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
            {usersData && usersData.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Seite {page} von {usersData.totalPages} ({usersData.total}{" "}
                  Benutzer)
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
                    disabled={page === usersData.totalPages}
                  >
                    Weiter
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

