import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";
import type { LeadMagnet } from "@/types/lead-magnet";
import QRCode from "qrcode";

// Register custom fonts (optional - you can add your own fonts)
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf' },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
//   ],
// });

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  companyName: string;
  website?: string;
  footerText?: string;
}

interface PersonalizationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  customFields?: Record<string, any>;
}

interface PDFGeneratorConfig {
  leadMagnet: LeadMagnet;
  submissionData: Record<string, any>;
  personalization: PersonalizationData;
  branding: BrandingConfig;
  qrCodeUrl?: string;
  includeChapters?: string[]; // For conditional content based on answers
  template?: "modern" | "classic" | "minimal";
  language?: "de" | "en";
  // Neue Features
  pdfSettings?: {
    sections: {
      inputSummary: boolean;
      calculationDetails: boolean;
      charts: boolean;
      recommendations: boolean;
      customSections?: Array<{ title: string; content: string }>;
    };
  };
  calculations?: Array<{ id: string; formula: string; label?: string; result?: number }>;
  charts?: Array<{
    id: string;
    type: string;
    title: string;
    data?: any;
  }>;
  chartImages?: Record<string, string>; // Chart-ID -> Base64 Image URL
}

// Create dynamic styles based on branding
const createStyles = (branding: BrandingConfig) =>
  StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      padding: 40,
      fontFamily: "Helvetica",
    },
    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: branding.primaryColor,
    },
    logo: {
      width: 120,
      height: 40,
    },
    headerText: {
      fontSize: 10,
      color: "#666666",
    },
    // Title section
    titleSection: {
      marginBottom: 30,
      textAlign: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: "#666666",
      marginBottom: 10,
    },
    personalizedGreeting: {
      fontSize: 16,
      color: "#333333",
      marginTop: 20,
      padding: 15,
      backgroundColor: "#F9FAFB",
      borderRadius: 8,
    },
    // Content sections
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginBottom: 10,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },
    text: {
      fontSize: 11,
      lineHeight: 1.6,
      color: "#374151",
      marginBottom: 8,
    },
    bulletPoint: {
      flexDirection: "row",
      marginBottom: 6,
    },
    bullet: {
      fontSize: 11,
      color: branding.primaryColor,
      marginRight: 8,
    },
    bulletText: {
      fontSize: 11,
      color: "#374151",
      flex: 1,
    },
    // Result box
    resultBox: {
      backgroundColor: branding.primaryColor + "10",
      borderWidth: 1,
      borderColor: branding.primaryColor,
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
    },
    resultTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginBottom: 10,
    },
    resultValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: branding.primaryColor,
    },
    resultLabel: {
      fontSize: 10,
      color: "#666666",
      marginTop: 5,
    },
    // Data table
    table: {
      marginTop: 10,
      marginBottom: 20,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      paddingVertical: 8,
    },
    tableRowAlt: {
      backgroundColor: "#F9FAFB",
    },
    tableCell: {
      fontSize: 10,
      color: "#374151",
      flex: 1,
      paddingHorizontal: 8,
    },
    tableCellLabel: {
      fontWeight: "bold",
      color: "#111827",
    },
    // CTA Section
    ctaSection: {
      backgroundColor: branding.primaryColor,
      borderRadius: 8,
      padding: 20,
      marginTop: 20,
      textAlign: "center",
    },
    ctaTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 8,
    },
    ctaText: {
      fontSize: 11,
      color: "#FFFFFF",
      opacity: 0.9,
      marginBottom: 10,
    },
    ctaButton: {
      backgroundColor: "#FFFFFF",
      color: branding.primaryColor,
      padding: 10,
      borderRadius: 6,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "bold",
    },
    // QR Code
    qrCodeSection: {
      alignItems: "center",
      marginTop: 20,
      padding: 20,
      backgroundColor: "#F9FAFB",
      borderRadius: 8,
    },
    qrCode: {
      width: 100,
      height: 100,
    },
    qrCodeText: {
      fontSize: 10,
      color: "#666666",
      marginTop: 10,
      textAlign: "center",
    },
    // Footer
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },
    footerText: {
      fontSize: 9,
      color: "#9CA3AF",
    },
    footerLink: {
      fontSize: 9,
      color: branding.primaryColor,
    },
    pageNumber: {
      fontSize: 9,
      color: "#9CA3AF",
    },
    // Badges/Tags
    badge: {
      backgroundColor: branding.primaryColor,
      color: "#FFFFFF",
      fontSize: 9,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    // Highlights
    highlight: {
      backgroundColor: "#FEF3C7",
      padding: 4,
      borderRadius: 2,
    },
    // Chart styles
    chartContainer: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: "#F9FAFB",
      borderRadius: 8,
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginBottom: 10,
    },
    chartImage: {
      width: "100%",
      maxHeight: 200,
      marginBottom: 10,
    },
  });

export async function generatePersonalizedPDF(config: PDFGeneratorConfig) {
  const {
    leadMagnet,
    submissionData,
    personalization,
    branding,
    qrCodeUrl,
    includeChapters,
    template = "modern",
    pdfSettings,
    calculations = [],
    charts = [],
    chartImages = {},
  } = config;

  const styles = createStyles(branding);
  
  // Default PDF Settings
  const sections = pdfSettings?.sections || {
    inputSummary: true,
    calculationDetails: true,
    charts: true,
    recommendations: true,
    customSections: [],
  };

  // Generate QR Code if URL provided
  let qrCodeDataUrl: string | null = null;
  if (qrCodeUrl) {
    qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: branding.primaryColor,
        light: "#FFFFFF",
      },
    });
  }

  // Create personalized greeting
  const greeting = personalization.firstName
    ? `Hallo ${personalization.firstName}${
        personalization.lastName ? ` ${personalization.lastName}` : ""
      },`
    : "Hallo,";

  const companyInfo = personalization.company
    ? `Erstellt für ${personalization.company}`
    : "";

  return (
    <Document
      title={leadMagnet.title}
      author={branding.companyName}
      subject={leadMagnet.description}
      creator="LeftClick CLM"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {branding.logoUrl && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={branding.logoUrl} style={styles.logo} />
          )}
          <View>
            <Text style={styles.headerText}>{branding.companyName}</Text>
            {branding.website && (
              <Link src={branding.website} style={styles.headerText}>
                {branding.website}
              </Link>
            )}
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{leadMagnet.title}</Text>
          {leadMagnet.description && (
            <Text style={styles.subtitle}>{leadMagnet.description}</Text>
          )}
          {companyInfo && (
            <Text style={styles.headerText}>{companyInfo}</Text>
          )}
        </View>

        {/* Personalized Greeting */}
        <View style={styles.personalizedGreeting}>
          <Text style={styles.text}>{greeting}</Text>
          <Text style={styles.text}>
            vielen Dank für Ihre Teilnahme! Hier sind Ihre personalisierten
            Ergebnisse.
          </Text>
        </View>

        {/* Results Section */}
        {submissionData.result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Ihre Ergebnisse</Text>
            <View style={styles.resultBox}>
              {typeof submissionData.result === "object" ? (
                Object.entries(submissionData.result).map(([key, value]) => (
                  <View key={key} style={{ marginBottom: 15 }}>
                    <Text style={styles.resultValue}>{String(value)}</Text>
                    <Text style={styles.resultLabel}>
                      {formatLabel(key)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.resultValue}>
                  {String(submissionData.result)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Input Summary Section */}
        {sections.inputSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Ihre Angaben</Text>
            <View style={styles.table}>
              {Object.entries(submissionData.data || submissionData)
                .filter(([key]) => !["result", "contact_info", "calculations"].includes(key))
                .map(([key, value], index) => (
                  <View
                    key={key}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 ? styles.tableRowAlt : {},
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.tableCellLabel]}>
                      {formatLabel(key)}
                    </Text>
                    <Text style={styles.tableCell}>{formatValue(value)}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Calculation Details Section */}
        {sections.calculationDetails && calculations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔢 Berechnungs-Details</Text>
            <View style={styles.table}>
              {calculations.map((calc, index) => (
                <View
                  key={calc.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.tableCellLabel]}>
                    {calc.label || calc.id}
                  </Text>
                  <View style={{ flex: 1, paddingHorizontal: 8 }}>
                    <Text style={[styles.tableCell, { fontSize: 9, fontFamily: "Courier" }]}>
                      {calc.formula}
                    </Text>
                    {calc.result !== undefined && (
                      <Text style={[styles.tableCell, { color: branding.primaryColor, fontWeight: "bold" }]}>
                        = {formatValue(calc.result)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Charts Section */}
        {sections.charts && charts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Diagramme</Text>
            {charts.map((chart) => {
              const chartImage = chartImages[chart.id];
              return (
                <View key={chart.id} style={{ marginBottom: 20 }}>
                  <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 10 }]}>
                    {chart.title}
                  </Text>
                  {chartImage ? (
                    <Image
                      src={chartImage}
                      style={{
                        width: "100%",
                        height: 200,
                        marginBottom: 10,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <View style={[styles.resultBox, { padding: 15 }]}>
                      <Text style={styles.text}>
                        Diagramm: {chart.type} - {chart.title}
                      </Text>
                      {chart.data && (
                        <View style={styles.table}>
                          {Object.entries(chart.data).map(([key, value], idx) => (
                            <View
                              key={key}
                              style={[
                                styles.tableRow,
                                idx % 2 === 1 ? styles.tableRowAlt : {},
                              ]}
                            >
                              <Text style={[styles.tableCell, styles.tableCellLabel]}>
                                {formatLabel(key)}
                              </Text>
                              <Text style={styles.tableCell}>{formatValue(value)}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Recommendations Section */}
        {sections.recommendations && includeChapters && includeChapters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💡 Personalisierte Empfehlungen
            </Text>
            {includeChapters.map((chapter, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{chapter}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Custom Sections */}
        {sections.customSections && sections.customSections.length > 0 && (
          <>
            {sections.customSections.map((customSection, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{customSection.title}</Text>
                <Text style={styles.text}>{customSection.content}</Text>
              </View>
            ))}
          </>
        )}

        {/* QR Code Section */}
        {qrCodeDataUrl && (
          <View style={styles.qrCodeSection}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qrCodeDataUrl} style={styles.qrCode} />
            <Text style={styles.qrCodeText}>
              Scannen Sie den QR-Code für mehr Informationen
            </Text>
          </View>
        )}

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Nächste Schritte?</Text>
          <Text style={styles.ctaText}>
            Vereinbaren Sie ein kostenloses Beratungsgespräch mit unseren
            Experten!
          </Text>
          {branding.website && (
            <Link src={branding.website}>
              <Text style={styles.ctaButton}>Termin vereinbaren →</Text>
            </Link>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {branding.footerText ||
              `© ${new Date().getFullYear()} ${branding.companyName}. Alle Rechte vorbehalten.`}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Seite ${pageNumber} von ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Additional pages for detailed content can be added here */}
    </Document>
  );
}

// Helper: Format field labels
function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Helper: Format values
function formatValue(value: any): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Generate PDF buffer for email attachment
export async function generatePDFBuffer(
  config: PDFGeneratorConfig
): Promise<Buffer> {
  const ReactPDF = await import("@react-pdf/renderer");
  const document = await generatePersonalizedPDF(config);
  
  // Note: In production, use renderToBuffer or renderToStream
  // @ts-ignore - renderToBuffer exists but types may be outdated
  const buffer = await ReactPDF.renderToBuffer(document);
  return buffer;
}

// Simple PDF generation (backwards compatible)
export function generatePDFDocument(
  leadMagnet: LeadMagnet,
  submissionData: Record<string, any>
) {
  const defaultBranding: BrandingConfig = {
    primaryColor: "#6366F1",
    secondaryColor: "#8B5CF6",
    companyName: "Your Company",
  };

  return generatePersonalizedPDF({
    leadMagnet,
    submissionData,
    personalization: submissionData.contact_info || {},
    branding: defaultBranding,
  });
}
