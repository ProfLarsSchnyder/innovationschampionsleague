# 🏆 Innovations-Champions-League

Ein interaktives 16er-K.-o.-Turnier über **Innovationen der letzten 100 Jahre**, direkt auf GitHub Pages spielbar.

**Leitfrage:** Welche Innovation hat Wirtschaft und Gesellschaft am stärksten verändert?

## Website

https://proflarsschnyder.github.io/innovationschampionsleague/

Falls noch nicht aktiviert: Repository → **Settings** → **Pages** → **Deploy from a branch** → `main` / `(root)` → **Save**.

## Spielablauf

1. **Jetzt auslosen** anklicken. Es erscheint eine kurze animierte Auslosung mit acht zufälligen Paarungen.
2. Der gesamte **Turnierbaum** wird angezeigt. Auf die kleinen Fotos klicken, um sie grösser zu sehen.
3. **Achtelfinale starten** anklicken, dann in jedem Duell nur auf die gewünschte Innovation klicken.
4. Vor **Viertelfinale**, **Halbfinale**, **Spiel um Platz 3** und **Finale** erscheint jeweils automatisch erneut der aktuelle Turnierbaum.
5. Am Ende erscheint ein **Siegerpodest** für Platz 1, 2 und 3. Der Turnierverlauf lässt sich ebenfalls anzeigen.

Es gibt acht Achtelfinals, vier Viertelfinals, zwei Halbfinals, ein Spiel um Platz 3 und ein Finale, insgesamt **16 Klickentscheidungen**.

**Keine Gruppenauswahl, kein Account und keine Texteingabe.** Alle Gruppen öffnen dieselbe Website, jede startet unabhängig eine eigene zufällige Auslosung auf ihrem Gerät. Die Daten werden nur im Browser des jeweiligen Geräts gespeichert. Die Website synchronisiert keine Gruppenstände.

Ein laufendes Turnier bleibt auch nach dem Neuladen erhalten. Es gibt **keine Rückgängig-Funktion**, nur den **kompletten Neustart** mit neuer Auslosung und Sicherheitsabfrage.

## Bilder

Die 16 Bilder liegen im Ordner `bilder/`. Die Zuordnung erfolgt direkt über die Namen in `app.js`.

| Innovation | Dateiname |
| --- | --- |
| Fernseher | `Fernseher.jpg` |
| Antibiotika | `Antibiotika.jpg` |
| Vollautomatische Waschmaschine | `Waschmaschine.png` |
| Mikrowelle | `Mikrowelle.jpg` |
| Computer | `Computer.jpg` |
| Düsenflugzeug | `Düsenflugzeug.jpg` |
| Solarzellen | `Solarzellen.jpg` |
| Industrieroboter | `Industrieroboter.jpeg` |
| Internet | `Internet.jpg` |
| Mobiltelefon | `Mobiltelefon.jpg` |
| Digitalkamera | `Digitalkamera.jpg` |
| GPS-Navigation | `GPS.jpg` |
| 3D-Drucker | `3DDrucker.png` |
| Musikstreaming | `Musikstreaming.jpg` |
| Smartphone | `Smartphone.jpg` |
| Generative KI | `KI.png` |

## Dateien

- `index.html`: Einstiegspunkt
- `styles.css`: Design und Animationen
- `app.js`: Spiel, Auslosung, Runden, Turnierbaum, Bildvergrösserung und Siegerpodest
- `bilder/`: Bilder der Innovationen

Statische HTML/CSS/JavaScript-Anwendung ohne externe Bibliotheken oder Backend.
