import { ExperienceProvider } from "../experience/ExperienceProvider";
import { SpeechProvider } from "../experience/Speech";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { GrowboxProvider } from "../state/GrowboxProvider";
import { Layout } from "../components/Layout";
import { MushroomLibraryPage } from "./MushroomLibraryPage";
import { MushroomDetailPage } from "./MushroomDetailPage";
import { GrowboxPage } from "./GrowboxPage";
import { GrowthPage } from "./GrowthPage";
import { CONFIG } from "../simulation/engine";
import { isValidState } from "../state/persistence";
import { entries } from "../data/catalog";
const saved = () => {
  const state: unknown = JSON.parse(localStorage.getItem(CONFIG.storageKey)!);
  if (!isValidState(state)) throw new Error("Gespeicherter Zustand ungültig");
  return state;
};
function setup(initialEntry = "/pilze") {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          { path: "/pilze", element: <MushroomLibraryPage /> },
          { path: "/pilze/:slug", element: <MushroomDetailPage /> },
          { path: "/growbox", element: <GrowboxPage /> },
          { path: "/wachstum", element: <GrowthPage /> },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
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
  return userEvent.setup();
}
describe("Zentraler Bedienablauf", () => {
  it("sucht, bestätigt eine neue Kultur, startet, übernimmt manuelle Geräte, simuliert CO₂ und pausiert", async () => {
    const user = setup();
    await user.type(
      screen.getByRole("searchbox", { name: "Pilze suchen" }),
      "Igelstachelbart",
    );
    await user.click(
      screen.getByRole("link", { name: /Igelstachelbart.*Hericium/ }),
    );
    await user.click(
      screen.getByRole("button", { name: "In meiner Growbox anbauen" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const original = saved();
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(saved().cycle).toEqual(original.cycle);
    expect(
      screen.getByRole("button", { name: "In meiner Growbox anbauen" }),
    ).toHaveFocus();
    await user.click(
      screen.getByRole("button", { name: "In meiner Growbox anbauen" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Kultur vorbereiten" }),
    );
    expect(saved().cycle?.slug).toBe("igelstachelbart");
    expect(saved().cycle?.status).toBe("Bereit");
    expect(saved().cycle?.elapsedHours).toBe(0);
    await user.click(screen.getByRole("button", { name: "Demo starten" }));
    await user.click(screen.getByRole("button", { name: "Manuell" }));
    await user.selectOptions(
      screen.getByLabelText("Frischluft · Entwurf"),
      "0",
    );
    expect(saved().settings.ventilation).toBe(true);
    await user.click(
      screen.getByRole("button", { name: "Einstellungen übernehmen" }),
    );
    expect(saved().settings.ventilation).toBe(false);
    expect(saved().settings.mode).toBe("Manuell");
    await user.click(screen.getByText("Demo-Szenarien", { exact: true }));
    await user.click(screen.getByRole("button", { name: "CO₂ erhöht" }));
    expect(saved().reading.co2).toBe(1800);
    expect(
      screen.getByText("CO₂ über der Demo-Hinweisgrenze von 1.500 ppm"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Normalbetrieb" }));
    expect(saved().reading.co2).toBe(850);
    await user.click(screen.getByRole("button", { name: "Pausieren" }));
    expect(saved().cycle?.status).toBe("Pausiert");
    expect(
      screen.getByRole("button", { name: "Einen Demo-Tag vorspulen" }),
    ).toBeDisabled();
  });
  it("zeigt leere Suche mit Rücksetzen und schützt nicht übernommene Einstellungen", async () => {
    const user = setup();
    await user.type(
      screen.getByRole("searchbox", { name: "Pilze suchen" }),
      "xyz",
    );
    expect(
      screen.getByText("Keine passenden Pilze gefunden."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Filter zurücksetzen" }),
    );
    expect(screen.getByText("15 Einträge")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Meine Growbox" }));
    const temperature = screen.getByRole("spinbutton", {
      name: /Demo-Solltemperatur/,
    });
    await user.clear(temperature);
    expect(
      screen.getByRole("button", { name: "Einstellungen übernehmen" }),
    ).toBeDisabled();
    expect(screen.getByText(/Temperatur: Gib einen Wert/)).toBeInTheDocument();
    await user.type(temperature, "25");
    expect(saved().settings.temperature).toBe(20);
    await user.click(screen.getByRole("link", { name: /Pilzbibliothek/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Weiter bearbeiten",
      }),
    );
    expect(
      screen.getByRole("spinbutton", { name: /Demo-Solltemperatur/ }),
    ).toHaveValue(25);
    await user.click(screen.getByRole("link", { name: /Pilzbibliothek/ }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Änderungen verwerfen",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Deine Pilzbibliothek" }),
    ).toBeInTheDocument();
    expect(saved().settings.temperature).toBe(20);
  });
});

describe("Alle 15 Detail-Direktlinks", () => {
  it.each(entries)("öffnet $name mit Profil und Hauptaktion", (entry) => {
    setup(`/pilze/${entry.slug}`);
    expect(
      screen.getByRole("heading", { name: entry.name, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dein Demo-Profil" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "In meiner Growbox anbauen" }),
    ).toBeEnabled();
  });
});
