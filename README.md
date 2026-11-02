# 🍄 MycoBox

**Natürlich wachsen. Gemeinsam verstehen. Einfach bedienen.**

MycoBox ist ein interaktiver Hochschulprototyp für die verständliche und möglichst barrierearme Bedienung einer Pilz-Growbox. Wähle eine Pilzkultur, beobachte ihren virtuellen Verlauf und entdecke, wie Temperatur, Luftfeuchtigkeit, Licht und Belüftung im Demo-Modell zusammenwirken.

Die Anwendung verbindet eine Pilzbibliothek mit mehreren virtuellen Growboxen, kontextbezogener Hilfe und dem Sprachassistenten **Champ**.

> **Prototyp statt echter Gerätesteuerung:** Messwerte, Geräteverbindungen, Wachstum und Geräteaktionen sind simuliert. Die Anwendung liefert keine Gesundheitsdiagnose, Bestimmungshilfe oder Freigabe zum Verzehr. Die Basisdemo funktioniert ohne Anmeldung und ohne API-Schlüssel; freie KI-Gespräche sind optional.

## Inhalt

- [Was MycoBox bietet](#was-mycobox-bietet)
- [Lokal starten](#lokal-starten)
- [Den Prototyp ausprobieren](#den-prototyp-ausprobieren)
- [Sprachen und barrierearme Bedienung](#sprachen-und-barrierearme-bedienung)
- [Mit Champ sprechen](#mit-champ-sprechen)
- [Growboxen und lokale Daten](#growboxen-und-lokale-daten)
- [Entwicklung und Projektstruktur](#entwicklung-und-projektstruktur)
- [Prüfstand und bekannte Grenzen](#prüfstand-und-bekannte-grenzen)

## Was MycoBox bietet

| Bereich | Funktionen |
| --- | --- |
| **Dashboard** | Aktive Kultur, Klimawerte, Hinweise und Gerätestatus der ausgewählten Growbox auf einen Blick. |
| **Pilzbibliothek** | 15 Einträge mit Fotos, Suche, Filtern, Detailseiten und passenden Beispielprofilen. |
| **Mehrere Growboxen** | Auswahl nach Name, ID und Standort; eigene Kulturen, Einstellungen und Verläufe; erkennbare Online-/Offline-Simulation. |
| **Klima und Technik** | Temperatur, Luftfeuchtigkeit, Umluft, Frischluft und sichtbares Licht mit Automatik- und manuellem Modus. |
| **Wachstumsverlauf** | Fünf vereinfachte Phasen, schematische Entwicklungsbilder sowie Klimadiagramm und Datentabelle. |
| **Wasser und Hinweise** | Tankfüllstand, getrenntes Nachfüllen und Wechseln, Wartungserinnerungen und Benachrichtigungscenter. |
| **Champ** | Geführtes Tutorial, Vorlesefunktion und Sprachassistent mit optionaler Mistral-Anbindung. |
| **Bedienhilfen** | Fragezeichen-Hilfe, drei Schriftgrößen, Kontrastmodus, einfache Sprache und große Plus-/Minus-Tasten. |
| **Rezeptideen** | 26 lokale Rezeptkompositionen mit Zutaten, Zubereitungsschritten und passenden Pilzzuordnungen. |

### Einstellungen bewusst übernehmen

Klima- und Gerätefelder bearbeiten zunächst einen **Entwurf**. Erst **„Einstellungen übernehmen“** wendet ihn an. Ungültige Werte verhindern die Übernahme. Beim Verlassen der Steuerung oder beim Wechsel zu einer anderen Growbox schützt ein Dialog vor dem unbeabsichtigten Verlust nicht übernommener Änderungen.

Aktuelle Messwerte, gespeicherte Sollwerte und ausgeführte Geräteaktionen bleiben getrennt erkennbar.

## Lokal starten

### Voraussetzungen

- Node.js ab **22.12**
- npm
- Ein aktueller Browser; Sprachfunktionen hängen zusätzlich von Browser, Berechtigungen und verfügbaren Gerätestimmen ab.

### Installation

```sh
git clone https://github.com/amelieberger21/Growbox.git
cd Growbox
npm ci
npm run dev
```

Öffne die im Terminal angezeigte Adresse, normalerweise **[http://127.0.0.1:5173](http://127.0.0.1:5173)**. Ist der Port belegt, verwendet Vite einen freien Port. Zum Beenden im Terminal `Ctrl+C` drücken.

**Auf dem Mac:** Alternativ lässt sich die Datei [`MycoBox starten.command`](<MycoBox starten.command>) im Finder doppelklicken. Sie verwendet eine vorhandene Node-Installation oder die lokale Codex-Laufzeit, startet die Vorschau und öffnet den Browser. Das Terminal während der Nutzung geöffnet lassen.

Die Basisdemo benötigt nach der Installation keine externe KI-Anbindung. Ihre Bilder, Schriften und Rezeptdaten liegen lokal im Projekt. Die optionale Browser-Spracherkennung kann trotzdem einen externen Dienst des Browseranbieters verwenden.

## Den Prototyp ausprobieren

1. **Überblick gewinnen:** Öffne das Dashboard und beachte die ausgewählte Growbox sowie den dauerhaften Demo-Hinweis.
2. **Pilz entdecken:** Suche in der Bibliothek beispielsweise nach „Igelstachelbart“ und öffne die Details. Suche, Filter und Sortierung bleiben in der URL erhalten.
3. **Kultur vorbereiten:** Wähle bei einer verbundenen Demo-Box „In meiner Growbox anbauen“. Eine vorhandene Kultur wird erst nach deiner Bestätigung ersetzt.
4. **Simulation starten:** Starte die vorbereitete Kultur unter „Meine Growbox“.
5. **Bedienung testen:** Ändere Sollwerte per Slider, Zahlenfeld oder Plus-/Minus-Tasten. Übernimm den Entwurf ausdrücklich.
6. **Zusammenhänge beobachten:** Öffne „Demo-Szenarien“ und simuliere beispielsweise erhöhtes CO₂. Vergleiche Hinweise, Gerätestatus und Ereignisprotokoll.
7. **Verlauf erkunden:** Öffne Wachstumsphasen oder den Klimaverlauf mit seiner Datentabelle. Das reine Lesen einer Phase verändert keine Kultur.
8. **Box wechseln:** Wähle eine andere Growbox. Name, Standort, Kultur und Verlauf beziehen sich anschließend auf diese Box. Offline-Boxen zeigen letzte bekannte Daten und sperren Geräteaktionen.
9. **Hilfe nutzen:** Öffne ein Fragezeichen oder starte Champ. Ein bestätigter Demo-Reset setzt den Betriebszustand der ausgewählten steuerbaren Box zurück; Sprache und Darstellung bleiben erhalten.

## Sprachen und barrierearme Bedienung

### Website-Sprachen

Die Sprachauswahl bietet **20 Sprachen**. In den Einstellungen kannst du nach Sprachname oder Sprachcode suchen.

Deutsch · English · Français · Español · Italiano · Nederlands · Polski · Čeština · Türkçe · Português · Українська · Русский · العربية · فارسی · Română · Ελληνικά · Svenska · Dansk · Norsk bokmål · Suomi

Arabisch und Persisch verwenden eine Leserichtung von rechts nach links. Zahlen und Datumsangaben werden entsprechend der ausgewählten Locale formatiert.

> **Übersetzungsstand:** Die Auswahl von 20 Sprachen bedeutet noch keine vollständige Übersetzung aller Inhalte. Französisch, Spanisch, Italienisch, Niederländisch, Polnisch und Tschechisch enthalten bislang Kernbegriffe. Auch Rumänisch und neue Hilfetexte benötigen Ergänzungen. Fehlende Texte erscheinen auf Deutsch; ein Hinweis in der gewählten Sprache macht dies sichtbar. Die zusätzliche Übersetzung über Mistral konnte zuletzt wegen HTTP 429 nicht abgeschlossen werden.

### Lesen, verstehen und präzise bedienen

- **Drei Schriftgrößen:** Standard, Groß und Sehr groß; relative Schrifteinheiten berücksichtigen zusätzlich die Browser-Textgröße.
- **Kontrast und Symbole:** Deutlichere Konturen, beschriftete Zustände und erkennbare Symbole ergänzen die Farbgebung. Informationen werden nicht allein durch Farben vermittelt.
- **Große Bedienelemente:** Mindestens 48 Pixel hohe Schaltflächen; Plus-/Minus-Tasten mit mindestens 52 × 52 Pixel Trefferfläche und 16 Pixel Abstand.
- **Präzise Schritte:** Temperatur in 0,5 °C, Luftfeuchtigkeit und Helligkeit in einem Prozentpunkt, Demo-CO₂ in 50 ppm. Slider und Schritttasten verwenden denselben Wert und beachten dieselben Grenzen.
- **Kontextbezogene Hilfe:** Fragezeichen erklären Bedeutung, Bedienung und Grenzen der wichtigsten Funktionsgruppen, ohne Einstellungen zu verändern.
- **Tastatur und Screenreader:** Sichtbarer Fokus, beschriftete Eingaben, native Dialoge mit Escape und Rückkehr zum auslösenden Bedienelement.
- **Vorlesen und einfache Sprache:** Kürzere Kerntexte sowie Start, Pause, Fortsetzen, Stopp, Wiederholen und einstellbare Vorlesegeschwindigkeit.

Das Projekt orientiert sich an den Zielen von WCAG 2.2 AA. Eine vollständige Konformitätsprüfung oder Zertifizierung liegt nicht vor.

## Mit Champ sprechen

### Start und Bedienung

Drücke **zweimal F innerhalb von 650 ms** oder wähle **„Mit Champ sprechen“**. Gedrückthalten zählt nicht; in Textfeldern wird das Kürzel nicht ausgelöst. Falls ein Screenreader das Tastenkürzel abfängt, steht der beschriftete Startknopf zur Verfügung.

| Aktion | Bedienung |
| --- | --- |
| Gespräch öffnen | Zweimal **F** oder Startknopf |
| Sprache wählen | Sprachauswahl im Champ-Fenster |
| Aufnahme starten oder fortsetzen | **Zuhören** |
| Aufnahme manuell abschicken | **Aufnahme beenden** |
| Gespräch unterbrechen | **Pause** |
| Gespräch und Mikrofon beenden | **Escape** oder Schließen |
| Ohne Mikrofon fragen | Texteingabe im Champ-Fenster |

Der Assistent unterstützt **neun Gesprächssprachen**: Deutsch, Englisch, Französisch, Spanisch, Italienisch, Niederländisch, Polnisch, Tschechisch und Türkisch. Die Auswahl gilt für Spracherkennung, Antworten, Gerätestimme und Rückmeldungen. Sie lässt sich unabhängig von der Website-Sprache wählen oder bei unterstützten Sprachen an diese koppeln. Nicht verfügbare Stimmen und Erkennungsfunktionen werden angezeigt.

Beispielbefehle:

- „Öffne die Growbox und nenne mir die Daten.“
- „Wie hoch ist die Luftfeuchtigkeit?“
- „Erkläre mir die aktuelle Wachstumsphase.“
- „Liste meine Growboxen auf.“
- „Öffne GB-002.“
- „Zeige die Growbox in Raum 3.“

Bei mehreren passenden Boxen fragt Champ nach einer eindeutigen ID. Er verwendet den aktuellen Boxkontext und kennzeichnet Offline-Daten. **Geräteparameter werden nicht per Sprachbefehl verändert und Kulturen nicht automatisch ersetzt.**

### Optionale Mistral-Anbindung

Ohne API-Schlüssel stehen lokale Befehle und Demo-Datenabfragen zur Verfügung. Für freie KI-Gespräche und die serverseitige Transkription benötigst du einen eigenen Mistral-API-Schlüssel.

**Einrichtung über das lokale Eingabefeld:**

1. Starte die Anwendung mit `npm run dev`.
2. Öffne auf derselben lokalen Adresse den Pfad **`/api/assistant/setup`**, normalerweise [Mistral verbinden](http://127.0.0.1:5173/api/assistant/setup).
3. Füge den Schlüssel in das Passwortfeld ein und speichere ihn. Die Einrichtung ist nur auf diesem Computer verfügbar.

**Alternativ über eine Umgebungsdatei:**

Kopiere `.env.example` nach `.env.local`, trage den Schlüssel dort ein und starte den Entwicklungsserver neu:

```dotenv
MISTRAL_API_KEY=DEIN_SCHLUESSEL
MISTRAL_ASSISTANT_MODEL=mistral-small-latest
MISTRAL_TRANSCRIPTION_MODEL=voxtral-mini-transcribe-3
```

`.env.local` ist von Git ausgeschlossen. Der Schlüssel bleibt serverseitig und gehört weder in den Quellcode noch in einen Chat oder eine Variable mit `VITE_`-Präfix. Die Modelle lassen sich über die gezeigten Variablen konfigurieren. Eine gespeicherte Konfiguration bestätigt noch nicht die Gültigkeit des Schlüssels oder verfügbares Kontingent beim Anbieter.

### Audio und Datenübertragung

Mit aktiver KI-Anbindung werden Audioaufnahmen an die Mistral-Transkription gesendet. Fragen, Gesprächsverlauf und relevante simulierte Growbox-Daten gehen an die Mistral Chat API. Die Oberfläche erklärt die Übertragung vor der Aufnahme.

Eine Aufnahme endet nach ungefähr 1,5 Sekunden Sprechpause, spätestens nach 25 Sekunden, oder durch manuelles Beenden. Nach einer Antwort kann Champ erneut zuhören; ohne hörbare Sprache pausiert die Aufnahme. Escape beendet Aufnahme und laufende Anfragen.

Der lokale Server speichert weder Audio noch Gespräch; der Gesprächsverlauf liegt im Arbeitsspeicher des geöffneten Gesprächs. Daraus folgt keine Zusage zur Aufbewahrung beim Anbieter. Mikrofonberechtigung, verfügbare Stimmen und Anbieterlimits beeinflussen die tatsächliche Nutzung.

## Growboxen und lokale Daten

### Eigene Daten für jede Box

Jede Growbox besitzt eine unveränderliche ID, einen editierbaren Namen und einen Standort, zum Beispiel „Küche – Fensterbank“ oder „Raum 3 – Regal links“. Beispielillustrationen helfen bei der Zuordnung; sie sind keine Fotos realer Geräte oder Kameraaufnahmen.

Die Anwendung unterscheidet drei unabhängige Angaben:

| Angabe | Bedeutung |
| --- | --- |
| **Ausgewählt** | Diese Box wird gerade angezeigt und bedient. |
| **Verbunden / Offline** | Simulierter Verbindungszustand der Box. |
| **Kulturstatus** | Zustand ihrer Kultur, etwa Bereit, Läuft, Pausiert oder Abgeschlossen. |

Kultur, Klimaeinstellungen, Tank, Wartung, Messhistorie, Ereignisse, Warnschwellen und Benachrichtigungen bleiben pro Box getrennt. Sprache und Darstellung gelten für die gesamte Anwendung. Neue Boxen starten offline und ohne Messdaten; „Verbindung simulieren“ stellt ausdrücklich simulierte Daten bereit.

### Speicherung und Migration

Die Daten bleiben im `localStorage` des verwendeten Browsers:

| Speicherschlüssel | Inhalt |
| --- | --- |
| `mycobox.fleet.v1` | Growbox-Liste, Auswahl und Betriebszustände |
| `mycobox.demo.v1` | Kompatibilitätsstand der ausgewählten Growbox für das frühere Einzelbox-Modell |
| `mycobox.experience.v1` | Bedienpräferenzen und kompatibler Experience-Stand |
| `mycobox.experience.boxes.v1` | Boxbezogene Bewertungen, Präferenzen und Benachrichtigungen |
| `mycobox.assistant.language` | Gewählte Gesprächssprache |
| `mycobox.assistant.followWebsite` | Kopplung an die Website-Sprache |

Vorhandene Einzelbox-Daten werden in **GB-001** übernommen. Ältere gültige Betriebsstände werden additiv migriert; vorhandene Kultur, Historie und Ereignisse bleiben erhalten. Beschädigte Daten werden geprüft und mit einer Meldung durch einen nutzbaren Ausgangs- oder Kompatibilitätsstand ersetzt. Bei blockiertem Speicher bleibt die Sitzung im Arbeitsspeicher bedienbar. Nicht übernommene Klimaentwürfe und geöffnete Dialoge werden nicht dauerhaft gespeichert.

Es gibt keine Konten, Cloud-Synchronisierung oder dauerhafte Hintergrundüberwachung. Ein anderer Browser oder eine andere lokale Portnummer verwendet einen eigenen Speicherbereich.

### So läuft die Simulation

- **5 reale Sekunden = 1 Demo-Stunde.** Weitergerechnet wird nur in der geöffneten Anwendung, bei verbundener Box und laufender Kultur; Abwesenheit wird nicht nachberechnet.
- **Fünf Wachstumsphasen** verwenden feste Modellgrenzen bei 0 / 10 / 45 / 65 / 90 / 100 Prozent. Bei 100 Prozent stoppt die Kultur als „Abgeschlossen“.
- **Bis zu 168 stündliche Messwerte und 200 Ereignisse** bleiben pro Box erhalten. Historische Sollwerte werden durch neue Einstellungen nicht rückwirkend verändert.
- **Automatik und manuelle Steuerung** bilden vereinfachte Zusammenhänge ab: Frischluft beeinflusst CO₂, Umluft die Temperaturannäherung. Licht besitzt Helligkeit und ein tägliches Zeitfenster, auch über Mitternacht.
- **Tankzustände** unterscheiden ausreichend, niedrig, leer und unbekannt. Unbekannt wird als „–“ dargestellt, nicht als null Prozent. Leerer oder unbekannter Tank sperrt die simulierte Wasserförderung.
- **Systemzeit und Demo-Zeit** sind getrennt: Der Header zeigt die echte lokale Gerätezeit; der Kulturverlauf verwendet eine feste Modellzeit.

## Entwicklung und Projektstruktur

**Technik:** React 19 · TypeScript · Vite · React Router · Tailwind CSS · Lucide · Recharts · react-i18next · Vitest · React Testing Library

```text
src/
├── components/     Gemeinsame UI, Growbox-Verwaltung und Hilfedialoge
├── data/           Pilze, Rezepte, Bildnachweise und Hilfetexte
├── experience/     Champ, Sprache, Vorlesen, Bewertungen und Hinweise
├── i18n/           Sprachkataloge, Locales und Übersetzungshinweise
├── pages/          Seiten und zugehörige Bedienabläufe
├── simulation/     Zentrale Zustandsübergänge und Gerätemodell
├── state/          Growbox-Kontext, Mehrbox-Modell und Persistenz
├── styles/         Bestehendes Design und Bedienhilfen
└── types/          Gemeinsame TypeScript-Typen
server/             Lokale Mistral-Endpunkte und Schlüsseleinrichtung
public/             Lokale Bilder und Growbox-Illustrationen
docs/               Fachlicher Prüfstand und Quellen
```

### Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Lokale Entwicklungsvorschau starten |
| `npm run typecheck` | TypeScript prüfen |
| `npm run lint` | ESLint ausführen |
| `npm test` | Automatisierte Tests ausführen |
| `npm run build` | TypeScript prüfen und Produktionsdateien in `dist/` erzeugen |
| `npm run preview` | Gebauten Stand lokal ansehen |

Die Lockfiles halten die verwendeten Abhängigkeiten fest. Für eine reproduzierbare npm-Installation verwende `npm ci`.

### Seiten und Direktlinks

| Pfad | Seite |
| --- | --- |
| `/` | Dashboard |
| `/pilze` | Pilzbibliothek |
| `/pilze/:slug` | Pilzdetails |
| `/pilze/:slug/rezepte` | Rezeptübersicht |
| `/pilze/:slug/rezepte/:recipeId` | Rezeptdetails |
| `/growbox` | Growbox-Verwaltung und Steuerung |
| `/wachstum` | Visueller Wachstumsverlauf |
| `/wachstum/klima` | Historischer Klimaverlauf |
| `/einstellungen` | Sprache, Darstellung und Hinweise |
| `/hilfe` | Hilfe und Champ |
| `/projekt` | Projektinformationen und Demo-Erklärung |

Unbekannte Routen zeigen eine 404-Ansicht mit Rückweg. Bei statischem Hosting müssen Anwendungsrouten auf `index.html` zurückfallen, damit Neuladen und Direktlinks funktionieren.

**KI beim Hosting:** Die Endpunkte in `server/assistant.ts` werden vom Vite-Plugin bei `npm run dev` und `npm run preview` bereitgestellt. Ein statischer Upload von `dist/` enthält diese Serverfunktionen nicht. Öffentlicher KI-Betrieb benötigt einen entsprechend abgesicherten Server mit Authentifizierung, Zugriffslimits und serverseitiger Secret-Konfiguration. Die lokale Vorschau bindet an `127.0.0.1`.

## Prüfstand und bekannte Grenzen

### Automatisierte Prüfungen

Der zuletzt geprüfte Stand umfasst **140 bestandene Tests in 16 Testdateien** sowie einen erfolgreichen Produktionsbuild. Die Tests decken unter anderem folgende Bereiche ab:

- Auswahl, Suche, Filter und alle 15 Pilzdetail-Zuordnungen
- Kulturabläufe, Entwurfsschutz, Grenzwerte und synchronisierte Schrittbedienung
- Historische Daten, Szenarien, Lichtzeiten und getrennte Wasseraktionen
- Mehrbox-Migration, Datentrennung, Auswahl, Offline-Sperren und Hilfedialoge
- Sprachwechsel, RTL, Sprachbefehle sowie kontrollierte Browser- und Mistral-Schnittstellen
- Rezeptzuordnung und Rücknavigation

Sprachtests verwenden simulierte Schnittstellen. Sie belegen keine reale Erkennungsqualität oder hörbare Ausgabe in jeder Sprache. Echte Mikrofontests, Gerätestimmen und eine umfassende Barrierefreiheitsprüfung bleiben zusätzliche Prüfschritte. Der Build meldet derzeit außerdem einen Hinweis auf große JavaScript-Bundles.

### Fachliche Einordnung und Bildnachweise

Sollwerte, Kulturdauern, Schwierigkeitsgrade und viele Vergleichsbereiche sind synthetische oder vorläufige Projektdaten. Konkrete Studienangaben werden im Projekt separat gekennzeichnet und sind keine universellen Sicherheitsgrenzen. Fehlende oder nicht bestätigte Phasendaten bleiben als unbekannt erkennbar. Eine positive Klimabewertung bestätigt weder Gesundheit noch Genießbarkeit oder Schimmelfreiheit.

Nameko und Goldkäppchen teilen ein Artenprofil; die beiden Champignon-Kulturformen bleiben derselben Art zugeordnet. Stockschwämmchen behält seinen Verwechslungshinweis. Die Kamera-Vorschau besteht aus schematischen Beispielbildern; sie ist kein Livebild und führt keine Bilddiagnose aus. UV ist ein nicht angebundenes Zusatzmodul ohne Wirkungsversprechen.

Weiterführende Dokumentation:

- [Fachlicher Prüfstand und Quellen](docs/Kulturdaten-Pruefstand.md)
- [Bilder, Schriften und weitere Assets](ASSETS.md)
- [Einzelne Bildquellen und Lizenzen](public/mushrooms/LICENSES.md)
- [Growbox-Beispielillustrationen](public/growboxes/README.md)

**Offener Bildrechtepunkt:** Für das neue braune Champignon-Produktfoto von Blue Apron ist keine freie Weiterverwendungslizenz nachgewiesen. Vor einer öffentlichen Website-Veröffentlichung ist eine Nutzungserlaubnis oder ein entsprechend lizenzierter Ersatz erforderlich; die Einzelheiten stehen in den Bildnachweisen.

Die Rezepte sind eigene Zubereitungsideen des Prototyps. Zeit- und Mengenangaben sind keine Garantie für ausreichendes Garen oder zu erwartenden Ertrag. Allgemeine Verzehrhinweise orientieren sich unter anderem an den Informationen des [Bayerischen Landesamts für Gesundheit und Lebensmittelsicherheit](https://www.lgl.bayern.de/lebensmittel/warengruppen/wc_27_pilze/hinweise_verbraucher_pilze.htm) und den [Enoki-Hinweisen der Singapore Food Agency](https://www.sfa.gov.sg/food-safety-tips/food-risk-concerns/risk-at-a-glance/enoki-mushrooms).

Die Mistral-Anbindung verwendet die dokumentierten Schnittstellen für [Transkription](https://docs.mistral.ai/studio/audio/speech-to-text/transcribe-files) und [Chat](https://docs.mistral.ai/api/endpoint/chat).
