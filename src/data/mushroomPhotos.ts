/** Local, licensed photographs. `verified` means taxon attribution and license were checked against the source page; it is not independent specimen identification. */
export interface MushroomPhoto {
  src: string;
  altDe: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  verified: boolean;
  transparent: boolean;
  status: "photo" | "placeholder";
  scientificName: string;
  reviewedAt: string;
  captionDe: string;
}

export const mushroomPhotos: Readonly<Record<string, MushroomPhoto>> = {
  austernseitling: {
    src: "/mushrooms/austernseitling.jpg",
    altDe:
      "Austernseitling: braune, fächerförmige Hüte mit hellen Lamellen an einem Kulturblock.",
    author: "Zinnmann",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:20210719_Pleurotus_ostreatus_098-127.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Pleurotus ostreatus",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  kraeuterseitling: {
    src: "/mushrooms/kraeuterseitling.jpg",
    altDe:
      "Kräuterseitling: ein Büschel heller Pilze mit kräftigen, dicken Stielen und beigefarbenen Hüten.",
    author: "Holger Krisp",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kr%C3%A4uter-Seitling_Pleurotus_eryngii.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Pleurotus eryngii",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  shiitake: {
    src: "/mushrooms/shiitake.jpg",
    altDe:
      "Shiitake: drei braune, schuppige Hüte auf hellem Untergrund; ein Pilz zeigt seine hellen Lamellen.",
    author: "Batholith",
    license: "Public domain",
    licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Lentinula_edodes_20101113_c.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Lentinula edodes",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  "weisser-champignon": {
    src: "/mushrooms/weisser-champignon-produkt.jpg",
    altDe: "Weißer Champignon: ein frischer Champignon mit cremeweißer Kappe und hellem Stiel auf weißem Hintergrund.",
    author: "freebie.photography",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    sourceUrl: "https://freebie.photography/food/slides/mushroom.htm",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Agaricus bisporus",
    reviewedAt: "2026-11-02",
    captionDe: "Fotografie",
  },
  "brauner-champignon": {
    src: "/mushrooms/brauner-champignon-produkt.jpg",
    altDe: "Brauner Champignon: ein frischer Cremini mit natürlicher brauner Kappe und hellem Stiel auf weißem Hintergrund.",
    author: "Blue Apron",
    license: "© Blue Apron",
    licenseUrl: "https://www.blueapron.com/pages/terms",
    sourceUrl: "https://blog.blueapron.com/guides/9-types-of-mushrooms",
    verified: false,
    transparent: false,
    status: "photo",
    scientificName: "Agaricus bisporus",
    reviewedAt: "2026-11-02",
    captionDe: "Fotografie",
  },
  rosenseitling: {
    src: "/mushrooms/rosenseitling.jpg",
    altDe:
      "Rosenseitling: rosafarbene Fächerhüte mit deutlich sichtbaren rosa Lamellen.",
    author: "Holger Krisp",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Pleurotus_djamor_Rosen-Seitling.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Pleurotus djamor",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  zitronenseitling: {
    src: "/mushrooms/zitronenseitling.jpg",
    altDe:
      "Zitronenseitling: ein dichtes Büschel gelber Hüte auf einem weißen Teller.",
    author: "Kent Wang from Austin, TX, USA",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Pleurotus_citrinopileatus.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Pleurotus citrinopileatus",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  igelstachelbart: {
    src: "/mushrooms/igelstachelbart.jpg",
    altDe:
      "Igelstachelbart: ein heller, kompakter Fruchtkörper mit langen herabhängenden Stacheln an einem Baumstamm.",
    author: "Властарь derivative work: Xth-Floor (brightness, contrast)",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Hericium_erinaceus_02.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Hericium erinaceus",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  pioppino: {
    src: "/mushrooms/pioppino.jpg",
    altDe:
      "Pioppino: ein großes Büschel reifer, hellbrauner Fruchtkörper am Boden neben Holz.",
    author: "DidierFy",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Cyclocybe_aegerita_10.2025_(5).jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Cyclocybe aegerita",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  enoki: {
    src: "/mushrooms/enoki.jpg",
    altDe:
      "Enoki, natürliche braune Form von Flammulina filiformis: kleine orangebraune Hüte auf einem Baumstamm. Die bekannte weiße langstielige Kulturform sieht anders aus.",
    author: "Licheng Shih",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Flammulina_filiformis_254199892.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Flammulina filiformis",
    reviewedAt: "2026-10-29",
    captionDe: "Enoki – natürliche braune Form",
  },
  nameko: {
    src: "/mushrooms/nameko.jpg",
    altDe:
      "Nameko: kleine glänzende, goldbraune Hüte und helle Stiele in einer durchsichtigen Schale.",
    author: "Kuha455405",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Pholiota_nameko.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Pholiota nameko",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  shimeji: {
    src: "/mushrooms/shimeji.jpg",
    altDe:
      "Shimeji: ein Büschel kleiner braun gemusterter Hüte auf schlanken weißen Stielen.",
    author: "Popolon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Hypsizygus_marmoreus_(Brown_shimeji).jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Hypsizygus marmoreus",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  mandelpilz: {
    src: "/mushrooms/mandelpilz.jpg",
    altDe:
      "Mandelpilz: zwei Fruchtkörper zeigen helle Stiele und eine dunkelbraune Lamellenunterseite auf Laub.",
    author: "Wynand Uys",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Agaricus_subrufescens_111585496.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Agaricus subrufescens",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  stockschwaemmchen: {
    src: "/mushrooms/stockschwaemmchen.jpg",
    altDe:
      "Stockschwämmchen: zwei kleine gelbbraune Hüte mit Ring am schuppigen Stiel auf Holz. Kein Bestimmungsbild.",
    author: "Dendrofil",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kuehneromyces_mutabilis.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Kuehneromyces mutabilis",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
  goldkaeppchen: {
    src: "/mushrooms/goldkaeppchen.jpg",
    altDe:
      "Goldkäppchen, Handelsname für Nameko: glänzende goldbraune Hüte mit hellen Stielen in einer Schale.",
    author: "Kuha455405",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Pholiota_nameko.jpg",
    verified: true,
    transparent: false,
    status: "photo",
    scientificName: "Pholiota nameko",
    reviewedAt: "2026-10-29",
    captionDe: "Fotografie",
  },
};

export const MUSHROOM_PHOTOS = mushroomPhotos;
