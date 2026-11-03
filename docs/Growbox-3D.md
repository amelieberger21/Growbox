# Growbox in 3D

Die Ansicht ist auf dem Dashboard und unter „Meine Growbox“ eingebunden. Der vollständige Code liegt in `src/components/GrowboxModel.tsx` (Bedienung und Infokarten), `growboxScene.ts` (Three.js-Szene und Animation), `growboxModelConfig.ts` (Modell und Koordinaten) sowie `growboxModel.css` (Darstellung).

## Ein Blender-Modell austauschen

1. In Blender über **Datei → Exportieren → glTF 2.0** als **glTF Binary (.glb)** exportieren. Türscheibe, Rahmen und beweglichen Griff als eigene Objekte belassen und eindeutig benennen.
2. Die Datei in `public/models/` ablegen und `modelUrl` in `growboxModelConfig.ts` anpassen.
3. Das Modell mit der Vorderseite in Richtung **+Z** und oben in Richtung **+Y** ausrichten. Beim gelieferten Export besitzen alle Einzelobjekte dieselbe Exporttransformation. Die Szene hebt sie über die inverse Matrix von `referenceNode` auf. Bei einem bereits passend ausgerichteten Export `referenceNode` auf einen leeren String setzen.
4. In `doorParts` die exportierten Namen der beweglichen Türteile angeben. Fest am Gehäuse montierte Scharnierteile bleiben im Modell. `hinge` ist ein Punkt auf der senkrechten Scharnierachse in der ausgerichteten Szene. `doorAngle` gibt den Öffnungswinkel um Y im Bogenmaß an. Falls die Tür nach innen schwenkt, das Vorzeichen umkehren.

Beim gelieferten Modell liegt die Achse bei `[0.006, 0, 0.008]`. Die Teile `object_32`, `object_33`, `object_34`, `object_39` und `object_40` bilden Griff, Frontscheibe und Rahmen. Die Szene gruppiert sie um diese Achse und erhält ihre Ausgangspositionen. Das GLB bleibt unverändert. Für die Darstellung verwendet die Szene transparentes Glas und helleres Anthrazit.

## Kamera und Bauteile

Alle Koordinaten sind `[x, y, z]` in der ausgerichteten Szene. In `hotspots` ist `point` zugleich Markerposition und Blickziel, `camera` die Position der Kamera beim Fokussieren. Beispiel:

```ts
animateCameraTo([0.43, 0.24, 0.31], [0.3, 0.13, -0.28]);
```

`overview` und `center` bestimmen Startansicht und Rückkehr zur Übersicht. Der exportierte Knoten `Sensor_Temperatur_Feuchte` dient als Bezug für beide Messgrößen. CO₂, HEPA und LED haben beispielhafte Einbaupositionen. Die Karten erklären die Funktionen der Demo. [Cornell Small Farms zu den Bedingungen im Fruchtungsraum](https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/2-seven-stages-of-cultivation/).

Die Tür und Bauteilauswahl funktionieren über Schaltflächen. Die Kamera unterstützt Drehen, Schwenken und Zoomen per Maus oder Touch. Bei reduzierter Bewegung werden Fokus und Türstellung ohne Übergang geändert. Bei fehlender 3D-Darstellung bleiben die Bauteilbeschreibungen verfügbar.

`npm install` installiert die Abhängigkeiten. `npm run dev` startet den Prototyp und `npm run build` erstellt die Produktionsdateien.
