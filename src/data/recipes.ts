import type { MushroomEntry } from "../types";

export interface RecipeIngredient {
  amount: number;
  unit: string;
  name: string;
  mushroom?: boolean;
}
export interface MushroomRecipe {
  id: string;
  speciesId: string;
  name: string;
  minutes: number;
  servings: number;
  diet: "vegan" | "vegetarian";
  ingredients: RecipeIngredient[];
  steps: string[];
}
export const RECIPE_NOTICE =
  "Verwende nur sicher bestimmte, einwandfreie Speisepilze. Beachte die Zubereitungshinweise der jeweiligen Art.";
const ingredient = (
  amount: number,
  unit: string,
  name: string,
): RecipeIngredient => ({ amount, unit, name });
const I = ingredient;
const PREP =
  "Putze die einwandfreien Pilze und schneide sie passend zu. Beachte die Hinweise zur jeweiligen Art und auf der Packung.";
const FRY =
  "Erhitze das Öl in einer großen Pfanne. Brate die Pilze unter Wenden vollständig durch; sie sollen nicht roh bleiben. Beachte dabei die artspezifischen Zubereitungshinweise.";
const FINISH =
  "Schmecke mit Salz und Pfeffer ab und serviere das Gericht warm.";
interface Method {
  ingredients: RecipeIngredient[];
  steps: string[];
}
const methods: Record<string, Method> = {
  pan: {
    ingredients: [
      I(2, "EL", "Olivenöl"),
      I(1, "Stück", "Knoblauchzehe"),
      I(1, "EL", "Zitronensaft"),
      I(2, "EL", "gehackte Petersilie"),
      I(200, "g", "veganes Brot"),
    ],
    steps: [
      PREP,
      "Schneide den Knoblauch fein und mische ihn mit Zitronensaft und Petersilie.",
      FRY,
      "Gib die Kräutermischung zu den fertig gegarten Pilzen. Serviere sie mit dem Brot.",
      FINISH,
    ],
  },
  pasta: {
    ingredients: [
      I(180, "g", "Pasta ohne Ei"),
      I(150, "g", "Blattspinat"),
      I(150, "ml", "pflanzliche Kochcreme"),
      I(1, "Stück", "Zwiebel"),
      I(2, "EL", "Olivenöl"),
    ],
    steps: [
      PREP,
      "Koche die Pasta nach Packungsangabe. Hebe etwas Kochwasser auf. Würfle die Zwiebel.",
      FRY,
      "Gib die Zwiebel dazu und dünste sie weich. Füge Spinat und Kochcreme hinzu und lasse die Sauce köcheln, bis der Spinat gegart ist.",
      "Mische die Pasta unter. Gib bei Bedarf etwas Kochwasser dazu.",
      FINISH,
    ],
  },
  rice: {
    ingredients: [
      I(150, "g", "Reis"),
      I(150, "g", "Möhren"),
      I(1, "Stück", "Zwiebel"),
      I(10, "g", "frischer Ingwer"),
      I(2, "EL", "Sojasauce"),
      I(2, "EL", "Pflanzenöl"),
    ],
    steps: [
      PREP,
      "Koche den Reis nach Packungsangabe. Schneide Möhren und Zwiebel klein und reibe den Ingwer.",
      FRY,
      "Füge das Gemüse und den Ingwer hinzu. Brate alles weiter, bis die Möhren gar sind.",
      "Mische den gegarten Reis und die Sojasauce unter und erhitze alles gemeinsam. Schmecke ab und serviere warm.",
    ],
  },
  risotto: {
    ingredients: [
      I(160, "g", "Risottoreis"),
      I(600, "ml", "heiße Gemüsebrühe"),
      I(1, "Stück", "Zwiebel"),
      I(2, "EL", "Olivenöl"),
      I(20, "g", "Butter"),
      I(30, "g", "vegetarischer Hartkäse ohne tierisches Lab"),
    ],
    steps: [
      PREP,
      FRY,
      "Nimm die gegarten Pilze heraus. Dünste die gewürfelte Zwiebel in derselben Pfanne und röste den Reis kurz mit.",
      "Gib die heiße Brühe portionsweise dazu. Rühre regelmäßig und lasse den Reis nach Packungsangabe gar werden.",
      "Hebe die vollständig gegarten Pilze, Butter und geriebenen vegetarischen Hartkäse unter.",
      FINISH,
    ],
  },
  noodleSoup: {
    ingredients: [
      I(150, "g", "Reisnudeln"),
      I(800, "ml", "Gemüsebrühe"),
      I(150, "g", "Pak Choi"),
      I(10, "g", "frischer Ingwer"),
      I(2, "EL", "Sojasauce"),
    ],
    steps: [
      PREP,
      "Schneide Pak Choi und Ingwer klein. Bringe die Gemüsebrühe mit Sojasauce zum Kochen.",
      "Gib die Pilze und den Ingwer in die Brühe. Lasse die Pilze vollständig durchgaren; halte dich an artspezifische und Packungshinweise.",
      "Gib Pak Choi und Reisnudeln hinzu und gare beides nach Packungsangabe. Die Pilze müssen auch innen durchgegart sein.",
      "Schmecke die Suppe ab und serviere sie heiß. Gib keine rohen Pilze als Garnitur dazu.",
    ],
  },
  creamPan: {
    ingredients: [
      I(1, "Stück", "Zwiebel"),
      I(150, "ml", "Sahne"),
      I(100, "ml", "Gemüsebrühe"),
      I(2, "EL", "Olivenöl"),
      I(200, "g", "veganes Brot"),
      I(2, "EL", "gehackte Petersilie"),
    ],
    steps: [
      PREP,
      "Würfle die Zwiebel.",
      FRY,
      "Gib die Zwiebel dazu und dünste sie weich. Füge Brühe und Sahne hinzu und lasse die Sauce etwas einkochen.",
      "Bestreue die Pfanne mit Petersilie und serviere sie mit Brot.",
      FINISH,
    ],
  },
  stuffed: {
    ingredients: [
      I(150, "g", "Frischkäse"),
      I(1, "Stück", "Frühlingszwiebel"),
      I(30, "g", "vegetarischer Hartkäse ohne tierisches Lab"),
      I(1, "EL", "Olivenöl"),
      I(200, "g", "veganes Brot"),
    ],
    steps: [
      PREP,
      "Heize den Backofen auf 190 °C Ober-/Unterhitze vor. Löse die Stiele der großen Champignons und hacke sie fein.",
      "Mische die gehackten Stiele mit Frischkäse und klein geschnittener Frühlingszwiebel. Würze die Füllung.",
      "Setze die Hüte in eine geölte Form, fülle sie und streue den vegetarischen Hartkäse darüber.",
      "Backe die gefüllten Pilze ungefähr 20–25 Minuten, bis auch die Pilze und die Füllung vollständig gegart sind. Beachte Packungs- und Artangaben. Serviere mit Brot.",
    ],
  },
  tacos: {
    ingredients: [
      I(4, "Stück", "kleine vegane Tortillas"),
      I(150, "g", "Weißkohl"),
      I(1, "Stück", "Möhre"),
      I(100, "g", "pflanzliche Joghurtalternative"),
      I(1, "EL", "Limettensaft"),
      I(2, "EL", "Pflanzenöl"),
      I(1, "TL", "Paprikapulver"),
    ],
    steps: [
      PREP,
      "Hoble Weißkohl und Möhre fein. Mische beides mit Joghurtalternative und Limettensaft und würze den Salat.",
      FRY,
      "Würze die fertig gegarten Pilze mit Paprikapulver. Erwärme die Tortillas nach Packungsangabe.",
      "Fülle die Tortillas mit Pilzen und Krautsalat und serviere sie direkt.",
    ],
  },
  couscous: {
    ingredients: [
      I(150, "g", "Couscous"),
      I(200, "ml", "heiße Gemüsebrühe"),
      I(150, "g", "Tomaten"),
      I(2, "EL", "Olivenöl"),
      I(1, "EL", "Zitronensaft"),
      I(2, "EL", "gehackte Petersilie"),
    ],
    steps: [
      PREP,
      "Übergieße den Couscous nach Packungsangabe mit heißer Brühe. Lasse ihn quellen und lockere ihn mit einer Gabel.",
      "Schneide die Tomaten klein.",
      FRY,
      "Hebe die gegarten Pilze, Tomaten, Zitronensaft und Petersilie unter den Couscous.",
      FINISH,
    ],
  },
  toast: {
    ingredients: [
      I(4, "Stück", "Brotscheiben"),
      I(100, "g", "Frischkäse"),
      I(1, "Stück", "Knoblauchzehe"),
      I(2, "EL", "Olivenöl"),
      I(2, "EL", "gehackte Petersilie"),
    ],
    steps: [
      PREP,
      "Röste die Brotscheiben. Schneide den Knoblauch fein.",
      FRY,
      "Gib den Knoblauch kurz vor Ende der Garzeit dazu und lasse ihn mitgaren.",
      "Bestreiche das Brot mit Frischkäse und belege es mit den vollständig gegarten Pilzen. Streue Petersilie darüber und serviere warm.",
    ],
  },
  patties: {
    ingredients: [
      I(1, "Stück", "Ei"),
      I(50, "g", "Semmelbrösel"),
      I(1, "Stück", "Zwiebel"),
      I(2, "EL", "Pflanzenöl"),
      I(2, "EL", "gehackte Petersilie"),
      I(200, "g", "veganes Brot"),
    ],
    steps: [
      PREP,
      "Zerteile die Pilze klein und würfle die Zwiebel.",
      FRY,
      "Brate die Zwiebel mit, lasse die Mischung kurz abkühlen und mische sie mit Ei, Semmelbröseln und Petersilie.",
      "Forme kleine flache Bratlinge. Brate sie bei mittlerer Hitze auf beiden Seiten, bis sie innen vollständig gegart sind. Serviere mit Brot.",
    ],
  },
  polenta: {
    ingredients: [
      I(120, "g", "Polenta"),
      I(500, "ml", "Gemüsebrühe"),
      I(20, "g", "Butter"),
      I(2, "EL", "Olivenöl"),
      I(2, "EL", "gehackte Petersilie"),
    ],
    steps: [
      PREP,
      "Koche die Polenta in der Gemüsebrühe nach Packungsangabe. Rühre die Butter ein.",
      FRY,
      "Verteile die cremige Polenta auf zwei Teller. Gib die vollständig gegarten Pilze und Petersilie darauf.",
      FINISH,
    ],
  },
  beanSalad: {
    ingredients: [
      I(250, "g", "weiße Bohnen, gekocht und abgetropft"),
      I(150, "g", "Tomaten"),
      I(1, "Stück", "Frühlingszwiebel"),
      I(2, "EL", "Olivenöl"),
      I(1, "EL", "Zitronensaft"),
      I(2, "EL", "gehackte Petersilie"),
    ],
    steps: [
      PREP,
      "Spüle die bereits gekochten Bohnen ab und lasse sie abtropfen. Schneide Tomaten und Frühlingszwiebel klein.",
      FRY,
      "Mische die vollständig gegarten Pilze noch warm mit Bohnen, Gemüse, Zitronensaft und Petersilie. Verwende keine rohen Bohnen.",
      FINISH,
    ],
  },
  roast: {
    ingredients: [
      I(1, "EL", "Pflanzenöl"),
      I(1, "EL", "Sojasauce"),
      I(1, "TL", "Sesamöl"),
      I(150, "g", "Reis"),
      I(1, "Stück", "Frühlingszwiebel"),
    ],
    steps: [
      PREP,
      "Heize den Backofen auf 200 °C Ober-/Unterhitze vor. Koche den Reis nach Packungsangabe.",
      "Teile die Enoki in kleine Bündel. Vermische Pflanzenöl, Sojasauce und Sesamöl und verteile die Mischung auf den Pilzen.",
      "Lege die Bündel in einer flachen Schicht in eine Form. Gare sie im Ofen vollständig durch. Rechne ungefähr mit 20 Minuten und beachte die Packungshinweise; die Zeit allein ist kein Gar-Nachweis.",
      "Serviere die durchgegarten Pilze mit Reis und geschnittener Frühlingszwiebel. Verwende keine rohen Enoki als Garnitur.",
    ],
  },
  misoSoup: {
    ingredients: [
      I(750, "ml", "Gemüsebrühe"),
      I(150, "g", "Naturtofu"),
      I(1, "Stück", "Frühlingszwiebel"),
      I(2, "EL", "Misopaste"),
      I(150, "g", "Reis"),
    ],
    steps: [
      PREP,
      "Koche den Reis nach Packungsangabe. Würfle den Tofu und schneide die Frühlingszwiebel.",
      "Bringe die Gemüsebrühe zum Kochen. Gib die Pilze hinein und lasse sie nach Art- und Packungshinweisen vollständig durchgaren.",
      "Gib den Tofu dazu und erhitze ihn mit. Verrühre die Misopaste mit etwas Brühe und gib sie in den Topf.",
      "Serviere die Suppe mit Frühlingszwiebel und dem gegarten Reis. Gib keine rohen Pilze als Garnitur dazu.",
    ],
  },
  soba: {
    ingredients: [
      I(160, "g", "Sobanudeln"),
      I(150, "g", "Möhren"),
      I(2, "EL", "Pflanzenöl"),
      I(2, "EL", "Sojasauce"),
      I(1, "TL", "Sesamöl"),
      I(1, "Stück", "Frühlingszwiebel"),
    ],
    steps: [
      PREP,
      "Koche die Sobanudeln nach Packungsangabe. Schneide Möhren und Frühlingszwiebel klein.",
      FRY,
      "Gib die Möhren dazu und gare sie mit. Mische die gekochten Sobanudeln, Sojasauce und Sesamöl unter.",
      "Erhitze alles gemeinsam und serviere mit Frühlingszwiebel. Alle Pilze müssen vollständig gegart sein.",
    ],
  },
  wok: {
    ingredients: [
      I(150, "g", "Reis"),
      I(200, "g", "Brokkoli"),
      I(1, "Stück", "Möhre"),
      I(2, "EL", "Pflanzenöl"),
      I(2, "EL", "Sojasauce"),
      I(10, "g", "frischer Ingwer"),
    ],
    steps: [
      PREP,
      "Koche den Reis nach Packungsangabe. Teile den Brokkoli in kleine Röschen, schneide die Möhre und reibe den Ingwer.",
      FRY,
      "Gib Gemüse und Ingwer dazu und brate alles weiter. Füge etwas Wasser hinzu und gare das Gemüse fertig.",
      "Mische die Sojasauce unter und serviere die vollständig gegarten Pilze mit Gemüse und Reis.",
    ],
  },
  potatoPan: {
    ingredients: [
      I(400, "g", "Kartoffeln"),
      I(1, "Stück", "Zwiebel"),
      I(2, "EL", "Olivenöl"),
      I(2, "EL", "gehackte Petersilie"),
    ],
    steps: [
      PREP,
      "Schäle die Kartoffeln, schneide sie in kleine Würfel und koche sie in Wasser gar. Lasse sie abtropfen. Würfle die Zwiebel.",
      FRY,
      "Gib Zwiebel und vorgegarte Kartoffeln dazu und brate sie goldbraun.",
      FINISH,
    ],
  },
  omelette: {
    ingredients: [
      I(4, "Stück", "Eier"),
      I(1, "Stück", "Frühlingszwiebel"),
      I(2, "EL", "Pflanzenöl"),
      I(2, "EL", "gehackte Petersilie"),
      I(200, "g", "veganes Brot"),
    ],
    steps: [
      PREP,
      "Verquirle die Eier und schneide die Frühlingszwiebel.",
      FRY,
      "Gib Frühlingszwiebel und Eier dazu. Lasse das Omelett bei niedriger bis mittlerer Hitze vollständig stocken, auch in der Mitte.",
      "Streue Petersilie darüber und serviere das durchgegarte Omelett mit Brot.",
    ],
  },
  barleyStew: {
    ingredients: [
      I(120, "g", "Perlgraupen"),
      I(900, "ml", "Gemüsebrühe"),
      I(150, "g", "Möhren"),
      I(1, "Stück", "Zwiebel"),
      I(2, "EL", "Pflanzenöl"),
    ],
    steps: [
      PREP,
      "Würfle Zwiebel und Möhren. Spüle die Graupen nach Packungsangabe ab.",
      FRY,
      "Gib Zwiebel und Möhren dazu und dünste sie an. Füge Graupen und Gemüsebrühe hinzu.",
      "Lasse den Eintopf nach Packungsangabe köcheln, bis die Graupen weich und die Pilze vollständig gegart sind.",
      FINISH,
    ],
  },
};
type RecipeSeed = [
  id: string,
  speciesId: string,
  name: string,
  method: string,
  minutes: number,
  diet: MushroomRecipe["diet"],
  mushroomGrams?: number,
];
const seeds: RecipeSeed[] = [
  [
    "austernseitlinge-zitrone",
    "oyster",
    "Austernseitlinge mit Kräuter-Zitronenöl",
    "pan",
    25,
    "vegan",
  ],
  [
    "austernseitling-spinat-pasta",
    "oyster",
    "Austernseitling-Pasta mit Spinat",
    "pasta",
    30,
    "vegan",
  ],
  [
    "kraeuterseitling-steaks",
    "king",
    "Kräuterseitling-Steaks mit Kräuteröl",
    "pan",
    25,
    "vegan",
  ],
  [
    "kraeuterseitling-risotto",
    "king",
    "Risotto mit Kräuterseitlingen",
    "risotto",
    40,
    "vegetarian",
  ],
  [
    "shiitake-ingwer-reis",
    "shiitake",
    "Shiitake-Reispfanne mit Ingwer",
    "rice",
    30,
    "vegan",
  ],
  [
    "shiitake-nudelsuppe",
    "shiitake",
    "Shiitake-Nudelsuppe mit Pak Choi",
    "noodleSoup",
    30,
    "vegan",
  ],
  [
    "champignon-rahmpfanne",
    "champignon",
    "Champignon-Rahmpfanne mit Petersilie",
    "creamPan",
    25,
    "vegetarian",
  ],
  [
    "gefuellte-champignons",
    "champignon",
    "Gefüllte Champignons mit Frischkäse",
    "stuffed",
    35,
    "vegetarian",
    350,
  ],
  [
    "rosenseitling-tacos",
    "pink",
    "Rosenseitling-Tacos mit Krautsalat",
    "tacos",
    30,
    "vegan",
  ],
  [
    "rosenseitling-reispfanne",
    "pink",
    "Rosenseitling-Reispfanne",
    "rice",
    30,
    "vegan",
  ],
  [
    "zitronenseitling-couscous",
    "yellow",
    "Zitronenseitling-Couscous mit Tomaten",
    "couscous",
    25,
    "vegan",
  ],
  [
    "zitronenseitling-ofenbrot",
    "yellow",
    "Zitronenseitlinge auf geröstetem Brot",
    "toast",
    25,
    "vegetarian",
  ],
  [
    "igelstachelbart-pfanne",
    "lion",
    "Igelstachelbart mit Zitrone und Petersilie",
    "pan",
    25,
    "vegan",
  ],
  [
    "igelstachelbart-bratlinge",
    "lion",
    "Igelstachelbart-Bratlinge",
    "patties",
    35,
    "vegetarian",
  ],
  [
    "pioppino-polenta",
    "pioppino",
    "Pioppino auf cremiger Polenta",
    "polenta",
    30,
    "vegetarian",
  ],
  [
    "pioppino-bohnensalat",
    "pioppino",
    "Warmer Pioppino-Bohnensalat",
    "beanSalad",
    25,
    "vegan",
  ],
  [
    "enoki-gemuesesuppe",
    "enoki",
    "Enoki-Gemüsesuppe mit Reisnudeln",
    "noodleSoup",
    30,
    "vegan",
  ],
  [
    "enoki-aus-dem-ofen",
    "enoki",
    "Enoki-Bündel aus dem Ofen mit Reis",
    "roast",
    35,
    "vegan",
  ],
  [
    "nameko-miso-suppe",
    "nameko",
    "Miso-Suppe mit Nameko und Tofu",
    "misoSoup",
    30,
    "vegan",
  ],
  [
    "nameko-sobanudeln",
    "nameko",
    "Nameko mit Sobanudeln und Möhren",
    "soba",
    30,
    "vegan",
  ],
  [
    "shimeji-brokkoli-wok",
    "shimeji",
    "Shimeji-Wok mit Brokkoli",
    "wok",
    30,
    "vegan",
  ],
  [
    "shimeji-risotto",
    "shimeji",
    "Cremiges Shimeji-Risotto",
    "risotto",
    40,
    "vegetarian",
  ],
  [
    "mandelpilz-kartoffelpfanne",
    "almond",
    "Mandelpilz-Kartoffelpfanne",
    "potatoPan",
    35,
    "vegan",
  ],
  [
    "mandelpilz-omelett",
    "almond",
    "Mandelpilz-Omelett mit Frühlingszwiebeln",
    "omelette",
    25,
    "vegetarian",
  ],
  [
    "stockschwaemmchen-ragout",
    "stock",
    "Stockschwämmchen-Ragout mit Petersilie",
    "creamPan",
    30,
    "vegetarian",
  ],
  [
    "stockschwaemmchen-graupentopf",
    "stock",
    "Stockschwämmchen-Graupentopf",
    "barleyStew",
    45,
    "vegan",
  ],
];
export const recipes: MushroomRecipe[] = seeds.map(
  ([id, speciesId, name, method, minutes, diet, mushroomGrams = 250]) => ({
    id,
    speciesId,
    name,
    minutes,
    servings: 2,
    diet,
    ingredients: [
      { amount: mushroomGrams, unit: "g", name: "Pilze", mushroom: true },
      ...methods[method].ingredients,
      I(1, "Prise", "Salz"),
      I(1, "Prise", "Pfeffer"),
    ],
    steps: methods[method].steps,
  }),
);
export const recipesFor = (
  entry: Pick<MushroomEntry, "speciesId">,
): MushroomRecipe[] =>
  recipes.filter((recipe) => recipe.speciesId === entry.speciesId);
export const recipeFor = (
  entry: Pick<MushroomEntry, "speciesId">,
  id: string,
) => recipesFor(entry).find((recipe) => recipe.id === id);
export const RECIPE_SOURCES = [
  {
    name: "Bayerisches Landesamt für Gesundheit und Lebensmittelsicherheit",
    url: "https://www.lgl.bayern.de/lebensmittel/warengruppen/wc_27_pilze/hinweise_verbraucher_pilze.htm",
  },
  {
    name: "Singapore Food Agency · Enoki",
    url: "https://www.sfa.gov.sg/food-safety-tips/food-risk-concerns/risk-at-a-glance/enoki-mushrooms",
  },
];
