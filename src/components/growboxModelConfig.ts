export type Point = [number, number, number];

export const displayFrameName = 'mycobox-model-display';
export const modelUrl = '/models/testobjekt.glb';
export const referenceNode = 'object_80';
export const doorParts = ['object_32', 'object_33', 'object_34', 'object_39', 'object_40'];
export const hinge: Point = [0.006, 0, 0.008];
export const doorAngle = -Math.PI * 0.56;
export const overview: Point = [0.72, 0.43, 0.83];
export const center: Point = [0.25, 0.145, -0.13];

export const hotspots: { label: string; point: Point; camera: Point; description: string }[] = [
  { label: 'Luftfeuchtigkeit', point: [0.3, 0.15, -0.28], camera: [0.25, 0.28, 0.34], description: 'Der kombinierte Sensor misst die relative Luftfeuchtigkeit im Fruchtungsraum. Halte ihn vom direkten Nebelstrahl fern. Der Sollwert hängt von Pilzart und Wachstumsphase ab.' },
  { label: 'Wassertank und Vernebler', point: [0.43, 0.09, -0.12], camera: [0.56, 0.24, 0.28], description: 'Der unten angeordnete Vorrat versorgt den Ultraschallvernebler mit Wasser. Der feine Nebel erhöht die Luftfeuchtigkeit.' },
  { label: 'CO₂-Sensor', point: [0.019, 0.105, -0.078], camera: [0.25, 0.19, 0.332], description: 'Beispielposition an der linken Innenwand neben dem Zuchtbehälter. Der Messwert hilft, den Frischluftbedarf einzuschätzen. Bei manchen Arten kann erhöhtes CO₂ zu längeren Stielen und kleineren Hüten führen.' },
  { label: 'Temperatur', point: [0.3, 0.13, -0.28], camera: [0.43, 0.24, 0.31], description: 'Der kombinierte Sensor misst auch die Lufttemperatur. Er liegt abseits direkter Lampenstrahlung. Das Temperaturziel richtet sich nach Art und Phase.' },
  { label: 'Frischluft und HEPA-Filter', point: [0.43, 0.23, -0.24], camera: [0.63, 0.36, 0.24], description: 'Beispielposition oben seitlich. Der Luftaustausch führt CO₂ ab. Ein HEPA-Filter kann Partikel und Sporen in der Zuluft reduzieren.' },
  { label: 'LED-Beleuchtung', point: [0.2, 0.265, -0.13], camera: [0.17, 0.22, 0.31], description: 'Beispielposition an der Decke. Licht kann bei vielen Kulturpilzen die Wuchsrichtung beeinflussen. 6500 K ist eine mögliche Lichtfarbe für die Demo.' },
  { label: 'Abluftlüfter', point: [0.081, 0.299, -0.22], camera: [0.18, 0.62, 0.02], description: 'Der Abluftlüfter zieht verbrauchte, CO₂-reiche Luft aus der Box. Über die Zuluft strömt frische Luft nach. Beim Lüften gehen auch Feuchtigkeit und Wärme verloren, deshalb müssen Abluft und Befeuchtung aufeinander abgestimmt sein.' },
  { label: 'Bildschirm', point: [0.352, 0.395, -0.13], camera: [0.352, 0.395, 0.13], description: 'Auf dem eingeschalteten Bildschirm kannst du durch den MycoBox-Prototyp navigieren und seine Funktionen bedienen.' },
  { label: 'Substratfeuchtesensor', point: [0.032, 0.064, -0.067], camera: [0.21, 0.18, 0.24], description: 'Die kapazitive Sonde sitzt in einer Halterung am linken Rand des Zuchtbereichs. Im Betriebsmodus reicht ihre Messspitze seitlich in das Substrat; die Elektronik bleibt oberhalb der feuchten Schicht. Sie erfasst Änderungen der Substratfeuchte; für belastbare Werte muss sie auf das verwendete Substrat kalibriert werden. Im Prototyp wird kein zusätzlicher Messwert simuliert. Die Bauform orientiert sich an einer kapazitiven Platinen-Sonde; die Eignung für dauerhafte Nässe hängt vom konkreten Produkt ab.' },
  { label: 'Wasserstandssensor', point: [0.433, 0.062, -0.07], camera: [0.57, 0.19, 0.22], description: 'Ein Schwimmschalter im Tank meldet, ob der Mindestwasserstand erreicht ist. Der Schwimmkörper bewegt sich mit dem Wasserspiegel und betätigt einen Schaltkontakt. Das Signal kann die Steuerung zum Abschalten des Verneblers verwenden. Die Darstellung zeigt die Bauform; sie ergänzt die bestehende Tank-Simulation ohne eine reale Schutzschaltung.' },
  { label: 'Partikelsensor · optional', point: [0.12, 0.316, -0.22], camera: [0.24, 0.48, 0.13], description: 'Das Beispielmodul in PMS5003-Bauform sitzt am Abluftbereich auf einer Montageplatte. Abstandshalter verbinden die Platte mit dem Gehäusedach. Ein optischer Sensor erfasst Schwebepartikel und kann Änderungen der Partikelbelastung anzeigen. Er identifiziert weder Schimmel noch bestimmte Sporen. Nebel und Kondensation können die Messung beeinflussen; die Messluft muss passend aufbereitet werden. Diese optionale Erweiterung zeigt im Prototyp keine Messdaten.' },
];

export const housingColors = [
  { label: 'Schwarz', hex: '#202322' },
  { label: 'Weiß', hex: '#f4f4ef' },
  { label: 'Dunkelgrün', hex: '#245740' },
  { label: 'Hellgrün', hex: '#a8c88c' },
] as const;
