import { tr, currentLocale } from "../i18n";
import type {
  DemoProfile,
  Difficulty,
  GrowthPhase,
  IllustrationKind,
  MushroomEntry,
  SpeciesProfile,
} from "../types";

export const SOURCES = [
  {
    id: "cornell",
    name: "Cornell Small Farms",
    topic: "Indoor-Kulturen und unterschiedliche Kulturbedingungen.",
    url: "https://smallfarms.cornell.edu/resources/indoor-production/",
    checked: true,
  },
  {
    id: "bzfe",
    name: "Bundeszentrum für Ernährung",
    topic: "Goldkäppchen als Handelsname für Nameko (Pholiota nameko).",
    url: "https://www.bzfe.de/presse/pressemeldungen-archiv/bissfester-pilz-mit-nussigem-aroma",
    checked: true,
  },
  {
    id: "dgfm",
    name: "Deutsche Gesellschaft für Mykologie",
    topic:
      "Weiterführende Informationen zu Speisepilzen. Die im Konzept verlinkte Artenliste ist derzeit weitergeleitet und noch zu prüfen.",
    url: "https://www.dgfm-ev.de/de/pilze-sammeln/speisepilze",
    checked: false,
  },
  {
    id: "freiburg",
    name: "Universitätsklinikum Freiburg",
    topic: "Verwechslungsgefahr von Stockschwämmchen und Gifthäubling.",
    url: "https://www.uniklinik-freiburg.de/giftberatung-1/aktuelle-themen/wenn-der-pilz-auf-den-magen-schlaegt.html",
    checked: true,
  },
];

type EntrySeed = [
  string,
  string,
  string,
  string,
  Difficulty,
  number,
  number,
  number,
  string,
  string,
  IllustrationKind,
  string,
  string,
];
const seeds: EntrySeed[] = [
  [
    "austernseitling",
    "Austernseitling",
    "oyster",
    "Pleurotus ostreatus",
    "Einfach",
    20,
    90,
    28,
    "#928877",
    "#eae9df",
    "oyster",
    "Fächerförmige Hüte, die in kleinen Büscheln wachsen.",
    "Seine fächerförmigen Fruchtkörper wachsen oft in Büscheln. Das Foto dient der Veranschaulichung, nicht der Artbestimmung. Im Demo-Modell kannst du ihn über 28 simulierte Tage begleiten.",
  ],
  [
    "kraeuterseitling",
    "Kräuterseitling",
    "king",
    "Pleurotus eryngii",
    "Mittel",
    18,
    88,
    35,
    "#9b7957",
    "#eee7dc",
    "king",
    "Kräftiger Stiel. Kleiner Hut. Ein besonderer Charakter.",
    "Der Kräuterseitling fällt durch seinen kräftigen, hellen Stiel und den vergleichsweise kleinen Hut auf. Sein Beispielprofil zeigt dir einen etwas längeren virtuellen Kulturverlauf.",
  ],
  [
    "shiitake",
    "Shiitake",
    "shiitake",
    "Lentinula edodes",
    "Mittel",
    20,
    88,
    56,
    "#855332",
    "#eee3d6",
    "round",
    "Braune Hüte und eine besondere Verbindung zu Holz.",
    "Shiitake ist durch seine braunen Hüte bekannt und wird auf holzbasiertem Material kultiviert. In MycoBox hat er mit 56 Tagen eines der längeren synthetischen Beispielprofile.",
  ],
  [
    "weisser-champignon",
    "Weißer Champignon",
    "champignon",
    "Agaricus bisporus",
    "Anspruchsvoll",
    18,
    88,
    42,
    "#dcd6c5",
    "#e9e9e2",
    "round",
    "Die helle Kulturform des vertrauten Zuchtchampignons.",
    "Der Weiße Champignon ist eine weiße Kulturform von Agaricus bisporus. Er teilt sich die Artzuordnung mit dem Braunen Champignon, bleibt hier aber ein eigener Bibliothekseintrag.",
  ],
  [
    "brauner-champignon",
    "Brauner Champignon",
    "champignon",
    "Agaricus bisporus",
    "Anspruchsvoll",
    18,
    88,
    42,
    "#986341",
    "#ede4d9",
    "round",
    "Die braune Kulturform mit dem runden Hut.",
    "Der Braune Champignon gehört wie die weiße Kulturform zu Agaricus bisporus. Seine braunen Hüte werden in der Bibliothek mit einem eigenen Foto dargestellt.",
  ],
  [
    "rosenseitling",
    "Rosenseitling",
    "pink",
    "Pleurotus djamor",
    "Einfach",
    25,
    90,
    21,
    "#cf918c",
    "#f5e5e0",
    "oyster",
    "Rosa Fruchtkörper bringen Farbe in die Pilzwelt.",
    "Seine rosa gefärbten Fruchtkörper geben dem Rosenseitling seinen Namen. Das synthetische Beispielprofil nutzt eine höhere Demo-Solltemperatur und eine kurze simulierte Dauer.",
  ],
  [
    "zitronenseitling",
    "Zitronenseitling",
    "yellow",
    "Pleurotus citrinopileatus",
    "Einfach",
    23,
    90,
    24,
    "#d6b341",
    "#f5efd7",
    "oyster",
    "Leuchtend gelbe Hüte in kleinen Gruppen.",
    "Der Zitronenseitling zeichnet sich durch seine leuchtend gelben Hüte aus. Das Foto und das Beispielprofil machen ihn zu einem anschaulichen Einstieg in die Demo.",
  ],
  [
    "igelstachelbart",
    "Igelstachelbart",
    "lion",
    "Hericium erinaceus",
    "Mittel",
    20,
    90,
    35,
    "#e3d9bc",
    "#eaece0",
    "lion",
    "Eine helle, weiche Form mit herabhängenden Stacheln.",
    "Anders als klassische Hutpilze bildet der Igelstachelbart einen hellen Fruchtkörper mit herabhängenden Stacheln. In der Demo begleitet dich seine besondere Form durch alle fünf Lernphasen.",
  ],
  [
    "pioppino",
    "Pioppino",
    "pioppino",
    "Cyclocybe aegerita",
    "Mittel",
    19,
    88,
    35,
    "#8e6042",
    "#eae5da",
    "cluster",
    "Kleine braune Hüte, die büschelig zusammenstehen.",
    "Pioppino wächst in Büscheln und besitzt kleine braune Hüte. Das Foto zeigt mehrere Fruchtkörper auf hellen Stielen.",
  ],
  [
    "enoki",
    "Enoki",
    "enoki",
    "Flammulina filiformis",
    "Anspruchsvoll",
    14,
    90,
    42,
    "#e1d7b9",
    "#edeee5",
    "enoki",
    "Filigrane Stiele und kleine, helle Hüte.",
    "Enoki ist besonders durch seine langstieligen Kulturformen bekannt. Das hier gezeigte Foto stellt die natürliche braune Form von Flammulina filiformis dar, nicht die weiße Kulturform. Es dient nicht zur Bestimmung wild wachsender Pilze.",
  ],
  [
    "nameko",
    "Nameko",
    "nameko",
    "Pholiota nameko",
    "Mittel",
    18,
    93,
    42,
    "#b17c33",
    "#efead9",
    "cluster",
    "Kleine, glänzende Hüte in warmen Goldbrauntönen.",
    "Nameko hat kleine bräunliche Hüte mit einem charakteristischen Überzug. Goldkäppchen ist ein Handelsname für denselben Pilz; beide Einträge nutzen hier ein gemeinsames Arten- und Demo-Profil.",
  ],
  [
    "shimeji",
    "Shimeji",
    "shimeji",
    "Hypsizygus marmoreus",
    "Anspruchsvoll",
    18,
    90,
    49,
    "#ad967a",
    "#e9e8dd",
    "cluster",
    "Kleine Hutpilze als dicht gewachsenes Büschel.",
    "Shimeji wird häufig als büschelig wachsender Kulturpilz angeboten. Das Foto zeigt die dicht stehenden hellen Stiele und kleinen Hüte.",
  ],
  [
    "mandelpilz",
    "Mandelpilz",
    "almond",
    "Agaricus subrufescens",
    "Anspruchsvoll",
    24,
    88,
    49,
    "#b68d5f",
    "#f0e5d7",
    "round",
    "Bekannt für seinen an Mandeln erinnernden Geruch.",
    "Der Mandelpilz ist durch seinen an Mandeln erinnernden Geruch bekannt. In MycoBox lernst du ihn mit einem eigenen synthetischen Beispielprofil kennen.",
  ],
  [
    "stockschwaemmchen",
    "Stockschwämmchen",
    "stock",
    "Kuehneromyces mutabilis",
    "Anspruchsvoll",
    18,
    90,
    42,
    "#a57d45",
    "#e9e5d7",
    "cluster",
    "Ein holzbewohnender Pilz mit besonderem Warnhinweis.",
    "Stockschwämmchen ist ein holzbewohnender Pilz. Wegen der Verwechslungsgefahr mit dem giftigen Gifthäubling ist diese Website ausdrücklich kein Bestimmungswerkzeug.",
  ],
  [
    "goldkaeppchen",
    "Goldkäppchen",
    "nameko",
    "Pholiota nameko",
    "Mittel",
    18,
    93,
    42,
    "#b17c33",
    "#efead9",
    "cluster",
    "Der goldene Handelsname des Nameko.",
    "Goldkäppchen ist ein Handelsname für Nameko. Dieser eigenständige Bibliothekseintrag verweist deshalb auf dieselbe Art und dasselbe synthetische Demo-Profil.",
  ],
];

export const entries: MushroomEntry[] = seeds.map(
  ([
    slug,
    name,
    speciesId,
    ,
    ,
    ,
    ,
    ,
    color,
    background,
    illustration,
    short,
    description,
  ]) => ({
    slug,
    name,
    speciesId,
    demoId: speciesId,
    synonyms:
      speciesId === "nameko"
        ? ["Nameko", "Goldkäppchen", "Japanisches Stockschwämmchen"]
        : speciesId === "lion"
          ? ["Lion’s Mane", "Löwenmähne", "Pom-Pom"]
          : speciesId === "oyster"
            ? ["Austernpilz"]
            : [],
    short,
    description,
    color,
    background,
    illustration,
  }),
);
export const profiles: Record<string, DemoProfile> = Object.fromEntries(
  seeds.map(([, , id, , difficulty, temperature, humidity, days]) => [
    id,
    {
      id,
      difficulty,
      temperature,
      humidity,
      days,
      verification: "demo" as const,
    },
  ]),
);
export const species: Record<string, SpeciesProfile> = Object.fromEntries(
  seeds.map(([, , id, scientificName]) => [
    id,
    {
      id,
      scientificName,
      substrate: ["champignon", "almond"].includes(id)
        ? "Kompostbasiertes Nährmaterial; genaue Rezeptur noch fachlich zu prüfen."
        : id === "oyster" || id === "pink" || id === "yellow"
          ? "Stroh- oder holzbasiertes Nährmaterial; konkrete Mischung noch fachlich zu prüfen."
          : "Holzbasiertes Nährmaterial; genaue Zusammensetzung noch fachlich zu prüfen.",
      light:
        "Indirektes Licht ist im Lernmodell vorgesehen. Ein realer Lichtplan wurde noch nicht geprüft.",
      air: "Die Demo zeigt regelmäßigen Luftaustausch. Reale artspezifische Anforderungen sind noch zu prüfen.",
      care: "Beobachte in der Demo Klima und Verlauf. Pflegehinweise für eine reale Kultur müssen vor dem Anbau fachlich geprüft werden.",
      harvest:
        "Die Phase „Ernte“ markiert nur das Ende des Lernmodells. Sie sagt nichts über die Erntereife echter Pilze oder eine Erntemenge aus.",
      verification: "unverified" as const,
      sources:
        id === "nameko"
          ? ["bzfe"]
          : id === "stock"
            ? ["freiburg", "cornell"]
            : ["cornell", "dgfm"],
    },
  ]),
);
export const getEntry = (slug: string) =>
  entries.find((entry) => entry.slug === slug);
export const getProfile = (entry: MushroomEntry) => profiles[entry.demoId];
export const normalize = (text: string) =>
  text
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export function filterEntries(query: string, difficulty: string, sort: string) {
  const found = entries.filter(
    (entry) =>
      (difficulty === "Alle" || getProfile(entry).difficulty === difficulty) &&
      normalize(
        [
          entry.name,
          tr(entry.name),
          species[entry.speciesId].scientificName,
          ...entry.synonyms,
        ].join(" "),
      ).includes(normalize(query.trim())),
  );
  return sort === "name"
    ? [...found].sort((a, b) =>
        tr(a.name).localeCompare(tr(b.name), currentLocale()),
      )
    : found;
}
export const PHASES: GrowthPhase[] = [
  {
    name: "Vorbereitung",
    short: "Vorbereitung",
    threshold: 0,
    description:
      "Du wählst eine Kultur und lädst ihr Beispielprofil. Das Nährmaterial und die virtuelle Umgebung werden im Lernmodell vorbereitet.",
  },
  {
    name: "Besiedlung des Substrats",
    short: "Besiedlung",
    threshold: 10,
    description:
      "Das Pilzgeflecht, auch Myzel genannt, besiedelt das Substrat. Substrat ist das Nährmaterial, auf dem das Pilzgeflecht wächst.",
  },
  {
    name: "Fruchtkörperbildung",
    short: "Fruchtkörper",
    threshold: 45,
    description:
      "Im Lernmodell entstehen die ersten kleinen Fruchtkörper. Das sind die sichtbaren Teile, die wir im Alltag als Pilze bezeichnen.",
  },
  {
    name: "Wachstum",
    short: "Wachstum",
    threshold: 65,
    description:
      "Die virtuellen Fruchtkörper wachsen und nehmen ihre typische Form an. Verfolge im Diagramm, wie sich die simulierten Umgebungswerte entwickeln.",
  },
  {
    name: "Ernte",
    short: "Ernte",
    threshold: 90,
    description:
      "Der Demo-Zyklus nähert sich seinem Abschluss. Diese Phase ist eine didaktische Vereinfachung und keine Aussage über die Erntereife echter Pilze.",
  },
];
export const SUITABILITY =
  "Im Prototyp simulierbar – reale Growbox-Eignung noch nicht geprüft.";
