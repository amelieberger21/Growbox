# MycoBox 2.0 – Assets & Lizenzen

Alle Bilder, Icons und Schriften sind lokal gebündelt. Der normale Betrieb benötigt keinen externen Bild- oder Schriftdienst.

## Pilzfotos

Alle 15 Bibliothekseinträge haben eine eigene lokale JPG-Datei unter `public/mushrooms/`. Referenzen, Alternativtexte, Autoren, Quell- und Lizenzlinks stehen zentral in `src/data/mushroomPhotos.ts`. Vollständige Einzelbelege: [public/mushrooms/LICENSES.md](public/mushrooms/LICENSES.md), außerdem in der aufklappbaren Bildnachweisliste auf `/projekt`.

Es handelt sich um echte, offen lizenzierte Fotografien mit ihren ursprünglichen Hintergründen. Die Bilder wurden nicht künstlich freigestellt und sind keine Artbestimmungshilfe. Dateiformat und Taxon-/Lizenzzuordnung laut den jeweiligen Quellseiten wurden geprüft; dies ist keine unabhängige Bestimmung der fotografierten Exemplare.

- Weißer und Brauner Champignon haben unterschiedliche, zur Kulturform passende Fotos.
- Nameko und Goldkäppchen verwenden dasselbe korrekt zugeordnete Motiv über getrennte lokale Dateipfade, da es dieselbe Art ist.
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
