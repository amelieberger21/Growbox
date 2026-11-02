import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { entries, getEntry } from "../data/catalog";
import * as recipeData from "../data/recipes";
import { RECIPE_NOTICE, recipesFor, recipeFor } from "../data/recipes";
import { GrowboxProvider } from "../state/GrowboxProvider";
import { ExperienceProvider } from "../experience/ExperienceProvider";
import { SpeechProvider } from "../experience/Speech";
import { Layout } from "../components/Layout";
import { DashboardPage } from "./DashboardPage";
import { MushroomLibraryPage } from "./MushroomLibraryPage";
import { MushroomDetailPage } from "./MushroomDetailPage";
import { GrowboxPage } from "./GrowboxPage";
import { RecipeDetailPage, RecipeListPage } from "./RecipePages";

function setup(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/pilze", element: <MushroomLibraryPage /> },
          { path: "/pilze/:slug", element: <MushroomDetailPage /> },
          { path: "/pilze/:slug/rezepte", element: <RecipeListPage /> },
          {
            path: "/pilze/:slug/rezepte/:recipeId",
            element: <RecipeDetailPage />,
          },
          { path: "/growbox", element: <GrowboxPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(
    <GrowboxProvider>
      <ExperienceProvider>
        <SpeechProvider>
          <RouterProvider router={router} />
        </SpeechProvider>
      </ExperienceProvider>
    </GrowboxProvider>,
  );
  return { user: userEvent.setup(), router };
}

describe("Lokale Rezeptzuordnung", () => {
  it("liefert für alle 15 Einträge jeweils zwei vollständige, strukturierte Ideen", () => {
    expect(recipeData.recipes).toHaveLength(26);
    expect(new Set(recipeData.recipes.map((r) => r.id)).size).toBe(26);
    for (const entry of entries) {
      const ideas = recipesFor(entry);
      expect(ideas).toHaveLength(2);
      for (const recipe of ideas) {
        expect(recipe.speciesId).toBe(entry.speciesId);
        expect(recipe.minutes).toBeGreaterThan(0);
        expect(recipe.servings).toBe(2);
        expect(["vegan", "vegetarian"]).toContain(recipe.diet);
        expect(recipe.ingredients.length).toBeGreaterThan(3);
        expect(
          recipe.ingredients.every((i) => i.amount > 0 && i.unit && i.name),
        ).toBe(true);
        expect(recipe.steps.length).toBeGreaterThanOrEqual(4);
      }
    }
  });
  it("teilt Rezeptzuordnungen für dieselbe Art und lehnt artfremde Rezept-IDs ab", () => {
    expect(recipesFor(getEntry("nameko")!)).toEqual(
      recipesFor(getEntry("goldkaeppchen")!),
    );
    expect(recipesFor(getEntry("weisser-champignon")!)).toEqual(
      recipesFor(getEntry("brauner-champignon")!),
    );
    expect(
      recipeFor(getEntry("enoki")!, "austernseitlinge-zitrone"),
    ).toBeUndefined();
    expect(recipesFor({ speciesId: "ohne-rezeptprofil" })).toEqual([]);
  });
});
describe("Rezeptaufruf und verlässliche Zurück-Navigation", () => {
  it("navigiert von gefilterter Pilzauswahl über Karten und Zutaten zurück zur selben Pilzansicht", async () => {
    const { user, router } = setup("/pilze?q=Igelstachelbart&filter=Mittel");
    await user.click(
      screen.getByRole("link", { name: /Igelstachelbart.*Hericium/ }),
    );
    await user.click(screen.getByRole("link", { name: /^Rezeptideen/ }));
    expect(
      screen.getByRole("heading", {
        name: "Rezeptideen · Igelstachelbart",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(RECIPE_NOTICE)).toBeInTheDocument();
    await user.click(
      screen.getByRole("link", { name: /Igelstachelbart-Bratlinge/ }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Igelstachelbart-Bratlinge",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Das brauchst du" }),
    ).toBeInTheDocument();
    expect(screen.getByText("50 g")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Schritt für Schritt" }),
    ).toBeInTheDocument();
    expect(screen.getByText(RECIPE_NOTICE)).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("mycobox.demo.v1")!).cycle.slug,
    ).toBe("austernseitling");
    await user.click(
      screen.getByRole("link", { name: "Zurück zu den Rezeptideen" }),
    );
    await user.click(
      screen.getByRole("link", { name: "Zurück zum Pilz: Igelstachelbart" }),
    );
    expect(
      screen.getByRole("heading", { name: "Igelstachelbart", level: 1 }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("link", { name: "Zurück zur Pilzbibliothek" }),
    );
    expect(new URLSearchParams(router.state.location.search).get("q")).toBe(
      "Igelstachelbart",
    );
    expect(
      new URLSearchParams(router.state.location.search).get("filter"),
    ).toBe("Mittel");
  });
  it("aktualisiert den dezenten Kultur-Link nach einer bestätigten Pilzauswahl", async () => {
    const { user, router } = setup("/");
    const originalLink = screen.getByRole("link", { name: "Rezeptideen" });
    expect(originalLink).toHaveAttribute(
      "href",
      "/pilze/austernseitling/rezepte",
    );
    await user.click(originalLink);
    expect(
      screen.getByRole("heading", {
        name: "Rezeptideen · Austernseitling",
        level: 1,
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("link", { name: "Zurück zur Kulturübersicht: MycoBox" }),
    );
    expect(
      screen.getByRole("heading", { name: "Deine MycoBox im Überblick" }),
    ).toBeInTheDocument();
    await act(() => router.navigate("/pilze/enoki"));
    await user.click(
      screen.getByRole("button", { name: "In meiner Growbox anbauen" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Kultur vorbereiten" }),
    );
    await user.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(screen.getByRole("link", { name: "Rezeptideen" })).toHaveAttribute(
      "href",
      "/pilze/enoki/rezepte",
    );
    await user.click(screen.getByRole("link", { name: "Rezeptideen" }));
    expect(
      screen.getByRole("heading", { name: "Rezeptideen · Enoki", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Austernseitling-Pasta/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Enoki vollständig durchgaren/),
    ).toBeInTheDocument();
  });
  it("zeigt bei fehlenden Rezeptdaten einen nutzbaren Leerzustand", async () => {
    vi.spyOn(recipeData, "recipesFor").mockReturnValue([]);
    const { user } = setup("/pilze/enoki/rezepte");
    expect(
      screen.getByRole("heading", {
        name: "Für dieses Profil sind noch keine Rezeptideen hinterlegt.",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Zurück zum Pilz" }));
    expect(
      screen.getByRole("heading", { name: "Enoki", level: 1 }),
    ).toBeInTheDocument();
  });
  it("zeigt bei artfremdem Direktlink keine fremde Zubereitung und einen Rückweg", async () => {
    const { user } = setup("/pilze/enoki/rezepte/austernseitlinge-zitrone");
    expect(
      screen.getByRole("heading", {
        name: "Diese Rezeptidee ist für den ausgewählten Pilz nicht hinterlegt.",
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("link", { name: "Passende Rezeptideen ansehen" }),
    );
    expect(
      screen.getByRole("heading", { name: "Rezeptideen · Enoki", level: 1 }),
    ).toBeInTheDocument();
  });
});
