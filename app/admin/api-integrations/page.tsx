"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  TestTube,
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export default function ApiIntegrationsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  const toast = useToast();
  const utils = trpc.useUtils();

  // Queries
  const { data: integrationsData, isLoading } = trpc.apiIntegrations.list.useQuery({
    page: 1,
    pageSize: 50,
  });

  const { data: templates } = trpc.apiIntegrations.getMappingTemplates.useQuery();
  const { data: leadMagnets } = trpc.apiIntegrations.getLeadMagnets.useQuery();

  // Mutations
  const createMutation = trpc.apiIntegrations.create.useMutation({
    onSuccess: () => {
      utils.apiIntegrations.list.invalidate();
      setShowCreateForm(false);
    },
  });

  const updateMutation = trpc.apiIntegrations.update.useMutation({
    onSuccess: () => {
      utils.apiIntegrations.list.invalidate();
      setEditingId(null);
    },
  });

  const deleteMutation = trpc.apiIntegrations.delete.useMutation({
    onSuccess: () => {
      utils.apiIntegrations.list.invalidate();
    },
  });

  const toggleMutation = trpc.apiIntegrations.toggleActive.useMutation({
    onSuccess: () => {
      utils.apiIntegrations.list.invalidate();
    },
  });

  const testMutation = trpc.apiIntegrations.test.useMutation();

  const handleTest = async (id: string) => {
    try {
      await testMutation.mutateAsync({ id });
      toast.success("Test erfolgreich! Prüfe die Logs für Details.");
    } catch (error: any) {
      toast.error(`Test fehlgeschlagen: ${error.message}`);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, active: !currentActive });
      toast.success(
        currentActive
          ? "Integration deaktiviert"
          : "Integration aktiviert"
      );
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: deleteConfirm.id });
      toast.success(`Integration "${deleteConfirm.name}" erfolgreich gelöscht`);
      setDeleteConfirm({ open: false, id: "", name: "" });
    } catch (error: any) {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    }
  };

  const integrations = integrationsData?.integrations || [];

  return (
    <div className="space-y-8">
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ open: false, id: "", name: "" })
        }
        title="Integration löschen?"
        description={`Möchtest du die Integration "${deleteConfirm.name}" wirklich löschen?`}
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        variant="danger"
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />

      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-40" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-500">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">API-Integrationen</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Pushe Leads automatisch an externe Systeme
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Neue Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aktive Integrationen</CardDescription>
            <CardTitle className="text-3xl">
              {integrations.filter((i) => i.active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gesamt-Erfolgsrate</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">
              {integrations.length > 0
                ? Math.round(
                    (integrations.reduce((sum, i) => sum + (i.success_count || 0), 0) /
                      integrations.reduce(
                        (sum, i) =>
                          sum + (i.success_count || 0) + (i.error_count || 0),
                        0
                      )) *
                      100
                  )
                : 0}
              %
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gesendete Leads</CardDescription>
            <CardTitle className="text-3xl text-blue-500">
              {integrations.reduce((sum, i) => sum + (i.success_count || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingId) && (
        <IntegrationForm
          integrationId={editingId}
          templates={templates?.templates || []}
          leadMagnets={leadMagnets || []}
          onClose={() => {
            setShowCreateForm(false);
            setEditingId(null);
          }}
          onSubmit={(data) => {
            if (editingId) {
              updateMutation.mutate({ id: editingId, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}

      {/* Integrations List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Lade Integrationen...
          </div>
        ) : integrations.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Keine Integrationen</h3>
                <p className="text-muted-foreground mb-4">
                  Erstelle deine erste API-Integration, um Leads automatisch zu pushen
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Integration erstellen
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onEdit={() => setEditingId(integration.id)}
              onDelete={() => handleDelete(integration.id, integration.name)}
              onToggle={() =>
                handleToggleActive(integration.id, integration.active)
              }
              onTest={() => handleTest(integration.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  integration: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onTest: () => void;
}

function IntegrationCard({
  integration,
  onEdit,
  onDelete,
  onToggle,
  onTest,
}: IntegrationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const successRate =
    integration.success_count + integration.error_count > 0
      ? Math.round(
          (integration.success_count /
            (integration.success_count + integration.error_count)) *
            100
        )
      : 0;

  return (
    <Card
      className={`transition-all ${
        integration.active
          ? "border-blue-500/30 bg-blue-500/5"
          : "opacity-60"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{integration.name}</CardTitle>
              {integration.active ? (
                <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Aktiv
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs font-medium flex items-center gap-1">
                  <PowerOff className="h-3 w-3" />
                  Inaktiv
                </span>
              )}
            </div>
            <CardDescription className="flex items-center gap-2">
              {integration.http_method}
              <ExternalLink className="h-3 w-3" />
              {integration.endpoint_url}
            </CardDescription>
            {integration.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {integration.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onTest}
              title="Integration testen"
            >
              <TestTube className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              title={integration.active ? "Deaktivieren" : "Aktivieren"}
            >
              {integration.active ? (
                <PowerOff className="h-4 w-4" />
              ) : (
                <Power className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              title="Bearbeiten"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Löschen"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-emerald-500">
              {integration.success_count || 0}
            </div>
            <div className="text-xs text-muted-foreground">Erfolgreich</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-red-500">
              {integration.error_count || 0}
            </div>
            <div className="text-xs text-muted-foreground">Fehler</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-blue-500">
              {successRate}%
            </div>
            <div className="text-xs text-muted-foreground">Erfolgsrate</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold">
              {integration.timeout_seconds}s
            </div>
            <div className="text-xs text-muted-foreground">Timeout</div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-secondary/50">
            Auth: {integration.auth_type}
          </span>
          <span className="px-2 py-1 rounded-md bg-secondary/50">
            Trigger: {integration.trigger_on?.join(", ")}
          </span>
          {integration.retry_enabled && (
            <span className="px-2 py-1 rounded-md bg-secondary/50">
              Retry: {integration.retry_max_attempts}x
            </span>
          )}
          {integration.lead_magnet_ids && integration.lead_magnet_ids.length > 0 && (
            <span className="px-2 py-1 rounded-md bg-secondary/50">
              {integration.lead_magnet_ids.length} Lead-Magnet(s)
            </span>
          )}
        </div>

        {/* Last Activity */}
        {(integration.last_success_at || integration.last_error_at) && (
          <div className="text-xs text-muted-foreground space-y-1">
            {integration.last_success_at && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Letzter Erfolg:{" "}
                {new Date(integration.last_success_at).toLocaleString("de-DE")}
              </div>
            )}
            {integration.last_error_at && (
              <div className="flex items-center gap-2">
                <XCircle className="h-3 w-3 text-red-500" />
                Letzter Fehler:{" "}
                {new Date(integration.last_error_at).toLocaleString("de-DE")}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface IntegrationFormProps {
  integrationId: string | null;
  templates: any[];
  leadMagnets: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function IntegrationForm({
  integrationId,
  templates,
  leadMagnets,
  onClose,
  onSubmit,
}: IntegrationFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
    endpoint_url: "",
    http_method: "POST",
    auth_type: "none",
    auth_config: {},
    headers: {},
    data_mapping: {},
    trigger_on: ["lead.completed"],
    lead_magnet_ids: null as string[] | null,
    retry_enabled: true,
    retry_max_attempts: 3,
    retry_delay_seconds: 60,
    timeout_seconds: 30,
  });

  const [mappingJson, setMappingJson] = useState("{}");
  const [authConfigJson, setAuthConfigJson] = useState("{}");

  const { data: existingIntegration } = trpc.apiIntegrations.getById.useQuery(
    { id: integrationId! },
    { enabled: !!integrationId }
  );

  // Load existing data when editing
  if (integrationId && existingIntegration && formData.name === "") {
    setFormData(existingIntegration);
    setMappingJson(JSON.stringify(existingIntegration.data_mapping, null, 2));
    setAuthConfigJson(JSON.stringify(existingIntegration.auth_config, null, 2));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        data_mapping: JSON.parse(mappingJson),
        auth_config: JSON.parse(authConfigJson),
      };
      onSubmit(data);
    } catch (error) {
      toast.error("Ungültiges JSON-Format in Mapping oder Auth-Config");
    }
  };

  const applyTemplate = (templateMapping: any) => {
    setMappingJson(JSON.stringify(templateMapping, null, 2));
  };

  return (
    <Card className="border-2 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          {integrationId ? "Integration bearbeiten" : "Neue Integration erstellen"}
        </CardTitle>
        <CardDescription>
          Konfiguriere, wie und wohin Leads gepusht werden sollen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basis-Informationen */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basis-Informationen</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="z.B. CRM Integration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <Select
                  value={formData.active.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, active: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktiv</SelectItem>
                    <SelectItem value="false">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optionale Beschreibung"
              />
            </div>
          </div>

          {/* API-Konfiguration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">API-Endpunkt</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="http_method">Methode</Label>
                <Select
                  value={formData.http_method}
                  onValueChange={(value) =>
                    setFormData({ ...formData, http_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="endpoint_url">Endpoint URL *</Label>
                <Input
                  id="endpoint_url"
                  type="url"
                  value={formData.endpoint_url}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint_url: e.target.value })
                  }
                  required
                  placeholder="https://api.example.com/leads"
                />
              </div>
            </div>
          </div>

          {/* Authentifizierung */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Authentifizierung</h3>
            <div className="space-y-2">
              <Label htmlFor="auth_type">Auth-Typ</Label>
              <Select
                value={formData.auth_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, auth_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.auth_type !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="auth_config">Auth-Konfiguration (JSON)</Label>
                <textarea
                  id="auth_config"
                  value={authConfigJson}
                  onChange={(e) => setAuthConfigJson(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md border bg-background font-mono text-sm"
                  placeholder={`Beispiel für ${formData.auth_type}:\n${
                    formData.auth_type === "bearer"
                      ? '{"token": "your-token"}'
                      : formData.auth_type === "api_key"
                      ? '{"header": "X-API-Key", "value": "your-key"}'
                      : '{"username": "user", "password": "pass"}'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Daten-Mapping */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Daten-Mapping *</h3>
              <Select onValueChange={(value) => {
                const template = templates.find(t => t.name === value);
                if (template) applyTemplate(template.mapping);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Template wählen" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <textarea
                id="data_mapping"
                value={mappingJson}
                onChange={(e) => setMappingJson(e.target.value)}
                className="w-full min-h-[200px] p-3 rounded-md border bg-background font-mono text-sm"
                required
                placeholder='{"email": "{{contact_info.email}}", "name": "{{contact_info.firstName}}"}'
              />
              <p className="text-xs text-muted-foreground">
                Verfügbare Variablen: {`{{id}}`}, {`{{contact_info.*}}`}, {`{{data.*}}`}, 
                {`{{utm_source}}`}, {`{{utm_medium}}`}, {`{{utm_campaign}}`}, {`{{device_type}}`}, 
                {`{{browser}}`}, {`{{country}}`}, {`{{city}}`}, {`{{created_at}}`}
              </p>
            </div>
          </div>

          {/* Erweiterte Optionen */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Erweiterte Optionen</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="timeout_seconds">Timeout (Sekunden)</Label>
                <Input
                  id="timeout_seconds"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.timeout_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeout_seconds: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry_max_attempts">Max. Retry-Versuche</Label>
                <Input
                  id="retry_max_attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.retry_max_attempts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retry_max_attempts: parseInt(e.target.value),
                    })
                  }
                  disabled={!formData.retry_enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry_delay_seconds">Retry-Verzögerung (s)</Label>
                <Input
                  id="retry_delay_seconds"
                  type="number"
                  min="0"
                  value={formData.retry_delay_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retry_delay_seconds: parseInt(e.target.value),
                    })
                  }
                  disabled={!formData.retry_enabled}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              {integrationId ? "Aktualisieren" : "Erstellen"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

