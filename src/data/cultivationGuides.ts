/** Researched cultivation information; deliberately separate from simulated control limits.
 * Temperatures are air temperatures; humidity is relative air humidity, not substrate water content.
 * Reviewed 2026-11-04. Sources describe particular strains and cultivation methods, not universal optima.
 */
type Range = readonly [number, number];
interface Stage { name: string; temperature: Range; humidity: Range }
export interface CultivationGuide {
  fruiting: Stage;
  stages: readonly Stage[];
  note: string;
  source: { title: string; url: string };
  evidence: "Herstellerprotokoll" | "Studienprotokoll";
}
const stage = (name: string, temperature: Range, humidity: Range): Stage => ({name, temperature, humidity});
function grower(page: string, colonization: Range, colonizationRh: Range, initiation: Range, initiationRh: Range, fruiting: Range, fruitingRh: Range, note: string): CultivationGuide {
  const harvest = stage("Fruchtung und Wachstum", fruiting, fruitingRh);
  return { fruiting: harvest, stages: [stage("Besiedlung des Substrats", colonization, colonizationRh), stage("Fruchtung einleiten · erste Pilzknospen", initiation, initiationRh), harvest], note,
    source: { title: "Tyroler Glückspilze · Kulturprotokoll", url: `https://gluckspilze.com/en/about-mushrooms/${page}` }, evidence: "Herstellerprotokoll" };
}
export const CULTIVATION_GUIDES: Readonly<Record<string, CultivationGuide>> = {
  oyster: grower("austernseitling", [24,24], [85,95], [10,15.6], [95,100], [10,21], [85,90], "Austernseitlinge unterscheiden sich je nach Stamm. Das Protokoll beschreibt eine kühlere Einleitung der Fruchtung; während des Wachstums regelmäßig Frischluft zuführen."),
  king: grower("krauterseitling", [24,24], [90,95], [10,15], [95,100], [15,21], [85,90], "Für erste Pilzknospen wird der durchwachsene Block kühler gehalten als für die anschließende Reifung. Die Luftfeuchte danach auf den Wachstumsbereich absenken."),
  shiitake: grower("shiitake", [21,27], [95,100], [15,18], [95,100], [15,18], [60,80], "Dieses Herstellerprotokoll nennt 15–18 °C als Optimum innerhalb eines breiteren Bereichs von 10–24 °C. Die niedrigere Feuchte gilt erst für entwickelte Fruchtkörper; für Pilzknospen gelten 95–100 %. Andere Stämme und Fertigkulturen benötigen andere Bedingungen. Den Holzblock vor der Fruchtung vollständig ausreifen lassen."),
  champignon: grower("champignon", [23,25], [90,100], [16,18], [95,100], [16,18], [85,90], "Weiße und braune Champignons gehören zu Agaricus bisporus und teilen dieses Kulturprotokoll. Sie benötigen geeignetes Champignonkompost-Substrat und Deckerde. Die Raumlufttemperatur ist nicht mit der oft höheren Komposttemperatur gleichzusetzen."),
  pink: grower("rosenseitling", [24,30], [95,100], [18,25], [95,100], [20,30], [85,90], "Der Rosenseitling ist wärmeliebend. Für entwickelte Fruchtkörper nennt der Hersteller einen wärmeren Bereich als für die Einleitung der Fruchtung. Direkten Luftzug auf junge Pilze vermeiden."),
  yellow: grower("zitronenseitling", [24,29], [90,100], [21,27], [98,100], [21,29], [90,95], "Der Zitronenseitling benötigt warme Kulturbedingungen. Hohe Luftfeuchte mit Frischluft kombinieren. Für den gewählten Zuchtstamm die Lieferantenanleitung beachten."),
  lion: grower("igelstachelbart", [21,24], [95,100], [10,15.6], [90,95], [18,24], [90,95], "Die Quelle nennt 90–95 % als zentralen Feuchtebereich, mit 85 % als unterem Rand. Der Fruchtkörper soll nicht direkt im Nebelstrahl stehen; frische Luft unterstützt die typische Form."),
  pioppino: grower("pioppino", [21,27], [95,100], [10,16], [95,100], [13,18], [90,95], "Die Quelle verwendet den älteren Namen Agrocybe aegerita für Cyclocybe aegerita. Vollständig besiedeltes Holzsubstrat zur Einleitung der Fruchtung abkühlen; junge Knospen vor Austrocknung schützen."),
  almond: grower("mandelpilz", [21,27], [90,100], [21,24], [80,90], [24,27], [75,85], "Der Mandelpilz wird in der Quelle auch als Agaricus blazei bezeichnet. Das Verfahren benötigt Kompost und Deckerde. Nach den ersten Pilzknospen ändern sich Temperatur und Luftfeuchte erneut."),
  enoki: {
    fruiting: stage("Fruchtung und Wachstum", [15,15], [75,75]),
    stages: [stage("Fruchtung einleiten · erste Pilzknospen", [15,15], [90,90]), stage("Fruchtung und Wachstum", [15,15], [75,75])],
    evidence: "Studienprotokoll",
    source: {title: "Lyu et al. (2023) · Frontiers in Microbiology, Abschnitt 2.6", url: "https://www.frontiersin.org/journals/microbiology/articles/10.3389/fmicb.2023.1139679/full"},
    note: "Dokumentierter Versuchsaufbau für Flammulina filiformis: 15 °C und 75 % relative Luftfeuchte zur Fruchtkörperentwicklung. Dies ist ein konkret erprobter Studienwert, kein allgemeines Optimum. Industrielle Verfahren für lange weiße Enoki verwenden andere Klima- und CO₂-Programme. Zur Einleitung der Fruchtung wurden im Versuch 15 °C und 90 % Luftfeuchte eingesetzt.",
  },
  nameko: {
    fruiting: stage("Fruchtung und Wachstum", [16,16], [95,95]),
    stages: [stage("Fruchtung einleiten · erste Pilzknospen", [12,12], [95,95]), stage("Fruchtung und Wachstum", [16,16], [95,95])],
    evidence: "Studienprotokoll",
    source: {title: "Jeong et al. (2007) · Journal of MUSHROOMS 5(2), 51–58", url: "https://www.earticle.net/Journal/Issues/781/14162"},
    note: "Die Studie zur Behälterkultur von Pholiota nameko nennt 12 °C zur Knospenbildung, 16 °C zum Wachstum und 95 % relative Luftfeuchte. Nameko und der Bibliothekseintrag Goldkäppchen verwenden dieselbe Artzuordnung und deshalb dieselben Werte. Die Ergebnisse gelten für die untersuchten Stämme und das beschriebene Substrat.",
  },
  shimeji: {
    fruiting: stage("Fruchtung und Wachstum", [13,15], [90,95]),
    stages: [stage("Besiedlung des Substrats", [21,25], [75,75]), stage("Fruchtung und Wachstum", [13,15], [90,95])],
    evidence: "Studienprotokoll",
    source: {title: "Journal of Fungi (2025), 11(12), 842 · Hypsizygus marmoreus", url: "https://www.mdpi.com/2309-608X/11/12/842"},
    note: "Diese Werte beziehen sich auf das beschriebene Verfahren für Hypsizygus marmoreus. Für die Besiedlung und die kühlere Fruchtung sind unterschiedliche Klimabedingungen vorgesehen. Stamm, Substrat und Kulturgefäß beeinflussen das Ergebnis.",
  },
  stock: {
    fruiting: stage("Fruchtung und Wachstum", [18,18], [75,80]),
    stages: [stage("Fruchtung und Wachstum", [18,18], [75,80])],
    evidence: "Studienprotokoll",
    source: {title: "Issakainen, Pihlaja & Smolander · Karstenia 57, S. 20", url: "https://karstenia.fi/Karstenia/Karstenia_57-1-2_2017-3.pdf"},
    note: "Im Gewächshausversuch mit Kuehneromyces mutabilis wurde ein Fruchtungsmonat bei 18 °C und 75–80 % Raumluftfeuchte eingesetzt, nach einer dunklen Ruhephase bei 20 °C. Die Kulturen bestanden aus Holz beziehungsweise Sägemehl in Erde; Deckel regulierten zusätzlich das lokale Mikroklima. Kein nachgewiesenes universelles Optimum für eine geschlossene Growbox.",
  },
};
