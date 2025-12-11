# Profilbild-Upload Setup

## Datenbank-Migration durchführen

Die Migration `006_add_profile_pictures.sql` muss auf deine Supabase-Datenbank angewendet werden.

### Option 1: Über Supabase Dashboard

1. Gehe zum Supabase Dashboard
2. Navigiere zu **SQL Editor**
3. Öffne die Datei `supabase/migrations/006_add_profile_pictures.sql`
4. Kopiere den Inhalt und führe ihn im SQL Editor aus

### Option 2: Mit Supabase CLI

```bash
supabase db push
```

## Was wird eingerichtet?

Die Migration führt folgende Änderungen durch:

1. **Neues Feld**: Fügt `avatar_url` zur `users`-Tabelle hinzu
2. **Storage Bucket**: Erstellt einen öffentlichen Bucket namens `avatars`
3. **Sicherheitsrichtlinien**:
   - Jeder kann Avatare ansehen (public read)
   - Benutzer können nur ihre eigenen Avatare hochladen
   - Benutzer können nur ihre eigene Avatare aktualisieren/löschen

## Features

- ✅ Profilbild-Upload über die Profilseite
- ✅ Automatisches Löschen alter Profilbilder beim Upload neuer
- ✅ Validierung: Nur Bilddateien, max 5MB
- ✅ Loading-Status während Upload
- ✅ Anzeige hochgeladener Bilder
- ✅ Fallback auf Initialen-Avatar wenn kein Bild vorhanden

## Technische Details

- **Storage Path**: `{user_id}/{timestamp}.{extension}`
- **Max. Dateigröße**: 5MB
- **Erlaubte Formate**: Alle Bildformate (image/*)
- **Public URL**: Bilder sind öffentlich zugänglich über Supabase Storage

## Nutzung

1. Gehe zu **Admin > Profil**
2. Bewege die Maus über das Profilbild
3. Klicke auf das Kamera-Icon
4. Wähle ein Bild aus (max 5MB)
5. Das Bild wird automatisch hochgeladen und gespeichert


