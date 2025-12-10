# 🔊 Sound Effects

Lege hier deine Sound-Dateien ab. Empfohlene Formate: MP3 oder OGG

## Benötigte Dateien

| Datei | Beschreibung | Empfehlung |
|-------|--------------|------------|
| `success.mp3` | Erfolgs-Sound | Kurzes "Ding!" oder Chime |
| `error.mp3` | Fehler-Sound | Kurzes "Buzz" |
| `click.mp3` | Button-Click | Sanftes "Tick" |
| `pop.mp3` | Pop-Sound | Blasen-Pop |
| `whoosh.mp3` | Übergang | Schneller Swoosh |
| `chime.mp3` | Benachrichtigung | Glocken-Ton |
| `coin.mp3` | Punkte/Coins | Mario-Coin-Style |
| `level-up.mp3` | Achievement | Triumphale Fanfare |
| `notification.mp3` | Neue Nachricht | Subtiler Ping |

## Kostenlose Sound-Quellen

- [Freesound.org](https://freesound.org)
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/)
- [Mixkit](https://mixkit.co/free-sound-effects/)
- [Zapsplat](https://www.zapsplat.com)

## Audio-Spezifikationen

- **Format**: MP3 (beste Kompatibilität)
- **Sample Rate**: 44.1kHz
- **Bitrate**: 128-192 kbps
- **Länge**: 0.2 - 1 Sekunde
- **Normalisiert**: Auf -3dB

## Beispiel mit Web Audio API

Falls keine Sound-Dateien vorhanden sind, kann das System auch synthetische Sounds mit der Web Audio API erzeugen. Siehe `lib/utils/sound.ts`.

