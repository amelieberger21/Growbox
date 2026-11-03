# Gezielte UI-Optimierung · 2. November 2026

Die Änderungen bauen auf der bestehenden Oberfläche auf. Bilddateien, Kulturprofile, Steuerungslogik bleiben erhalten; die Schriftgrößen-Einstellungen wurden erweitert.

## Oberfläche

- Bilder stehen vor beziehungsweise links neben den zugehörigen Texten. Auf schmalen Bildschirmen werden große Portraits oberhalb des Textes angeordnet. Bildnachweise und Alternativtexte bleiben erhalten; das zusätzliche Label „Fotografie“ entfällt.
- Die Navigation lässt sich vollständig ausblenden und über „Menü öffnen“ zurückholen. Der Tastaturfokus wechselt dabei zum passenden Bedienelement.
- Der zentrale grüne Champ-Button zeigt die Tastenkombination deutlich in Weiß. Die vorhandene Sprachwahl bleibt berücksichtigt.
- Dunkleres Grün, größere Schrift und Icons, mindestens 48 Pixel hohe zentrale Bedienelemente und sichtbare Fokusrahmen verbessern die Erkennbarkeit. Schrift ist jetzt von 100 bis 250 % in 5-%-Schritten über Plus/Minus in der Kopfzeile und den Einstellungen anpassbar. Die bisherigen drei Presets bleiben erhalten; 150, 200 und 250 % kommen hinzu.
- Das Tutorial wird einmal je Tab-Sitzung angeboten. Die bestehende erste Begrüßung bleibt erhalten. Größere Pfeile zeigen zum hervorgehobenen Ziel; eine Schrittanzeige hilft bei der Orientierung.
- Klima-, Benachrichtigungs- und Toastmeldungen haben Schließen-Schaltflächen. Ausblenden behebt keinen Fehler und bestätigt keine Wartung. Hinweise lassen sich wieder anzeigen.

## Nährwerte und Hinweise

Nährwerte stehen in einer beschrifteten Tabelle mit Bezugsmenge, Einheiten und Quellenlink. Für beide Champignon-Einträge wird der allgemeine Artdatensatz für Agaricus bisporus verwendet; er ist ausdrücklich nicht kulturformspezifisch. Weitere Datensätze bestehen für Austernseitling, Shiitake und Enoki. Für andere Einträge wird transparent auf fehlende verlässlich zugeordnete Zahlen hingewiesen.

Quellen:

- [Matvaretabellen: Agaricus bisporus, roh, Food ID 06.062](https://matvaretabellen.mattilsynet.io/en/mushroom-common-raw/)
- [Hong Kong Department of Health: Mushroom Nutrition](https://restaurant.eatsmart.gov.hk/eng/content.aspx?content_id=853) – die Verarbeitung ist dort nicht ausdrücklich angegeben und wird in der Oberfläche entsprechend gekennzeichnet.
- [Bayerisches LGL: Verbraucherhinweise zu Pilzen](https://www.lgl.bayern.de/lebensmittel/warengruppen/wc_27_pilze/hinweise_verbraucher_pilze.htm)
- [Singapore Food Agency: Enoki](https://www.sfa.gov.sg/food-safety-tips/food-risk-concerns/risk-at-a-glance/enoki-mushrooms)

Artbezogene Verzehrhinweise erscheinen automatisch auf Detail- und Rezeptseiten. Kulturchampignons werden als besondere Ausnahme erläutert. Enoki erhalten einen ausdrücklichen Hinweis zum vollständigen Durchgaren. Der bestehende Stockschwämmchen-Warnhinweis bleibt erhalten.

Manuell dokumentierte Auffälligkeiten werden rot hervorgehoben. Die Demo erkennt keinen Schimmel und diagnostiziert keine Lebensmittelsicherheit. Tankhinweise nennen die konkrete Wartungsaktion und unterscheiden Nachfüllen, Wasserwechsel und fehlende Sensordaten.

## Prüfung

- 150 automatisierte Tests in 17 Dateien erfolgreich, einschließlich acht neuer Prüfungen zu Tutorialangebot, Fokusnavigation, Bildreihenfolge, Meldungen und Nährwerten.
- Produktionsbuild einschließlich TypeScript-Prüfung erfolgreich; bestehender Hinweis zur Bundle-Größe bleibt.
- Browserprüfung bei 1280 und 480 CSS-Pixeln: Navigation aus-/einblenden, Bildanordnung, Champ-Button und Nährwertseite. Auf den geprüften Seiten kein horizontaler Seitenüberlauf.
- Prüfsummen sämtlicher versionierter Dateien unter `public/` vor und nach der Änderung identisch.
- Keine neuen Abhängigkeiten oder externen Übersetzungsaufrufe. Neue Texte verwenden die vorhandene Übersetzungsschnittstelle und können bis zur Ergänzung weiterer Übersetzungen als deutscher Fallback erscheinen.

Die Änderungen sind lokal; es wurde kein GitHub-Push und keine Veröffentlichung ausgeführt.

## Nachbesserung nach Feedback

- Die frühere maximale Inhaltsbreite entfällt. Navigation und Inhalte nutzen große Fenster ohne breite leere Außenränder.
- Navigation: 300 Pixel breit, ab 2000 Pixel Fensterbreite 360 Pixel; größere Schrift, Symbole und Klickflächen. Sie bleibt ausblendbar.
- Hilfe und Champ stehen platzsparend in einer gemeinsamen Werkzeugzeile.
- Pilzdetailseiten: eine große, beim Scrollen mitlaufende Galerie links und sämtliche Informationen rechts. Auf schmalen Bildschirmen steht die Galerie oberhalb der Informationen.
- Alle Einträge haben auswählbare Gesamt- und Detailansichten. Detailansichten sind als Ausschnitte desselben vorhandenen Fotos beschriftet. Für beide Champignons steht zusätzlich eine weitere vorhandene Aufnahme mit Bildnachweis zur Auswahl. Keine neuen Fotografien wurden beschafft und keine vorhandenen Bilddateien geändert.
- 250 % Schrift auf einem 480 CSS-Pixel breiten Bildschirm geprüft: Umbrüche korrigiert, kein horizontaler Seitenüberlauf auf der Einstellungsseite.

## Weitere Korrekturen nach Browserkommentaren

- Champ ist unabhängig vom Hilfebutton mittig ausgerichtet. Die vollständige Beschriftung bleibt im hohen Kontrast weiß auf Dunkelgrün (im Browser geprüft).
- Ab Kulturbedingungen stehen die Abschnitte unter dem oberen Bild-/Einleitungsbereich und werden über die Breite verteilt. Rezepte folgen als eigener Abschnitt.
- Die wiederholten Ausschnitte und doppelten Vorschauen wurden entfernt. Pro Detailseite erscheint jede vorhandene Fotografie genau einmal; für die meisten Arten liegt nur eine Aufnahme vor, für Champignons zwei unterschiedliche.
- Größere Symbole an Bedienelementen und zusätzliche thematische Icons für Bedingungen, Demo-Profil, Pflege, Wachstum, Wissen und Quellen.
