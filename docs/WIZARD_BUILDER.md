# Wizard Builder - Benutzerhandbuch

## Übersicht

Der **Drag & Drop Wizard Builder** ist ein visuelles Tool zum Erstellen von interaktiven Kalkulatoren und Lead-Magneten. Mit diesem Tool können Sie ohne Programmierkenntnisse komplexe Multi-Step-Wizards erstellen.

## Schnellstart

### 1. Neuen Lead-Magnet erstellen

1. Gehen Sie zu **Admin → Lead-Magneten → Neu**
2. Wählen Sie den Typ **"Calculator"**
3. Geben Sie Titel, Beschreibung und Slug ein
4. Wechseln Sie zum Tab **"Wizard"**

### 2. Ersten Schritt hinzufügen

1. Klicken Sie auf das **"+"**-Symbol in der Schritt-Liste (mittlere Spalte)
2. Ein neuer Schritt wird erstellt und automatisch ausgewählt

### 3. Felder hinzufügen

**Methode 1: Drag & Drop (Empfohlen)**
- Ziehen Sie ein Feld aus der **Toolbox** (linke Spalte) in die **Vorschau** (rechte Spalte)
- Das Feld wird automatisch zum aktuellen Schritt hinzugefügt

**Methode 2: Über den Editor**
- Klicken Sie auf einen Schritt in der Liste
- Verwenden Sie den Feld-Editor in der mittleren Spalte

### 4. Felder bearbeiten

1. **Klicken Sie auf ein Feld** in der Vorschau
2. Der **Feld-Editor** öffnet sich rechts
3. Bearbeiten Sie:
   - **Label**: Der Text, der dem Benutzer angezeigt wird
   - **Variable**: Der technische Name (wird in Berechnungen verwendet)
   - **Feld-Typ**: Art des Eingabefelds
   - **Validierung**: Pflichtfeld, Min/Max-Werte, etc.

### 5. Felder verschieben

- **Innerhalb eines Schritts**: Ziehen Sie ein Feld nach oben/unten
- **Zwischen Schritten**: Ziehen Sie ein Feld von einem Schritt zu einem anderen

## Feld-Typen

### Text
- **Verwendung**: Namen, Beschreibungen, Freitext
- **Beispiel**: Firmenname, Standort

### Zahl
- **Verwendung**: Numerische Eingaben
- **Beispiel**: Anzahl Benutzer, Budget
- **Validierung**: Min/Max-Werte möglich

### E-Mail
- **Verwendung**: E-Mail-Adressen
- **Validierung**: Automatische E-Mail-Format-Prüfung

### Telefon
- **Verwendung**: Telefonnummern
- **Format**: Flexibel (internationale Formate unterstützt)

### Datum
- **Verwendung**: Datumsauswahl
- **Beispiel**: Startdatum, Enddatum

### Mehrzeilig
- **Verwendung**: Längere Texte
- **Beispiel**: Anforderungen, Notizen

### Auswahl (Select)
- **Verwendung**: Einzelauswahl aus Liste
- **Konfiguration**: Optionen im Format `value|Label` (eine pro Zeile)
- **Beispiel**: 
  ```
  basic|Basis
  premium|Premium
  enterprise|Enterprise
  ```

### Radio-Buttons
- **Verwendung**: Einzelauswahl mit sichtbaren Optionen
- **Konfiguration**: Wie Select

### Checkboxen
- **Verwendung**: Mehrfachauswahl
- **Konfiguration**: Wie Select

### Schieberegler
- **Verwendung**: Numerische Werte mit visueller Eingabe
- **Validierung**: Min/Max-Werte erforderlich

## Preise & Variablen

### Standard-Preise laden

Beim Erstellen eines neuen Calculators werden automatisch Standard-Preise geladen:
- Microsoft Teams Telephony Preise
- Microsoft 365 Lizenz-Preise
- Cloud-Migration Preise
- IT-Outsourcing Preise

### Neue Preise hinzufügen

1. Wechseln Sie zum Tab **"Preise & Variablen"**
2. Klicken Sie auf **"Preis hinzufügen"**
3. Füllen Sie aus:
   - **Name**: Anzeigename (z.B. "Phone System Lizenz")
   - **Variable**: Technischer Name (z.B. `phoneSystemPrice`)
   - **Wert**: Preis in EUR
   - **Einheit**: z.B. "EUR/User/Monat"
   - **Kategorie**: Zur besseren Organisation

### Preise in Berechnungen verwenden

Verwenden Sie den Variablennamen in Ihren Formeln:
```
phoneSystemPrice * users
```

## Berechnungen

### Formel erstellen

1. Wechseln Sie zum Tab **"Berechnungen"**
2. Klicken Sie auf **"Berechnung hinzufügen"**
3. Geben Sie ein:
   - **Label**: Name der Berechnung (wird angezeigt)
   - **Formel**: Mathematische Formel

### Formel-Syntax

**Grundrechenarten:**
```
users * phoneSystemPrice
totalCost / months
(basePrice + addonPrice) * 1.19  // Mit MwSt
```

**Verfügbare Variablen:**
- Alle Feld-Variablennamen (z.B. `users`, `locations`)
- Alle Preis-Variablennamen (z.B. `phoneSystemPrice`)

**Beispiel:**
```
// Monatliche Kosten
monthlyCost = users * phoneSystemPrice + locations * locationPrice

// Jährliche Kosten
yearlyCost = monthlyCost * 12

// Mit Rabatt
discountedCost = yearlyCost * (1 - discountRate)
```

## Live-Vorschau

Die **Live-Vorschau** (rechte Spalte) zeigt:
- **Aktueller Schritt**: Welcher Schritt gerade bearbeitet wird
- **Sichtbare Felder**: Felder, die im gewählten Modus (Schnell/Experten) angezeigt werden
- **Berechnungen**: Live-Ergebnisse der Formeln
- **Preise**: Aktuelle Preis-Variablen

### Modus wechseln

Klicken Sie auf **"Schnell"** oder **"Experten"** um zwischen den Modi zu wechseln:
- **Schnell**: Zeigt nur Pflichtfelder
- **Experten**: Zeigt alle Felder

## Tipps & Best Practices

### 1. Strukturierung
- Beginnen Sie mit einfachen Schritten
- Gruppieren Sie verwandte Felder in einem Schritt
- Verwenden Sie aussagekräftige Schritt-Titel

### 2. Feld-Namen
- Verwenden Sie klare, beschreibende Variablennamen
- Vermeiden Sie Sonderzeichen (außer `_`)
- Beispiel: `numberOfUsers` statt `n1`

### 3. Validierung
- Setzen Sie Min/Max-Werte für Zahlenfelder
- Markieren Sie wichtige Felder als Pflichtfelder
- Verwenden Sie hilfreiche Placeholder-Texte

### 4. Berechnungen
- Testen Sie Formeln mit verschiedenen Werten
- Verwenden Sie aussagekräftige Labels
- Dokumentieren Sie komplexe Formeln im Label

### 5. Preise
- Organisieren Sie Preise in Kategorien
- Verwenden Sie konsistente Einheiten
- Dokumentieren Sie Preise mit Beschreibungen

## Häufige Probleme

### Problem: Feld wird nicht angezeigt
**Lösung**: 
- Prüfen Sie die Sichtbarkeitseinstellungen
- Prüfen Sie, ob der richtige Modus (Schnell/Experten) gewählt ist

### Problem: Berechnung funktioniert nicht
**Lösung**:
- Prüfen Sie die Variablennamen (Groß-/Kleinschreibung beachten)
- Prüfen Sie die Formel-Syntax
- Stellen Sie sicher, dass alle Variablen definiert sind

### Problem: Preise fehlen
**Lösung**:
- Wechseln Sie zum Tab "Preise & Variablen"
- Laden Sie Standard-Preise oder fügen Sie manuell hinzu

### Problem: Drag & Drop funktioniert nicht
**Lösung**:
- Stellen Sie sicher, dass Sie ein Feld aus der Toolbox ziehen
- Ziehen Sie das Feld in die Vorschau (nicht in die Schritt-Liste)
- Prüfen Sie, ob ein Schritt ausgewählt ist

## Erweiterte Funktionen

### Schritt-Effekte
- **Animationen**: Slide, Fade, Scale
- **Feiern**: Konfetti bei Abschluss
- **Sounds**: Sound-Effekte (optional)

### Kontakt-Gate
- Erfordern Sie Kontaktdaten vor dem Ergebnis
- Zeigen Sie Teaser-Ergebnisse
- Blur-Effekt für vollständige Ergebnisse

### PDF-Generierung
- Automatische PDF-Erstellung
- Branding-Anpassung
- Anhang an E-Mail

### Diagramme
- Balkendiagramme
- Kreisdiagramme
- Liniendiagramme
- Vergleichsdiagramme

## Support

Bei Fragen oder Problemen:
1. Prüfen Sie diese Dokumentation
2. Schauen Sie in die Code-Kommentare
3. Kontaktieren Sie den Support

---

**Letzte Aktualisierung**: 2024

