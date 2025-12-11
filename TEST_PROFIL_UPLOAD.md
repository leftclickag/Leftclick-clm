# Test-Anleitung: Profilbild-Upload

## Setup abgeschlossen ✅

Der Storage-Bucket ist korrekt eingerichtet und funktioniert.

## Verbesserungen im Code

1. **Ausführliches Logging** - Jeder Schritt wird in der Browser-Console geloggt
2. **Visuelles Feedback** - Blaue Benachrichtigung während Upload
3. **Bessere Fehlerbehandlung** - Klare Fehlermeldungen

## Test-Schritte

1. **Browser-Console öffnen**
   - Chrome/Edge: F12 oder Rechtsklick > "Untersuchen" > Tab "Console"
   - Die Console zeigt alle Debug-Meldungen

2. **Zur Profilseite navigieren**
   - Gehe zu `/admin/profile`

3. **Profilbild hochladen**
   - Bewege die Maus über das Profilbild
   - Klicke auf das Kamera-Icon
   - Wähle ein Bild aus (max 5MB)

4. **Console beobachten**
   
   Du solltest folgende Meldungen sehen:
   ```
   🖱️ Upload-Button geklickt
   🖼️ handleAvatarUpload aufgerufen
   Datei ausgewählt: [filename] [size] [type]
   ✅ Validierung erfolgreich, starte Upload...
   Uploading avatar to path: [user-id]/[timestamp].[ext]
   Upload successful: {...}
   Public URL: [url]
   ✅ Profile updated successfully
   🎉 Upload abgeschlossen!
   ```

5. **Visuelles Feedback**
   - Während Upload: Blaue Benachrichtigung "Profilbild wird hochgeladen..."
   - Nach Upload: Grüne Benachrichtigung "Änderungen erfolgreich gespeichert!"
   - Das neue Bild sollte sofort angezeigt werden

## Fehlersuche

### Wenn Button-Klick nicht funktioniert:
- Prüfe Console auf: "🖱️ Upload-Button geklickt"
- Falls nicht angezeigt → JavaScript-Problem im Browser

### Wenn Dateiauswahl nicht erscheint:
- Prüfe, ob der File-Dialog sich öffnet
- Falls nicht → Browser-Problem oder Security-Policy

### Wenn nach Dateiauswahl nichts passiert:
- Prüfe Console auf: "🖼️ handleAvatarUpload aufgerufen"
- Falls nicht angezeigt → Event-Handler nicht ausgelöst
- Schaue nach Fehlermeldungen in der Console

### Wenn Upload fehlschlägt:
- Prüfe die genaue Fehlermeldung in der Console
- Mögliche Fehler:
  - ❌ Kein Profil geladen → Seite neu laden
  - ❌ Ungültiger Dateityp → Nur Bilder erlaubt
  - ❌ Datei zu groß → Max 5MB
  - Storage upload error → Permissions-Problem
  - Database update error → RLS-Policy-Problem

## Nächste Schritte

1. Teste den Upload
2. Kopiere die Console-Logs
3. Teile mir mit:
   - Was passiert (oder nicht passiert)?
   - Welche Meldungen in der Console erscheinen?
   - Gibt es Fehler?

