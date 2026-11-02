# MycoBox – Natürlich wachsen.

Deutschsprachiger, klickbarer Hochschulprototyp mit einer virtuellen Growbox und genau 15 Pilzeinträgen. **Messwerte, Geräteaktionen, Wachstum, Zeiten und Profile sind vollständig simuliert.** Kein Backend, Login oder API-Schlüssel nötig. Nach der Installation funktioniert die Demo ohne externe Dienste.

## Auf diesem Mac starten

Im Finder **`MycoBox starten.command` doppelklicken**. Die Datei nutzt eine vorhandene Node-Installation oder die lokale Codex-Laufzeit, startet Vite und öffnet den Browser. Das Terminal geöffnet lassen; zum Beenden `Ctrl+C` drücken.

Alternativ mit Node.js ab 22.12 (empfohlen 24 LTS) und npm:

```sh
npm install
npm run dev
```

Die im Terminal ausgegebene Adresse öffnen, normalerweise **http://127.0.0.1:5173**. Bei belegtem Port wählt Vite einen freien Port. Die verwendeten Versionen sind in Lockfiles festgehalten. Reproduzierbare Neuinstallation: `npm ci`. Alternativ funktioniert `pnpm install`.

## Prüfen und bauen

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

Build-Ausgabe: `dist/`. Routen: `/`, `/pilze`, `/pilze/:slug`, `/growbox`, `/wachstum`, `/projekt`. Unbekannte Routen haben eine 404-Ansicht mit Rückweg. Vite unterstützt Direktlinks. Für späteres statisches Hosting **alle nicht vorhandenen Dateipfade mit HTTP 200 auf `/index.html` umschreiben**, damit Neuladen und Detail-Direktlinks funktionieren.

## Vorführablauf

1. Dashboard öffnen: initial Austernseitling, Tag 20 von 28, rund 68 %, 21,2 °C, 88 %, 850 ppm. Dauerhaften Demo-Hinweis erklären.
2. Bibliothek → nach „Igelstachelbart“ suchen → Details. „Kraeuterseitling“ funktioniert ebenfalls. Suche, Filter und Sortierung bleiben in URL-Parametern erhalten.
3. „In meiner Growbox anbauen“ → Vorschau → „Kultur vorbereiten“. Eine bestehende Kultur wird erst bei Bestätigung ersetzt. Abbrechen verändert nichts.
4. „Demo starten“: neue Kultur bei 0 % in der Vorbereitung.
5. „Manuell“ auswählen, Belüftung ausschalten, „Einstellungen übernehmen“. Entwürfe wirken vorher nicht. Ungültige Eingaben blockieren die Übernahme; beim Verlassen mit Entwurf erscheint ein Dialog.
6. „Demo-Szenarien“ aufklappen → „CO₂ erhöht“. Simulierten Hinweis und Ereignisprotokoll zeigen. „Normalbetrieb“ setzt Istwerte auf Sollwerte und CO₂ auf 850 ppm. Bei weiterhin ausgeschalteter Belüftung steigt CO₂ anschließend erneut – die beabsichtigte Modellrückmeldung.
7. Wachstumsverlauf → andere Phase zum Lesen anklicken (keine Zustandsänderung). Einen Demo-Tag vorspulen oder zur nächsten Phasengrenze springen.
8. Demo pausieren und neu laden: Zustand bleibt erhalten, Zeit und Messwerte stehen still.
9. Projektseite → „Demo vollständig zurücksetzen“ → bestätigen. Die komplette Ausgangsdemo wird wiederhergestellt.

## Modell, Architektur und Speicherung

React + TypeScript (strict), Vite, Tailwind CSS, React Router, Lucide, Recharts. `src/data` enthält getrennte Bibliothekseinträge, Artenprofile und Demo-Profile; `src/simulation` die zentrale Regelung, Grenzwerte und den Reducer; `src/state` Context und validierte Persistenz. `src/pages` enthält die sechs Hauptseiten sowie Details und 404. Alle Illustrationen und Schriften sind lokal.

- Eine Context-/Reducer-Instanz für alle Seiten. Ein Tick alle fünf realen Sekunden entspricht einer simulierten Stunde. Simulation nur bei geöffneter Anwendung und Status „Läuft“. Keine Nachberechnung von Abwesenheit.
- Reproduzierbare Schwankungen per gesetztem LCG-Zufallsstartwert. Automatik nähert Temperatur (0,3 °C plus begrenztes Rauschen) und Feuchtigkeit (2 Prozentpunkte plus Rauschen) an. Manuell langsamere Annäherung. Belüftung aus erhöht CO₂, ein senkt es Richtung 850 ppm.
- Synthetische Grenzen zentral in `src/simulation/engine.ts`: Temperatur ± 2 °C, Luftfeuchtigkeit ± 5 Prozentpunkte (0–100 %), CO₂-Hinweis über 1.500 ppm. Bediengrenzen: 10–30 °C in 0,5-Schritten, 60–95 % in ganzen Schritten.
- Phasengrenzen: 0 / 10 / 45 / 65 / 90 / 100 %. Bei 100 % Status „Abgeschlossen“ und Stopp. Ein Profil pro Pilz für alle Phasen: keine biologische Prognose und keine garantierte Erntereife.
- Bis zu 168 stündliche Messwerte mit den damals gültigen Sollwerten sowie 200 Ereignisse. Neue Einstellungen verändern die Vergangenheit nicht. Abweichungen und Behebungen werden einmal pro zusammenhängender Abweichung protokolliert. Szenarien verändern den Messpunkt der aktuellen Demo-Stunde; Zeitraffer verarbeitet jede Stunde einzeln.
- Versionierter Schlüssel `mycobox.demo.v1` in `localStorage`. Daten werden geprüft. Bei beschädigten Daten erscheint die Ausgangsdemo mit Meldung; bei blockiertem Speicher funktioniert die Anwendung im Arbeitsspeicher. Entwürfe und Dialoge werden nicht gespeichert.
- Die sichtbare Simulationsuhr nutzt eine feste Zeitbasis als Modellzeit (UTC-Anzeige, keine echte Ortszeit). Deutsche Zahlen- und Datumsformatierung.
- Nameko/Goldkäppchen teilen ein Arten- und Demo-Profil. Beide Champignons teilen die Artzuordnung, bleiben als Kulturformen eigenständig.

## Prüfungen

Die ursprünglichen 37 Vitest-/Testing-Library-Prüfungen decken alle 15 Detail-Direktlinks, Katalog, Profilreferenzen, Umlautsuche, kombinierte Filter, Zustandsübergänge, Grenzen, historische Sollwerte, Reproduzierbarkeit, Szenarien, Ereignisbegrenzung, Phasensprünge, Abschluss, Persistenz, Reset und den kompletten Auswahl-/Steuerungsablauf inklusive Abbruch und Entwurfsschutz ab. jsdom nutzt einen Dialog-Shim; native Dialogfokussierung und Layout werden zusätzlich im Browser geprüft. Die Diagrammtabelle zeigt dieselben Daten wie das Diagramm. Sparklines sind rein dekorativ.

## Fachlicher Prüfstand

- **Synthetisch (`demo`):** alle Sollwerte, Schwierigkeitsgrade, Zeiten, Vergleichsbereiche und Phasengrenzen. Keine Anbauempfehlung, keine Ertragsmenge und kein Ernteversprechen.
- **Quellengeprüft:** Goldkäppchen als Handelsname für Nameko (BZfE), Verwechslungsgefahr von Stockschwämmchen/Gifthäubling (Universitätsklinikum Freiburg), allgemeine Einordnung kontrollierter Indoor-Kultur (Cornell).
- **Noch zu prüfen (`unverified`):** weitere artspezifische Beschreibungen, Zuordnungen, Substrat-/Pflege-/Licht-/Frischlufteinordnungen aus dem Projektkonzept und reale Growbox-Eignung. Die ursprünglich verlinkte DGfM-Artenliste leitet inzwischen auf eine allgemeine Seite weiter und wird nicht als geprüftes Artenprofil ausgegeben.
- Kein Bestimmungswerkzeug. Stockschwämmchen hat einen dauerhaften Warnhinweis. Keine Heilwirkungen. Keine erfundenen Hochschul- oder Teamnamen.

Quellen und ihre Geltungsbereiche stehen auf der Projektseite und im Katalog. Bild-/Schriftlizenzen: [ASSETS.md](ASSETS.md). Diese Umsetzung liegt lokal im Growbox-Repository und überträgt keine Demo-Daten.

## Erweiterung 2.0: Champ, Sprachen und HCI

Die vorhandenen Seiten, Routen und Kulturabläufe bleiben erhalten. Neu sind `/einstellungen` und `/hilfe`.

### Vollständig implementierte Bedienfunktionen

- **Champ:** eigener freundlicher SVG-Pilz, erstmalige Begrüßung mit zwei aufeinanderfolgenden Fragen in einem Dialog (Tutorial und Vorlesen). Die Antwort wird lokal gespeichert. Neun Tutorialstationen mit echten Routenwechseln, Elementhervorhebung, Schrittanzeige, Zurück/Weiter/Überspringen/Fertig. Keine Kultur wird im Tutorial automatisch ersetzt. Ablehnen erzeugt eine separat schließbare Erinnerung. Dauerhafter Neustart unter Hilfe und Einstellungen.
- **Gerätezeit im Header:** echtes Datum und Uhrzeit aus der lokalen Systemzeit, jede Sekunde aktualisiert, mit sprachabhängiger Formatierung. Die separate Simulationsuhr bleibt klar als Demo-Zeit gekennzeichnet.
- **Deutsch / Englisch / Persisch:** react-i18next, lokale Übersetzungsschlüssel in `src/i18n`, einschließlich Pilznamen, Beschreibungen, Hilfen, Tutorial, Meldungen und Fehlern. Persisch setzt `lang=fa` und `dir=rtl`, spiegelt Navigation und Richtungsicons und nutzt lokal gebündelte Vazirmatn-Schriften. Wissenschaftliche Namen und Urheberangaben bleiben unverändert. Suche berücksichtigt auch übersetzte Pilznamen.
- **Barrierefreiheit:** drei Schriftgrößen, hoher Kontrast, einfache Sprache mit kürzeren Kerntexten und größeren Buttons, sichtbarer Fokus, native Dialogfokusführung, Tastaturbedienung und beschriftete Eingaben. Das Design orientiert sich an WCAG 2.2 AA; es liegt keine formale Konformitätszertifizierung vor.
- **Vorlesen:** Start, Pause, Fortsetzen, Stopp, Wiederholen, Geschwindigkeit und Deaktivieren über Web Speech API. Nur eine aktive Nutzerhandlung startet Audio. Die Stimme muss auf dem Gerät verfügbar sein. Echte `word`-Boundary-Ereignisse markieren das laufende Wort in der Leseleiste; zusätzlich wird der aktuelle Textabschnitt auf der Seite markiert. Ohne zuverlässige Wortgrenzen wird ehrlich auf Abschnittsmarkierung zurückgefallen. Kein simulierter Wort-Timer. Ein Sprach- oder Seitenwechsel stoppt die Ausgabe.
- **Benachrichtigungscenter:** Glocke mit ungelesenem Zähler; einzelne/alle Meldungen als gelesen markieren; Sammeln neuer Meldungen deaktivierbar. Temperatur/Feuchte hoch oder niedrig, CO₂, Wassermangel, fälliger Wasserwechsel, Phasenwechsel und Demo-Abschluss. Eine Demo-Erntephase wird niemals als echte Erntereife ausgegeben. Es werden keine Browser-Berechtigungen angefordert; die internen Meldungen funktionieren ohne Betriebssystem-Push.
- **Wasserwartung:** simulierter Tankfüllstand, letzter Wechsel, nächste Erinnerung, getrennte Aktionen für Nachfüllen und Wechseln, konfigurierbares Intervall von 1–30 Demo-Tagen. Nachfüllen setzt den Wasserwechseltermin ausdrücklich nicht zurück. Tankverbrauch und Erinnerung laufen nach Demo-Zeit, ohne Abwesenheitsnachberechnung.
- **Pilzfotos:** 15 eigene lokale Bildpfade mit korrekter Quellen-/Lizenzdokumentation, siehe ASSETS.md. Echte Fotos mit Hintergrund statt vorgetäuschter Freisteller. Enoki wird als natürliche braune Form gezeigt und beschriftet.
- **Präsentationswerkzeuge:** Istwerte direkt simulieren, gelben/roten Zustand zeigen, Fruchtungsphase demonstrieren, Wassermangel/Wechsel fällig machen, einen Tag vorspulen, Champ starten und Betriebszustand bestätigt zurücksetzen. Diese Werkzeuge befinden sich im aufklappbaren Bereich „Demo-Szenarien“ der Steuerung bzw. des Wachstumsverlaufs.

### Artspezifische Bewertung und Vorschläge

`src/experience/model.ts` hält Kulturbedingungen und eine wiederverwendbare Bewertungsfunktion (`optimal`, `warning`, `critical`, `unknown`). Sie berücksichtigt Art, Phase, Messgröße, Wert, Quelle, Demo-Berechtigung, Warnschwellen und vorherigen Zustand. Eine kleine Hysterese stabilisiert Grenzfälle.

Die Fruchtungsbereiche aus dem Auftrag sind überwiegend **vorläufige Projektdaten**. Die Option „Vorläufige Bereiche als Demo vergleichen“ macht sie ausdrücklich zu Demo-Vergleichsbereichen; wird sie abgeschaltet, bleiben ungeprüfte Bereiche grau. Ohne vorhandene Phasendaten gibt es auch bei aktivem Demo-Vergleich keine grüne Bewertung. Grün bedeutet „Optimal“ **im gekennzeichneten Modell**, Gelb/Rot bedeuten Abweichungen von Kulturbedingungen, keine Aussage über Giftigkeit, Genießbarkeit oder Lebensmittelsicherheit. Die CO₂-Bewertung ist ein konfigurierbarer generischer Demo-Vergleich und kein behaupteter Artgrenzwert.

- **Shimeji:** Temperatur/Feuchte für Besiedlung und Fruchtung sind mit einem konkreten _Hypsizygus marmoreus_-Studienprotokoll belegt; keine universellen Hardware-Grenzen.
- **Nameko/Goldkäppchen:** Beide bleiben _Pholiota nameko_ und teilen ihr Profil. Die im neuen Auftrag abweichenden Goldkäppchen-Zahlen werden als Widerspruch dokumentiert und nicht als zweite verifizierte Art ausgegeben. Der ausgewählte gemeinsame Bereich ist vorläufig; die Primärstudie unterscheidet Induktion und Wachstum.
- **Stockschwämmchen:** keine erfundenen Temperatur-/Feuchtebereiche, daher `unknown`. Der Warnhinweis zur Verwechslung bleibt erhalten.
- **Weitere Phasen, CO₂/Licht und Hardware-Eignung:** fehlende belastbare Zahlen bleiben „Nicht verifiziert“. Vorhandene konkrete Studienangaben werden als solche abgegrenzt. Prüfbericht und genaue Quellen: `docs/Kulturdaten-Pruefstand.md`.

Die Steuerung zeigt einen zur aktuellen Art/Phase berechneten Vorschlag. Eine Vorschau und „Vorschlag in Entwurf laden“ verändern zunächst nur den Entwurf; erst „Einstellungen übernehmen“ wendet ihn an. Fehlende Phasendaten werden nicht ergänzt: dann ist der Vorschlag ausdrücklich das bisherige synthetische Beispielprofil.

### Speicherung und technische Grenzen

Zusätzlich zum unveränderten, validierten Kernschlüssel `mycobox.demo.v1` speichert `mycobox.experience.v1` Sprache, Bedienpräferenzen, Begrüßungsantwort, Wasserzustand und maximal 100 Benachrichtigungen. Tutorial-Schritt und aktuelle Sprachausgabe werden nicht gespeichert. Ein Betriebsreset setzt Kultur, Wasser und Meldungen zurück, erhält aber Sprache und Barrierefreiheit. Die aktuelle Uhrzeit wird niemals als festes Datum hinterlegt.

Die Simulation überwacht nur die offene Anwendung. Kein Backend, keine Hardware, keine permanente Hintergrundüberwachung. Web Speech API und passende lokale Stimmen sind browser-/geräteabhängig; eine tatsächlich hörbare Ausgabe lässt sich nicht für jedes Gerät garantieren. Die vorhandene Text- und Tastaturbedienung bleibt vollständig nutzbar. Für einen Neubeginn der Begrüßung nur den Experience-Speichereintrag in den Browserwerkzeugen löschen oder eine neue Browserumgebung öffnen; das Tutorial kann jederzeit ohne Löschen unter Hilfe gestartet werden.

### Zusätzliche Prüfungen

Vitest und React Testing Library prüfen neben den bisherigen Kulturabläufen: vier Bewertungsstufen, phasenbezogene Shimeji-Daten, gemeinsame Nameko-Identität, Hysterese, konfigurierbare CO₂-Grenzen, unbekannte Daten, Vorschlag ohne Übernahme, Meldungsentprellung und Behebung, getrennte Wasserereignisse, Ausschalten der Meldungen, Pause/Wasserverbrauch, Phasen-/Demo-Erntehinweise, Speicherprüfung, erstmalige Champ-Abfragen, separates Schließen der Erinnerung, alle neun Tutorialstationen, Sprachwechsel/RTL, Darstellungseinstellungen, Benachrichtigungscenter sowie Vorlesestart/Pause/Fortsetzen/Stopp und Boundary-/Fallback-Markierung mit einer kontrollierten Speech-API-Testimplementierung.

Die native Browserprüfung ergänzt: echten Tutorialdurchlauf, Englisch/Persisch, RTL und alle acht Hauptansichten bei 360/768/1440 px – auch mit 130-%-Texten, hoher Kontrastdarstellung und einfacher Sprache. Audio wurde automatisiert gegen eine kontrollierte API geprüft; Gerätestimmen bleiben eine Laufzeitvoraussetzung. Der Quellcode enthält sämtliche Funktionen, die Fotos mit ihren Einzelbelegen und die lokale Startdatei.

## Rezeptideen im Pilzbereich

Optionaler Einstieg **„Rezeptideen“** auf jeder Pilzdetailseite und ein kleiner Link unter dem Fortschritt der aktiven Dashboard-Kultur. Das Dashboard zeigt keine Rezeptkarten; Klima und Steuerung bleiben im Mittelpunkt.

- Routen: `/pilze/:slug/rezepte` und `/pilze/:slug/rezepte/:recipeId`.
- Daten: `src/data/recipes.ts`, vollständig lokal und strukturiert. 26 Rezeptkompositionen, jeweils zwei pro allen 15 Bibliothekseinträgen; Kulturformen derselben Art und Nameko/Goldkäppchen teilen ihre passende Zuordnung. Kein Backend, keine Rezept-API, keine Anmeldung.
- Karten: Name, zugehöriger Pilzeintrag, ungefähre Zubereitungszeit, zwei Portionen und Kennzeichnung Vegan/Vegetarisch. Bewusst ohne Fotos, damit keine unpassenden oder unklar lizenzierten Essensbilder erscheinen.
- Details: vollständige Zutaten mit Mengen und Einheiten, nummerierte Schritte, gut erkennbare Rückwege. Der Rückweg erhält den Pilzeintrag und bei Einstieg aus der Bibliothek auch deren Suche und Filter. Bei Einstieg über die aktive Dashboard-Kultur führt die Listen-Zurückaktion wieder zur Kulturübersicht.
- Leerzustand für Profile ohne Daten und Rückweg zum Pilz; artfremde oder unbekannte Rezept-IDs öffnen keine fremden Rezepte.
- Die Rezeptfunktion ist unabhängig von Klimabewertung, Wachstumsphase und Demo-Abschluss. Sie verändert keine Kultur und gibt keine Essbarkeitsfreigabe. Der angeforderte kurze Verzehrhinweis erscheint auf Listen- und Detailseite. Enoki und Stockschwämmchen behalten zusätzliche passende Hinweise.
- Alle Texte, Zutaten, Einheiten und Schritte sind in Deutsch, Englisch und Persisch vorhanden. Rezeptseiten unterstützen auch RTL, vergrößerte Schrift, Kontrastmodus, Tastaturbedienung und Vorlesen der Zutaten.

Die Rezepte sind eigene Zubereitungsideen für den Prototyp. Zeiten sind ungefähr und kein Nachweis ausreichenden Garens. Mengen sind Einkaufsangaben, keine Ertragsprognosen. Die zugehörigen externen Fachquellen unterstützen ausschließlich allgemeine bzw. artspezifische Zubereitungshinweise, nicht die Rezeptkompositionen:

- Bayerisches Landesamt für Gesundheit und Lebensmittelsicherheit: https://www.lgl.bayern.de/lebensmittel/warengruppen/wc_27_pilze/hinweise_verbraucher_pilze.htm
- Singapore Food Agency, Enoki: https://www.sfa.gov.sg/food-safety-tips/food-risk-concerns/risk-at-a-glance/enoki-mushrooms

Zusätzliche Rezepttests prüfen alle 15 Zuordnungen, gemeinsame Artenprofile, Ablehnung fremder IDs, Zutaten/Schritte, expliziten Leerzustand, aktive Kultur nach Pilzwechsel und den vollständigen Ablauf Bibliothek mit Filter → Pilz → Rezeptliste → Rezeptdetails → zurück bis zur erhaltenen Bibliothekssuche. Abschlussstand: 65 automatisierte Tests für die gesamte Anwendung.

## Visueller Verlauf und Technik (Version 2.1)

Die bestehende Architektur wurde erweitert. `simulation/engine.ts` hält Kultur, Einstellungen, Messwerte und nun auch den Tank samt Wartungszeitpunkt und manueller Beobachtung. `simulation/hardware.ts` leitet daraus die ausgeführten Geräteaktionen für Dashboard und Growbox ab. Es gibt keine zweite Tankinstanz. Der separate Experience-Speicher bleibt für persönliche Einstellungen, Bewertungen und Benachrichtigungen zuständig.

- Auf Pilzdetailseiten stehen die zwei passenden Rezeptkarten direkt im Abschnitt „Rezeptideen“. Derselbe Kartensatz und dieselben 26 lokalen Rezepte werden auch in der separaten Rezeptübersicht verwendet. Ein Detailaufruf aus dem Pilzprofil kehrt dorthin zurück; ein Aufruf aus der Rezeptliste kehrt zur Liste zurück. Abgeschlossene Kulturen behalten ihre Informations- und Rezeptzugänge.
- `/wachstum` zeigt die bestehenden fünf Phasen mit unterschiedlichen Icons, Textstatus, aus denselben Schwellen berechneten Tagesbereichen und eigenen schematischen Illustrationen. Ein Informationsdialog verändert weder Kultur noch Einstellungen. Die eigentliche Übernahme eines Phasenprofils erfolgt weiterhin über den bestehenden Entwurf-/Übernehmen-Ablauf.
- „Blick in die Growbox“ ist dauerhaft als „Kamera-Vorschau · simuliertes Beispielbild“ beschriftet. `exampleFrame` in `components/GrowthVisual.tsx` kapselt die lokale Bildquelle mit Pilz-ID und Phase. Die schematischen Entwicklungsbilder ersetzen unpassende Fotos. Aktuelles Bild und Vergrößerung werden direkt aus derselben aktiven Phase abgeleitet. Es werden keine Kameraberechtigung, Live-Verbindung oder Bilddiagnose verwendet.
- `/wachstum/klima` erhält den historischen Klimaverlauf samt Datentabelle und Ereignissen. Die gemeinsame Unter-Navigation trennt ihn vom visuellen Wachstumsverlauf. Der Dashboard-Klimabereich ist eindeutig beschriftet.
- Umluft und Frischluft haben vier manuelle Stufen. Im Automatikmodus werden die Bedienelemente deaktiviert und ihre Profilsteuerung erklärt. Der aktuelle Gerätestatus bleibt vom Entwurf getrennt. Im bewusst vereinfachten Modell beeinflusst Frischluft CO₂, Umluft die Temperaturannäherung. Bei CO₂ über der zentral definierten Demo-Geräteschwelle von 1.500 ppm steigt automatische Frischluft auf Hoch. Persönliche Bewertungsschwellen sind davon getrennt.
- Sichtbares Licht erhält An/Aus, Helligkeit und tägliche Beginn-/Endzeiten in Demo-Zeit. Zeitfenster über Mitternacht sind unterstützt; Beginn ist einschließlich, Ende ausschließlich. Gleiche, unvollständige oder ungültige Zeiten verhindern Übernehmen mit verständlichem Feedback. Automatische Geräteparameter folgen dem aktuellen Demo-Phasenprofil, ohne ungefragt die bewusst übernommenen Temperatur-/Feuchte-Sollwerte zu überschreiben.
- Tankzustände: ausreichend (>20 %), niedrig (>0 bis 20 %), leer (0 %) und Sensor nicht verfügbar (`null`). Diese Schwellen sind ausdrücklich Demo-Werte. Ein unbekannter Wert zeigt „–“ und einen grafisch abgesetzten Platzhalter, keine 0 %. Leerer und unbekannter Tank sperren die simulierte Wasserförderung. Nur eine laufende Simulation mit bekanntem Füllstand über 0 % und Feuchtebedarf kann Wasser fördern. Nachfüllen erhöht bei verfügbarem Sensor den Füllstand; ein Wasserwechsel aktualisiert separat die Wartungserinnerung. Ein ausgefallener Sensor bleibt auch nach einer Nachfüllbestätigung unbekannt.
- „Schimmelvorsorge & Klimahinweise“ verwendet die bereits vorhandenen Feuchte-/CO₂-Bewertungen. Hinweise verlinken zur passenden Einstellung; automatische Geräteaktionen sind nachvollziehbar. Eine manuelle Beobachtung kann dokumentiert und quittiert werden. Beide Aktionen bleiben im Ereignisverlauf; Quittieren verändert weder Messwerte noch aktive Ursachen.
- UV bleibt ein nicht angebundenes Zusatzmodul in den aufklappbaren Technikdetails. Es gibt weder einen erfundenen UV-Messwert noch einen Strahlungsregler oder ein Wirkungsversprechen. Eine spätere echte UV-Funktion benötigt ein gesondertes Schutzkonzept.

Ältere gültige Speicherstände unter `mycobox.demo.v1` werden beim Laden additiv ergänzt. Vorhandene Kultur, Zeit, Messhistorie und Ereignisse bleiben erhalten. Falls der alte Tankdatensatz ausschließlich in `mycobox.experience.v1` liegt, wird er einmal in den zentralen Betriebszustand übernommen und anschließend aus dem Experience-Datensatz entfernt. Der alte boolesche Belüftungswert wird zur Frischluftstufe migriert; das Kompatibilitätsfeld ist kein zusätzlicher Regler. Beschädigte Werte werden weiterhin geprüft und verständlich zurückgesetzt.

Prüfungen für diese Erweiterung: 82 automatisierte Tests insgesamt. Neue Tests decken unter anderem Lichtgrenzen und Nachtfenster, ungültige Entwürfe, beide Lüfterfunktionen, Wasserförderung bei leerem/unbekanntem Tank, getrennte Wartungsaktionen, additive Migration, quittierte Beobachtungen, Phasendetails, Bildwechsel, Kulturabschluss und Inline-Rezeptnavigation ab. Zusätzliche Browserprüfungen und deren tatsächlicher Abschlussstand stehen in der mitgelieferten Startanleitung.
