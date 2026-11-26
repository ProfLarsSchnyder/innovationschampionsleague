# 🏆 Innovations-Champions-League

Ein kurzes, interaktives K.-o.-Turnier für den BWL-Unterricht am Gymnasium Laufen.

**Leitfrage:** Welche Innovation der letzten 100 Jahre hat die Wirtschaft und das Leben der Menschen am stärksten verändert?

## GitHub Pages aktivieren

1. Im Repository auf **Settings** klicken.
2. Links **Pages** öffnen.
3. Unter **Build and deployment** bei **Source** die Option **Deploy from a branch** auswählen.
4. Als Branch **main** und als Ordner **/(root)** festlegen und **Save** klicken.
5. Anschliessend ist die Seite hier erreichbar:

**https://proflarsschnyder.github.io/innovationschampionsleague/**

## Gruppenlinks

Jede der drei Gruppen öffnet genau einen Link:

- Gruppe 1: https://proflarsschnyder.github.io/innovationschampionsleague/?gruppe=1
- Gruppe 2: https://proflarsschnyder.github.io/innovationschampionsleague/?gruppe=2
- Gruppe 3: https://proflarsschnyder.github.io/innovationschampionsleague/?gruppe=3

Alternativ können die Lernenden auf der Startseite ihre Gruppe anklicken.

Jede Gruppe erhält bei Spielbeginn eine **eigene zufällige Auslosung** der gleichen 16 Innovationen. Es gibt acht Achtelfinals, vier Viertelfinals, zwei Halbfinals, ein Spiel um Platz 3 und ein Finale, also **16 Klickentscheidungen**. Am Schluss erscheinen Gold, Silber und Bronze auf einem Siegerpodest.

## Bilder hinzufügen

Die Anwendung ist auf die **exakten Originaldateinamen** abgestimmt. Du musst die heruntergeladenen Bilder nicht umbenennen.

1. Öffne im GitHub-Repository den Ordner `bilder`.
2. Wähle **Add file → Upload files** und lade die 16 Dateien hinein.
3. Wähle **Commit changes**.

| Innovation | Exakter Dateiname |
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

**Wichtig:** Gross- und Kleinschreibung sowie die Sonderzeichen müssen übereinstimmen, insbesondere `Düsenflugzeug.jpg`, `3DDrucker.png`, `Industrieroboter.jpeg` und `KI.png`. Falls du die Bilder versehentlich direkt in den Hauptordner hochlädst, versucht die Anwendung auch, sie dort zu laden. Wenn noch kein Bild verfügbar ist, bleibt als Platzhalter ein Emoji sichtbar.

Tipp: Bilder möglichst als Querformat verwenden und für schnelle Ladezeiten komprimieren.

## Bedienung

1. Gruppe auswählen (oder direkten Gruppenlink öffnen).
2. Auf **Turnier starten** klicken.
3. Pro Duell gemeinsam diskutieren und eine der beiden grossen Innovationskarten anklicken.
4. Nach dem Spiel das Podest zeigen. Bei Bedarf lässt sich der gesamte Turnierverlauf aufklappen.

**Keine Registrierung, keine Texteingabe und keine Installation.** Der Stand wird im jeweiligen Browser lokal gespeichert, damit ein versehentliches Neuladen nicht alles löscht. **Wichtig:** Bei einem Gerätewechsel werden die Ergebnisse nicht synchronisiert. Jede Gruppe soll ihr Turnier möglichst auf einem einzigen Gerät spielen.

Mit **Letzte Entscheidung zurück** kann man eine falsche Auswahl korrigieren. **Neu auslosen** setzt das aktuelle Turnier nach Rückfrage zurück.

## Technisches

Die Anwendung läuft vollständig auf GitHub Pages. Dateien:

- `index.html` Einstieg
- `styles.css` Gestaltung
- `app.js` Turnierlogik und die 16 Kandidaten
- `bilder/` selbst hochgeladene Fotos

Keine externen Bibliotheken und kein Backend erforderlich.