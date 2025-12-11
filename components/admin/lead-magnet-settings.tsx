"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  FileText,
  User,
  Eye,
  EyeOff,
  Settings,
  Image,
  Palette,
} from "lucide-react";
import { LeadMagnetSettings as SettingsType } from "@/types/wizard-builder";

interface LeadMagnetSettingsProps {
  settings: SettingsType;
  onChange: (settings: SettingsType) => void;
}

export function LeadMagnetSettings({
  settings,
  onChange,
}: LeadMagnetSettingsProps) {
  const updateEmail = (updates: Partial<SettingsType["email"]>) => {
    onChange({
      ...settings,
      email: { ...settings.email, ...updates },
    });
  };

  const updatePDF = (updates: Partial<SettingsType["pdf"]>) => {
    onChange({
      ...settings,
      pdf: { ...settings.pdf, ...updates },
    });
  };

  const updateContactGate = (updates: Partial<SettingsType["contactGate"]>) => {
    onChange({
      ...settings,
      contactGate: { ...settings.contactGate, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* E-Mail Einstellungen */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-400" />
            E-Mail Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="sendToVisitor"
              checked={settings.email.sendToVisitor}
              onCheckedChange={(checked) =>
                updateEmail({ sendToVisitor: checked === true })
              }
            />
            <Label htmlFor="sendToVisitor" className="cursor-pointer">
              Kopie an Besucher senden
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="sendToTeam"
              checked={settings.email.sendToTeam}
              onCheckedChange={(checked) =>
                updateEmail({ sendToTeam: checked === true })
              }
            />
            <Label htmlFor="sendToTeam" className="cursor-pointer">
              Kopie an Team senden
            </Label>
          </div>
          {settings.email.sendToTeam && (
            <div className="space-y-2 pl-7">
              <Label className="text-xs">Team E-Mail Adresse</Label>
              <Input
                type="email"
                value={settings.email.teamEmail || ""}
                onChange={(e) => updateEmail({ teamEmail: e.target.value })}
                placeholder="team@example.com"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs">E-Mail Betreff (optional)</Label>
            <Input
              value={settings.email.customSubject || ""}
              onChange={(e) => updateEmail({ customSubject: e.target.value })}
              placeholder="Ihr Kalkulator-Ergebnis"
            />
          </div>
        </CardContent>
      </Card>

      {/* PDF Einstellungen */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-400" />
            PDF Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="generatePDF"
              checked={settings.pdf.generate}
              onCheckedChange={(checked) =>
                updatePDF({ generate: checked === true })
              }
            />
            <Label htmlFor="generatePDF" className="cursor-pointer">
              PDF generieren
            </Label>
          </div>
          {settings.pdf.generate && (
            <>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="attachPDF"
                  checked={settings.pdf.attachToEmail}
                  onCheckedChange={(checked) =>
                    updatePDF({ attachToEmail: checked === true })
                  }
                />
                <Label htmlFor="attachPDF" className="cursor-pointer">
                  PDF als E-Mail-Anhang senden
                </Label>
              </div>

              {/* PDF Branding */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <Label className="text-xs text-muted-foreground">
                  PDF Branding
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Primärfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.pdf.branding?.primaryColor || "#3b82f6"}
                        onChange={(e) =>
                          updatePDF({
                            branding: {
                              ...settings.pdf.branding,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        className="h-10 w-20"
                      />
                      <Input
                        value={settings.pdf.branding?.primaryColor || "#3b82f6"}
                        onChange={(e) =>
                          updatePDF({
                            branding: {
                              ...settings.pdf.branding,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Sekundärfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.pdf.branding?.secondaryColor || "#8b5cf6"}
                        onChange={(e) =>
                          updatePDF({
                            branding: {
                              ...settings.pdf.branding,
                              secondaryColor: e.target.value,
                            },
                          })
                        }
                        className="h-10 w-20"
                      />
                      <Input
                        value={settings.pdf.branding?.secondaryColor || "#8b5cf6"}
                        onChange={(e) =>
                          updatePDF({
                            branding: {
                              ...settings.pdf.branding,
                              secondaryColor: e.target.value,
                            },
                          })
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Sections */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <Label className="text-xs text-muted-foreground">
                  PDF Sektionen
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="pdfInputSummary"
                      checked={settings.pdf.sections.inputSummary}
                      onCheckedChange={(checked) =>
                        updatePDF({
                          sections: {
                            ...settings.pdf.sections,
                            inputSummary: checked === true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="pdfInputSummary" className="cursor-pointer text-sm">
                      Eingabe-Zusammenfassung
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="pdfCalcDetails"
                      checked={settings.pdf.sections.calculationDetails}
                      onCheckedChange={(checked) =>
                        updatePDF({
                          sections: {
                            ...settings.pdf.sections,
                            calculationDetails: checked === true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="pdfCalcDetails" className="cursor-pointer text-sm">
                      Berechnungs-Details
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="pdfCharts"
                      checked={settings.pdf.sections.charts}
                      onCheckedChange={(checked) =>
                        updatePDF({
                          sections: {
                            ...settings.pdf.sections,
                            charts: checked === true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="pdfCharts" className="cursor-pointer text-sm">
                      Diagramme
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="pdfRecommendations"
                      checked={settings.pdf.sections.recommendations}
                      onCheckedChange={(checked) =>
                        updatePDF({
                          sections: {
                            ...settings.pdf.sections,
                            recommendations: checked === true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="pdfRecommendations" className="cursor-pointer text-sm">
                      Empfehlungen
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Kontaktdaten-Gate */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-purple-400" />
            Kontaktdaten-Gate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="contactRequired"
              checked={settings.contactGate.required}
              onCheckedChange={(checked) =>
                updateContactGate({ required: checked === true })
              }
            />
            <Label htmlFor="contactRequired" className="cursor-pointer">
              Kontaktdaten erforderlich
            </Label>
          </div>

          {settings.contactGate.required && (
            <>
              <div className="pt-2 border-t border-white/10 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Erforderliche Felder
                </Label>
                <div className="space-y-2">
                  {(["name", "email", "phone", "company"] as const).map(
                    (field) => (
                      <div key={field} className="flex items-center gap-3">
                        <Checkbox
                          id={`contact-${field}`}
                          checked={settings.contactGate.fields.includes(field)}
                          onCheckedChange={(checked) => {
                            const fields = checked
                              ? [...settings.contactGate.fields, field]
                              : settings.contactGate.fields.filter((f) => f !== field);
                            updateContactGate({ fields });
                          }}
                        />
                        <Label
                          htmlFor={`contact-${field}`}
                          className="cursor-pointer text-sm capitalize"
                        >
                          {field === "name"
                            ? "Name"
                            : field === "email"
                            ? "E-Mail"
                            : field === "phone"
                            ? "Telefon"
                            : "Firma"}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-3">
                <Label className="text-xs text-muted-foreground">
                  Was sieht der Besucher VOR Eingabe?
                </Label>
                <select
                  value={settings.contactGate.teaserType}
                  onChange={(e) =>
                    updateContactGate({
                      teaserType: e.target.value as SettingsType["contactGate"]["teaserType"],
                    })
                  }
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
                >
                  <option value="blurred_total">
                    Gesamt-Ergebnis (verschwommen)
                  </option>
                  <option value="partial_results">Teilweise Ergebnisse</option>
                  <option value="chart_preview">Diagramm-Vorschau</option>
                  <option value="custom_text">Custom Text</option>
                </select>
                {settings.contactGate.teaserType === "custom_text" && (
                  <div className="space-y-2">
                    <Label className="text-xs">Teaser-Text</Label>
                    <Input
                      value={settings.contactGate.teaserText || ""}
                      onChange={(e) =>
                        updateContactGate({ teaserText: e.target.value })
                      }
                      placeholder="Geben Sie Ihre Kontaktdaten ein, um..."
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Vorschau-Optionen
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="showTotalBefore"
                      checked={settings.contactGate.showBeforeContact.totalResult}
                      onCheckedChange={(checked) =>
                        updateContactGate({
                          showBeforeContact: {
                            ...settings.contactGate.showBeforeContact,
                            totalResult: checked === true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="showTotalBefore" className="cursor-pointer text-sm">
                      Gesamt-Ergebnis anzeigen
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="showPartialBefore"
                      checked={settings.contactGate.showBeforeContact.partialResults}
                      onCheckedChange={(checked) =>
                        updateContactGate({
                          showBeforeContact: {
                            ...settings.contactGate.showBeforeContact,
                            partialResults: checked === true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="showPartialBefore" className="cursor-pointer text-sm">
                      Teilweise Ergebnisse anzeigen
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="showChartBefore"
                      checked={settings.contactGate.showBeforeContact.chartPreview}
                      onCheckedChange={(checked) =>
                        updateContactGate({
                          showBeforeContact: {
                            ...settings.contactGate.showBeforeContact,
                            chartPreview: checked === true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="showChartBefore" className="cursor-pointer text-sm">
                      Diagramm-Vorschau anzeigen
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

