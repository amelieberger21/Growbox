import { SafetyNotice } from "../components/MushroomFacts";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Clock3,
  Leaf,
  Users,
  Utensils,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { getEntry } from "../data/catalog";
import {
  recipesFor,
  recipeFor,
  RECIPE_NOTICE,
  RECIPE_SOURCES,
  type MushroomRecipe,
} from "../data/recipes";
import type { MushroomEntry } from "../types";
import { useT } from "../i18n";
import { formatNumber } from "../simulation/engine";
import { InfoNote, PageHeader } from "../components/ui";
import { NotFoundPage } from "./NotFoundPage";

function recipeReturn(state: unknown, slug: string) {
  const fallback = `/pilze/${slug}`;
  if (!state || typeof state !== "object")
    return {
      returnTo: fallback,
      librarySearch: "",
      detailReturnTo: `/pilze/${slug}/rezepte`,
    };
  const returnTo =
    "returnTo" in state &&
    (state.returnTo === "/" || state.returnTo === fallback)
      ? state.returnTo
      : fallback;
  const librarySearch =
    "librarySearch" in state && typeof state.librarySearch === "string"
      ? state.librarySearch
      : "";
  const detailReturnTo =
    "detailReturnTo" in state && state.detailReturnTo === fallback
      ? fallback
      : `/pilze/${slug}/rezepte`;
  return { returnTo, librarySearch, detailReturnTo };
}
export function RecipeEntry({
  entry,
  librarySearch = "",
}: {
  entry: MushroomEntry;
  librarySearch?: string;
}) {
  const tx = useT();
  return (
    <section className="panel inline-recipes" id="rezeptideen">
      <Link
        className="recipe-entry"
        to={`/pilze/${entry.slug}/rezepte`}
        state={{ returnTo: `/pilze/${entry.slug}`, librarySearch }}
       aria-label={tx("Rezeptideen")} title={tx("Rezeptideen")}>
        <span className="recipe-entry-icon">
          <ChefHat size={24}  aria-hidden="true" />
        </span>
        <span>
          <h2>{tx("Rezeptideen")}</h2>
          <small>{tx("Zubereitungsideen für diesen Pilz entdecken")}</small>
        </span>
        <ArrowRight size={18}  aria-hidden="true" />
      </Link>
      <RecipeCards
        entry={entry}
        navigation={{
          returnTo: `/pilze/${entry.slug}`,
          librarySearch,
          detailReturnTo: `/pilze/${entry.slug}`,
        }}
      />
    </section>
  );
}
function RecipeNotice({ entry }: { entry: MushroomEntry }) {
  const tx = useT();
  return (
    <div className="recipe-notices">
      <InfoNote warning>{tx(RECIPE_NOTICE)}</InfoNote>
      <SafetyNotice entry={entry}/>
    </div>
  );
}
function RecipeMeta({ recipe }: { recipe: MushroomRecipe }) {
  const tx = useT();
  return (
    <div className="recipe-meta">
      <span>
        <Clock3 size={15}  aria-hidden="true" />
        {tx("ca.")} {formatNumber(recipe.minutes)} {tx("Minuten")}
      </span>
      <span>
        <Users size={15}  aria-hidden="true" />
        {formatNumber(recipe.servings)} {tx("Portionen")}
      </span>
      <span className="recipe-diet">
        <Leaf size={14}  aria-hidden="true" />
        {tx(recipe.diet === "vegan" ? "Vegan" : "Vegetarisch")}
      </span>
    </div>
  );
}
export function EmptyRecipes({ slug }: { slug: string }) {
  const tx = useT();
  return (
    <div className="empty-state recipe-empty">
      <ChefHat size={37}  aria-hidden="true" />
      <h2>{tx("Für dieses Profil sind noch keine Rezeptideen hinterlegt.")}</h2>
      <p>
        {tx(
          "Du kannst zum Pilz zurückkehren und seine Informationen weiter ansehen.",
        )}
      </p>
      <Link to={`/pilze/${slug}`} className="button button-primary" aria-label={tx("Zurück zum Pilz")} title={tx("Zurück zum Pilz")}>
        <ArrowLeft size={16}  aria-hidden="true" />
        {tx("Zurück zum Pilz")}
      </Link>
    </div>
  );
}
export function RecipeCards({
  entry,
  navigation,
}: {
  entry: MushroomEntry;
  navigation: ReturnType<typeof recipeReturn>;
}) {
  const tx = useT();
  const ideas = recipesFor(entry);
  if (!ideas.length) return <EmptyRecipes slug={entry.slug} />;
  return (
    <div className="recipe-grid">
      {ideas.map((recipe, index) => (
        <Link
          className="recipe-card"
          key={recipe.id}
          to={`/pilze/${entry.slug}/rezepte/${recipe.id}`}
          state={navigation}
         title={tx("EINE IDEE FÜR DEINE KÜCHE")}>
          <div className={`recipe-card-visual recipe-tone-${index % 3}`}>
            <span className="recipe-card-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <ChefHat size={53} strokeWidth={1.2}  aria-hidden="true" />
            <span>{tx("EINE IDEE FÜR DEINE KÜCHE")}</span>
          </div>
          <div className="recipe-card-body">
            <p className="recipe-mushroom-name">
              <Utensils size={13}  aria-hidden="true" />
              {tx(entry.name)}
            </p>
            <h3>{tx(recipe.name)}</h3>
            <RecipeMeta recipe={recipe} />
            <span className="recipe-card-link">
              {tx("Zutaten & Zubereitung")}
              <ArrowRight size={16}  aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
export function RecipeListPage() {
  const tx = useT();
  const { slug = "" } = useParams();
  const entry = getEntry(slug);
  const location = useLocation();
  const navigation = recipeReturn(location.state, slug);
  if (!entry) return <NotFoundPage />;
  const ideas = recipesFor(entry);
  return (
    <div className="page recipe-list-page">
      <Link
        className="back-link"
        to={navigation.returnTo}
        state={{ librarySearch: navigation.librarySearch }} title={tx(
          navigation.returnTo === "/"
            ? "Zurück zur Kulturübersicht"
            : "Zurück zum Pilz",
        )}>
        <ArrowLeft size={16}  aria-hidden="true" />
        {tx(
          navigation.returnTo === "/"
            ? "Zurück zur Kulturübersicht"
            : "Zurück zum Pilz",
        )}
        : {navigation.returnTo === "/" ? "MycoBox" : tx(entry.name)}
      </Link>
      <PageHeader
        eyebrow={tx("VOM PILZ ZUR ZUBEREITUNGSIDEE")}
        title={`${tx("Rezeptideen")} · ${tx(entry.name)}`}
        description={tx(
          "Entdecke passende Gerichte in deinem Tempo. Diese Ideen sind unabhängig von Messwerten und Kulturfortschritt.",
        )}
      />
      <RecipeNotice entry={entry} />
      {ideas.length ? (
        <>
          <div className="recipe-list-caption">
            <span>
              <BookOpen size={16}  aria-hidden="true" />
              {formatNumber(ideas.length)} {tx("Rezeptideen")}
            </span>
            <span>{tx("In Ruhe stöbern. Ohne Anmeldung.")}</span>
          </div>
          <RecipeCards entry={entry} navigation={navigation} />
        </>
      ) : (
        <EmptyRecipes slug={entry.slug} />
      )}
      <p className="recipe-independent">
        {tx(
          "Ein grüner Klimastatus und ein abgeschlossener Demo-Zyklus sind keine Aussage zur Essbarkeit oder echten Erntereife.",
        )}
      </p>
    </div>
  );
}
export function RecipeDetailPage() {
  const tx = useT();
  const { slug = "", recipeId = "" } = useParams();
  const entry = getEntry(slug);
  const location = useLocation();
  const navigation = recipeReturn(location.state, slug);
  if (!entry) return <NotFoundPage />;
  const recipe = recipeFor(entry, recipeId);
  if (!recipe)
    return (
      <div className="page">
        <Link
          className="back-link"
          to={`/pilze/${slug}/rezepte`}
          state={navigation} title={tx(
            navigation.detailReturnTo === `/pilze/${entry.slug}`
              ? "Zurück zum Pilz"
              : "Zurück zu den Rezeptideen",
          )}>
          <ArrowLeft size={16}  aria-hidden="true" />
          {tx(
            navigation.detailReturnTo === `/pilze/${entry.slug}`
              ? "Zurück zum Pilz"
              : "Zurück zu den Rezeptideen",
          )}
        </Link>
        <div className="empty-state">
          <ChefHat size={35}  aria-hidden="true" />
          <h1>
            {tx(
              "Diese Rezeptidee ist für den ausgewählten Pilz nicht hinterlegt.",
            )}
          </h1>
          <Link
            className="button button-primary"
            to={`/pilze/${slug}/rezepte`}
            state={navigation}
          >
            {tx("Passende Rezeptideen ansehen")}
          </Link>
        </div>
      </div>
    );
  return (
    <div className="page recipe-detail-page">
      <div className="recipe-breadcrumbs">
        <Link
          className="back-link"
          to={navigation.detailReturnTo}
          state={navigation} title={tx(
            navigation.detailReturnTo === `/pilze/${entry.slug}`
              ? "Zurück zum Pilz"
              : "Zurück zu den Rezeptideen",
          )}>
          <ArrowLeft size={16}  aria-hidden="true" />
          {tx(
            navigation.detailReturnTo === `/pilze/${entry.slug}`
              ? "Zurück zum Pilz"
              : "Zurück zu den Rezeptideen",
          )}
        </Link>
        <Link
          className="text-link"
          to={`/pilze/${entry.slug}`}
          state={{ librarySearch: navigation.librarySearch }}
         aria-label={tx("Zum Pilzprofil")} title={tx("Zum Pilzprofil")}>
          {tx("Zum Pilzprofil")}: {tx(entry.name)}
          <ArrowRight size={15}  aria-hidden="true" />
        </Link>
      </div>
      <section className="recipe-detail-heading">
        <span className="recipe-heading-icon">
          <ChefHat size={42} strokeWidth={1.3}  aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">
            {tx("REZEPTIDEE")} · {tx(entry.name)}
          </p>
          <h1>{tx(recipe.name)}</h1>
          <RecipeMeta recipe={recipe} />
        </div>
      </section>
      <RecipeNotice entry={entry} />
      <div className="recipe-detail-grid">
        <section className="panel recipe-ingredients">
          <h2>{tx("Das brauchst du")}</h2>
          <p>
            {tx("Mengen für")} {formatNumber(recipe.servings)} {tx("Portionen")}
          </p>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                <span className="ingredient-amount" dir="auto">
                  {formatNumber(
                    ingredient.amount,
                    ingredient.amount % 1 === 0 ? 0 : 1,
                  )}{" "}
                  {tx(ingredient.unit)}
                </span>
                <span>
                  {tx(ingredient.mushroom ? entry.name : ingredient.name)}
                </span>
              </li>
            ))}
          </ul>
          <p className="verification-note">
            {tx(
              "Die Mengen sind Einkaufsangaben für dieses Rezept und keine Ertragsprognose deiner Growbox.",
            )}
          </p>
        </section>
        <section className="panel recipe-steps">
          <h2>{tx("Schritt für Schritt")}</h2>
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={index}>
                <span className="recipe-step-number">
                  {formatNumber(index + 1)}
                </span>
                <p>{tx(step)}</p>
              </li>
            ))}
          </ol>
          <p className="recipe-timing-note">
            <Clock3 size={16}  aria-hidden="true" />
            {tx(
              "Die Zeitangaben sind ungefähr. Vollständiges Garen und artspezifische Hinweise gehen vor Zeitangaben.",
            )}
          </p>
        </section>
      </div>
      <details className="panel recipe-sources">
        <summary>{tx("Über diese Rezeptideen & Zubereitungshinweise")}</summary>
        <p>
          {tx(
            "Eigene, lokale Rezeptvorschläge für den Prototyp. Die folgenden Fachquellen unterstützen die Zubereitungshinweise; sie sind keine Quelle für die Rezeptkompositionen.",
          )}
        </p>
        {RECIPE_SOURCES.map((source) => (
          <a
            className="source-link"
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            {source.name}
            <ExternalLink size={14}  aria-hidden="true" />
          </a>
        ))}
      </details>
    </div>
  );
}
