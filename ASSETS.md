# MycoBox 2.0 – Assets & Lizenzen

Alle Bilder, Icons und Schriften sind lokal gebündelt. Der normale Betrieb benötigt keinen externen Bild- oder Schriftdienst.

## Pilzfotos

Alle 15 Bibliothekseinträge haben eine eigene lokale JPG-Datei unter `public/mushrooms/`. Referenzen, Alternativtexte, Autoren, Quell- und Lizenzlinks stehen zentral in `src/data/mushroomPhotos.ts`. Vollständige Einzelbelege: [public/mushrooms/LICENSES.md](public/mushrooms/LICENSES.md), außerdem in der aufklappbaren Bildnachweisliste auf `/projekt`.

Es handelt sich um echte, offen lizenzierte Fotografien mit ihren ursprünglichen Hintergründen. Die Bilder wurden nicht künstlich freigestellt und sind keine Artbestimmungshilfe. Dateiformat und Taxon-/Lizenzzuordnung laut den jeweiligen Quellseiten wurden geprüft; dies ist keine unabhängige Bestimmung der fotografierten Exemplare.

- Weißer und Brauner Champignon haben unterschiedliche, zur Kulturform passende Fotos.
- Nameko und Goldkäppchen bezeichnen hier dieselbe Art (Pholiota nameko), verwenden aber seit 04.11.2026 zwei unterschiedliche Fotos aus dokumentierter Kultur.
- Enoki zeigt ausdrücklich eine natürliche braune Form von _Flammulina filiformis_, nicht die bekannte weiße langstielige Kulturform. Dies wird in Alternativtext, Bilddaten und Beschreibung erklärt.
- Bei fehlender Bilddatei erscheint ein ausdrücklich beschrifteter Zustand „Foto nicht verfügbar“ statt einer fremden Art oder eines generischen Pilzbildes.

## Weitere Assets

| Asset                                      | Herkunft                                      | Lizenz / Einordnung                                                                                        |
| ------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Champ                                      | `src/experience/Champ.tsx`                    | Eigene SVG-Figur für dieses Projekt; eine Begleitfigur, keine Artabbildung.                                |
| MycoBox-Wortzeichen & Pilzsymbol           | `src/components/ui.tsx`, `public/favicon.svg` | Eigene SVG-Grafik; keine Aussage über Markenregistrierung.                                                 |
| Frühere Pilzillustrationen                 | `src/components/MushroomIllustration.tsx`     | Eigene Grafiken erhalten; regulär durch Fotos ersetzt und nicht als Fotoersatz genutzt.                    |
| Hintergrundlinien, Myzelgrafik, Sparklines | SVG in Komponenten                            | Eigene Vektorgrafiken; Sparklines rein dekorativ. Reale Demo-Zahlen stehen im Diagramm und in der Tabelle. |
| DM Sans, Manrope, Vazirmatn                | Lokale `@fontsource`-Pakete                   | SIL Open Font License 1.1, Lizenzdateien im jeweiligen Paket. Vazirmatn für persische Texte.               |
| Lucide Icons                               | `lucide-react`                                | ISC, Lizenz im installierten Paket.                                                                        |

Die verwendeten Pilzprofile und ihre fachlichen Grenzen werden unabhängig von den Bildlizenzen dokumentiert: [docs/Kulturdaten-Pruefstand.md](docs/Kulturdaten-Pruefstand.md).

## Schematische Phasenbilder

`src/components/GrowthVisual.tsx` kombiniert eigene Substrat-/Myzel-/Fruchtkörperansatz-Zeichnungen mit den vorhandenen eigenen Pilzillustrationen. Diese lokalen SVG-Darstellungen zeigen fünf unterschiedliche Lernphasen und werden ausdrücklich als schematische Illustrationen beschriftet. Sie sind keine echten Kameraaufnahmen, Bestimmungsbilder oder Wachstumsprognosen. Es wurden dafür keine externen Bilder oder Bilddienste ergänzt.


## Bildprüfung vom 04.11.2026

Alle 15 aktiven Bildreferenzen wurden mit den Artangaben und Lizenzmetadaten ihrer Wikimedia-Dateiseiten abgeglichen. Das bestätigt die dokumentierte Quellenzuordnung, nicht eine unabhängige mykologische Bestimmung der fotografierten Exemplare. Fotografien sind keine Bestimmungshilfe. Die Bilddateien werden zusätzlich automatisiert auf versehentliche identische Inhalte und auf Übereinstimmung der hinterlegten Art mit dem Bibliothekseintrag geprüft.

Neue, unterschiedliche Aufnahmen:

- `nameko-kultur.jpg`: frankenstoen, *Nameko forest*, 05.06.2008, CC BY 2.0. Quelle: https://commons.wikimedia.org/wiki/File:Nameko_forest_by_frankenstoen.jpg. Die Beschreibung ordnet die Kultur ausdrücklich Pholiota nameko zu.
- `goldkaeppchen-holzkultur.jpg`: Hillbourne, *Pholiota nameko culture*, 20.10.2010, CC BY-SA 3.0. Quelle: https://commons.wikimedia.org/wiki/File:Pholiota_nameko_culture.JPG. Laut Fotograf Nameko-Kultur auf einem Kirschholzstamm.

Die Gleichsetzung der Handelsnamen folgt dem Bundeszentrum für Ernährung: https://www.bzfe.de/presse/pressemeldungen-archiv/bissfester-pilz-mit-nussigem-aroma. Für Enoki bleibt die natürliche braune Form (Flammulina filiformis) ausdrücklich benannt; sie ist nicht mit der weißen langstieligen Kulturform zu verwechseln. Pioppino ist in seiner Bildquelle als Cyclocybe aegerita dokumentiert; die Aufnahme zeigt reife Fruchtkörper.
