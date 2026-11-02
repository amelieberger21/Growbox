import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { GrowboxProvider } from "../state/GrowboxProvider";
import { ExperienceProvider } from "./ExperienceProvider";
import { SpeechProvider } from "./Speech";
import { EXPERIENCE_KEY, initialExperience } from "./model";
import { createInitialState } from "../simulation/engine";
import { Layout } from "../components/Layout";
import { DashboardPage } from "../pages/DashboardPage";
import { MushroomLibraryPage } from "../pages/MushroomLibraryPage";
import { MushroomDetailPage } from "../pages/MushroomDetailPage";
import { GrowboxPage } from "../pages/GrowboxPage";
import { GrowthPage } from "../pages/GrowthPage";
import { SettingsPage } from "../pages/SettingsPage";
import { HelpPage } from "../pages/HelpPage";
function setup(path = "/") {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/pilze", element: <MushroomLibraryPage /> },
          { path: "/pilze/:slug", element: <MushroomDetailPage /> },
          { path: "/growbox", element: <GrowboxPage /> },
          { path: "/wachstum", element: <GrowthPage /> },
          { path: "/einstellungen", element: <SettingsPage /> },
          { path: "/hilfe", element: <HelpPage /> },
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
  return userEvent.setup();
}
describe("Champ und Einstellungen", () => {
  it("kombiniert Begrüßung und Audio-Abfrage und schließt die Erinnerung separat", async () => {
    const exp = initialExperience(createInitialState());
    localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(exp));
    const user = setup();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nein, danke" }));
    expect(
      screen.getByRole("heading", { name: "Soll ich dir etwas vorlesen?" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nein, danke" }));
    expect(
      screen.getByRole("button", { name: /Doch ein Tutorial/ }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Champ-Erinnerung schließen" }),
    );
    expect(
      screen.queryByRole("button", { name: /Doch ein Tutorial/ }),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".tour-popover")).toBeNull();
  });
  it("führt durch alle neun Stationen und verändert dabei die Kultur nicht", async () => {
    const user = setup("/hilfe");
    await user.click(
      screen.getByRole("button", { name: "Tutorial mit Champ starten" }),
    );
    for (let step = 1; step <= 9; step++) {
      const tour = screen.getByRole("dialog");
      expect(within(tour).getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        String(step),
      );
      await user.click(
        within(tour).getByRole("button", {
          name: step === 9 ? "Fertig" : "Weiter",
        }),
      );
    }
    expect(document.querySelector(".tour-popover")).toBeNull();
    const saved = JSON.parse(localStorage.getItem("mycobox.demo.v1")!);
    expect(saved.cycle.slug).toBe("austernseitling");
  });
  it("wechselt Deutsch, Englisch und Persisch samt Leserichtung", async () => {
    const user = setup("/einstellungen");
    const select = screen.getByLabelText("Sprache", {
      selector: "#settings-language",
    });
    await user.selectOptions(select, "en");
    expect(
      screen.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeInTheDocument();
    await user.selectOptions(select, "fa");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(document.documentElement).toHaveAttribute("lang", "fa");
    expect(
      screen.getByRole("heading", { name: "تنظیمات", level: 1 }),
    ).toBeInTheDocument();
    await user.selectOptions(select, "de");
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
  });
  it("speichert größere Schrift, Kontrast und einfache Sprache sofort", async () => {
    const user = setup("/einstellungen");
    await user.click(screen.getByRole("button", { name: "Sehr groß" }));
    await user.click(screen.getByRole("switch", { name: "Hoher Kontrast" }));
    await user.click(screen.getByRole("switch", { name: "Einfache Sprache" }));
    expect(
      document.documentElement.style.getPropertyValue("--user-font-scale"),
    ).toBe("1.3");
    expect(document.documentElement.dataset.contrast).toBe("high");
    expect(document.documentElement.dataset.easy).toBe("true");
    const saved = JSON.parse(localStorage.getItem(EXPERIENCE_KEY)!);
    expect(saved.preferences.fontScale).toBe(1.3);
  });
  it("zeigt Wasserhinweise im Center und markiert Meldungen als gelesen", async () => {
    const user = setup("/growbox");
    await user.click(screen.getByText("Demo-Szenarien", { exact: true }));
    await user.click(
      screen.getByRole("button", { name: "Wassermangel simulieren" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Wasserwechsel fällig" }),
    );
    await user.click(
      screen.getByRole("button", { name: /Benachrichtigungen \(2\)/ }),
    );
    expect(
      screen.getByText(
        "Wasser im Tank nachfüllen. Der simulierte Füllstand ist niedrig.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Wasserwechsel-Erinnerung fällig. Bitte den simulierten Wechsel bestätigen.",
      ),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Alle als gelesen markieren" }),
    );
    expect(screen.getAllByRole("button", { name: "Gelesen" })).toHaveLength(2);
  });
});
