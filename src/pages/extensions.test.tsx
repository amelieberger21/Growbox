import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { it, describe, expect } from "vitest";
import { Layout } from "../components/Layout";
import { GrowboxProvider } from "../state/GrowboxProvider";
import { ExperienceProvider } from "../experience/ExperienceProvider";
import { SpeechProvider } from "../experience/Speech";
import { GrowboxPage } from "./GrowboxPage";
import { GrowthPage, ClimatePage } from "./GrowthPage";
import { DashboardPage } from "./DashboardPage";
import { MushroomDetailPage } from "./MushroomDetailPage";
import { MushroomLibraryPage } from "./MushroomLibraryPage";
import { RecipeListPage, RecipeDetailPage } from "./RecipePages";
import {
  createInitialState,
  CONFIG,
  reducer,
  phaseAt,
  percent,
} from "../simulation/engine";
import { EXPERIENCE_KEY, initialExperience } from "../experience/model";
import { deviceState } from "../simulation/hardware";
const saved = () => JSON.parse(localStorage.getItem(CONFIG.storageKey)!);
function setup(path: string, completed = false) {
  const initial = completed
    ? reducer(reducer(createInitialState(), { type: "NEXT_PHASE" }), {
        type: "NEXT_PHASE",
      })
    : createInitialState();
  const exp = initialExperience(initial);
  exp.preferences.welcomeAnswered = true;
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(initial));
  localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(exp));
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/growbox", element: <GrowboxPage /> },
          { path: "/wachstum", element: <GrowthPage /> },
          { path: "/wachstum/klima", element: <ClimatePage /> },
          { path: "/pilze", element: <MushroomLibraryPage /> },
          { path: "/pilze/:slug", element: <MushroomDetailPage /> },
          { path: "/pilze/:slug/rezepte", element: <RecipeListPage /> },
          {
            path: "/pilze/:slug/rezepte/:recipeId",
            element: <RecipeDetailPage />,
          },
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
  return { router, user: userEvent.setup() };
}
describe("Erweiterte Bedienabläufe", () => {
  it("öffnet Phasendetails ohne Zustandsänderung und vergrößert das aktuelle Beispielbild", async () => {
    const { user } = setup("/wachstum");
    const original = saved();
    await user.click(
      screen.getByRole("button", {
        name: "Besiedlung des Substrats · Abgeschlossen",
      }),
    );
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Besiedlung des Substrats" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Zugehöriges Demo-Profil"),
    ).toBeInTheDocument();
    expect(saved().cycle).toEqual(original.cycle);
    expect(saved().settings).toEqual(original.settings);
    await user.click(
      within(dialog).getByRole("button", {
        name: "Zurück zum Wachstumsverlauf",
      }),
    );
    expect(
      screen.getByRole("button", {
        name: "Besiedlung des Substrats · Abgeschlossen",
      }),
    ).toHaveFocus();
    await user.click(
      screen.getByRole("button", { name: "Kamera-Vorschau vergrößern" }),
    );
    expect(
      within(screen.getByRole("dialog")).getByText(
        "Kamera-Vorschau · simuliertes Beispielbild",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog").querySelector("[data-frame]"),
    ).toHaveAttribute("data-frame", "austernseitling:phase-3");
  });
  it("spult konsistent vor, lässt Kultur abschließen und startet einen Pilzwechsel mit neuem Bild", async () => {
    const { user, router } = setup("/wachstum");
    await user.click(screen.getByText("Demo-Zeitsteuerung · Präsentation"));
    await user.click(
      screen.getByRole("button", { name: "Nächste Phase simulieren" }),
    );
    expect(phaseAt(percent(saved()))).toBe(4);
    expect(
      document.querySelector(".camera-preview [data-frame]"),
    ).toHaveAttribute("data-frame", "austernseitling:phase-4");
    await user.click(
      screen.getByRole("button", { name: "Demo-Zyklus abschließen" }),
    );
    expect(saved().cycle.status).toBe("Abgeschlossen");
    await act(() => router.navigate("/pilze/enoki"));
    await user.click(
      screen.getByRole("button", { name: "In meiner Growbox anbauen" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Kultur vorbereiten" }),
    );
    await user.click(screen.getByRole("button", { name: "Demo starten" }));
    await act(() => router.navigate("/wachstum"));
    expect(
      document.querySelector(".camera-preview [data-frame]"),
    ).toHaveAttribute("data-frame", "enoki:phase-0");
    expect(
      screen.queryByText("Austernseitling · Ernte"),
    ).not.toBeInTheDocument();
  });
  it("wendet Luft- und Lichtentwürfe erst nach Übernehmen an und validiert Zeiten", async () => {
    const { user } = setup("/growbox");
    expect(screen.getByLabelText("Umluft · Entwurf")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Manuell" }));
    await user.selectOptions(screen.getByLabelText("Umluft · Entwurf"), "3");
    await user.selectOptions(
      screen.getByLabelText("Frischluft · Entwurf"),
      "0",
    );
    await user.clear(screen.getByLabelText("Beginn"));
    expect(
      screen.getByRole("button", { name: "Einstellungen übernehmen" }),
    ).toBeDisabled();
    expect(screen.getByText(/Lichtzeit: Gib Beginn/)).toBeInTheDocument();
    // time inputs accept complete formatted values via a native input event in jsdom.
    const start = screen.getByLabelText("Beginn"),
      end = screen.getByLabelText("Ende");
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(start, { target: { value: "20:00" } });
    fireEvent.change(end, { target: { value: "08:00" } });
    expect(saved().settings.mode).toBe("Automatik");
    await user.click(
      screen.getByRole("button", { name: "Einstellungen übernehmen" }),
    );
    expect(saved().settings).toMatchObject({
      mode: "Manuell",
      circulation: 3,
      freshAir: 0,
      lightStart: "20:00",
      lightEnd: "08:00",
    });
    expect(deviceState(saved()).freshAir).toBe(0);
  });
  it("lädt beim Wechsel zurück zur Automatik gültige Gerätewerte statt eines unvollständigen Lichtentwurfs", async () => {
    const { user } = setup("/growbox");
    await user.click(screen.getByRole("button", { name: "Manuell" }));
    await user.clear(screen.getByLabelText("Beginn"));
    expect(screen.getByText(/Lichtzeit: Gib Beginn/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Automatik" }));
    expect(screen.queryByText(/Lichtzeit: Gib Beginn/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Beginn")).toHaveValue("08:00");
    expect(screen.getByLabelText("Beginn")).toBeDisabled();
    expect(screen.getByText("Alles übernommen")).toBeInTheDocument();
  });
  it("behandelt niedrig, leer und fehlenden Sensor; Nachfüllen und Wechsel bleiben getrennt", async () => {
    const { user } = setup("/growbox");
    await user.click(screen.getByText("Demo-Szenarien", { exact: true }));
    await user.click(
      screen.getByRole("button", { name: "Wassermangel simulieren" }),
    );
    expect(saved().water.level).toBe(8);
    await user.click(
      screen.getByRole("button", { name: "Leeren Tank simulieren" }),
    );
    expect(deviceState(saved()).pumpBlocked).toBe(true);
    const lastChanged = saved().water.lastChanged;
    await user.click(
      screen.getByRole("button", { name: "Wasser nachgefüllt" }),
    );
    expect(saved().water).toMatchObject({ level: 100, lastChanged });
    await user.click(screen.getByRole("button", { name: "Wasser gewechselt" }));
    expect(saved().water.lastChanged).toBe(saved().reading.time);
    await user.click(
      screen.getByRole("button", {
        name: "Füllstandsensor-Ausfall simulieren",
      }),
    );
    expect(saved().water.level).toBeNull();
    const panel = document.querySelector("#water-maintenance")!;
    expect(within(panel as HTMLElement).getByText("–")).toBeInTheDocument();
    expect(
      within(panel as HTMLElement).getByText("Sensor nicht verfügbar"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Wasser nachgefüllt" }),
    );
    expect(saved().water.level).toBeNull();
  });
  it("verlinkt zur passenden Einstellung, protokolliert Quittierung und behebt die Ursache separat", async () => {
    const { user } = setup("/growbox");
    await user.click(screen.getByText("Demo-Szenarien", { exact: true }));
    await user.click(screen.getByRole("button", { name: "CO₂ erhöht" }));
    await user.click(
      screen.getByRole("link", { name: "Frischluft einstellen" }),
    );
    expect(document.querySelector("#air-settings")).toHaveFocus();
    await user.click(
      screen.getByRole("button", { name: "Verdächtige Veränderung melden" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Beobachtung dokumentieren" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Hinweis quittieren" }),
    );
    expect(screen.getByText("Luftaustausch prüfen")).toBeInTheDocument();
    expect(
      saved().events.some((e: { text: string }) =>
        e.text.startsWith("Beobachtung quittiert"),
      ),
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: "Normalbetrieb" }));
    expect(screen.queryByText("Luftaustausch prüfen")).not.toBeInTheDocument();
    expect(
      saved().events.some((e: { text: string }) =>
        e.text.startsWith("Verdächtige"),
      ),
    ).toBe(true);
  });
  it("hält Rezepte nach Abschluss erreichbar und führt von einer Inline-Karte zum selben Pilz zurück", async () => {
    const { user } = setup("/", true);
    expect(saved().cycle.status).toBe("Abgeschlossen");
    await user.click(screen.getByRole("link", { name: "Rezeptideen" }));
    expect(
      screen.getByRole("heading", { name: "Rezeptideen · Austernseitling" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("link", { name: "Zurück zur Kulturübersicht: MycoBox" }),
    );
    await user.click(screen.getByRole("link", { name: "Austernseitling" }));
    await user.click(
      screen.getByRole("link", { name: /Austernseitling-Pasta/ }),
    );
    expect(
      screen.getByRole("heading", { name: "Schritt für Schritt" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Zurück zum Pilz" }));
    expect(
      screen.getByRole("heading", { name: "Austernseitling", level: 1 }),
    ).toBeInTheDocument();
  });
});

describe('Präzise Werte ohne Ziehen', () => {
  it.each([
    {field:'Demo-Solltemperatur', slider:'Demo-Solltemperatur per Slider', value:'45', shown:'45 °C'},
    {field:'Demo-Solltemperatur', slider:'Demo-Solltemperatur per Slider', value:'20.3', shown:'20,3 °C'},
    {field:'Demo-Solltemperatur', slider:'Demo-Solltemperatur per Slider', value:'', shown:'– °C'},
    {field:'Demo-Sollluftfeuchtigkeit', slider:'Demo-Sollluftfeuchtigkeit per Slider', value:'96', shown:'96 %'},
    {field:'Demo-Sollluftfeuchtigkeit', slider:'Demo-Sollluftfeuchtigkeit per Slider', value:'90.5', shown:'90,5 %'},
    {field:'Demo-Sollluftfeuchtigkeit', slider:'Demo-Sollluftfeuchtigkeit per Slider', value:'', shown:'– %'},
  ])('zeigt einen ungültigen Entwurf $field=$value ohne einen abweichenden Ersatzwert', ({field,slider,value,shown}) => {
    setup('/growbox');
    const before=saved().settings;
    const input=screen.getByRole('spinbutton',{name:new RegExp(field)});
    fireEvent.change(input,{target:{value}});
    const controls=within(screen.getByRole('group',{name:field}));
    expect(controls.getByRole('status')).toHaveTextContent(shown);
    expect(controls.getAllByRole('button').every(button=>(button as HTMLButtonElement).disabled)).toBe(true);
    expect(screen.queryByRole('slider',{name:slider})).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid','true');
    expect(screen.getByRole('button',{name:'Einstellungen übernehmen'})).toBeDisabled();
    expect(saved().settings).toEqual(before);
  });
  it('stellt nach Korrektur oder Verwerfen die synchronisierten Bedienelemente wieder her', async () => {
    const {user}=setup('/growbox');
    const input=screen.getByRole('spinbutton',{name:/Demo-Solltemperatur/});
    fireEvent.change(input,{target:{value:'45'}});
    fireEvent.change(input,{target:{value:'21.5'}});
    expect(screen.getByRole('slider',{name:'Demo-Solltemperatur per Slider'})).toHaveValue('21.5');
    expect(within(screen.getByRole('group',{name:'Demo-Solltemperatur'})).getByRole('status')).toHaveTextContent('21,5 °C');
    await user.click(screen.getByRole('button',{name:'Einstellungen übernehmen'}));
    expect(saved().settings.temperature).toBe(21.5);
    fireEvent.change(input,{target:{value:''}});
    await user.click(screen.getByRole('button',{name:'Änderungen verwerfen'}));
    expect(input).toHaveValue(21.5);
    expect(input).toHaveAttribute('aria-invalid','false');
    expect(screen.getByRole('slider',{name:'Demo-Solltemperatur per Slider'})).toHaveValue('21.5');
  });
  it('synchronisiert Plus, Minus, Zahleneingabe und Slider und übernimmt erst nach Bestätigung', async () => {
    const {user}=setup('/growbox');
    const before=saved().settings;
    const plus=screen.getByRole('button',{name:'Demo-Solltemperatur: Erhöhen (0.5 °C)'});
    await user.click(plus);
    expect(screen.getByRole('spinbutton',{name:/Demo-Solltemperatur/})).toHaveValue(before.temperature+.5);
    expect(screen.getByRole('slider',{name:'Demo-Solltemperatur per Slider'})).toHaveValue(String(before.temperature+.5));
    expect(saved().settings.temperature).toBe(before.temperature);
    const slider=screen.getByRole('slider',{name:'Demo-Solltemperatur per Slider'});
    const {fireEvent}=await import('@testing-library/react');
    fireEvent.change(slider,{target:{value:'30'}});
    expect(plus).toBeDisabled();
    expect(screen.getByRole('spinbutton',{name:/Demo-Solltemperatur/})).toHaveValue(30);
    await user.click(screen.getByRole('button',{name:'Demo-Solltemperatur: Verringern (0.5 °C)'}));
    expect(slider).toHaveValue('29.5');
    fireEvent.change(screen.getByRole('spinbutton',{name:/Demo-Sollluftfeuchtigkeit/}),{target:{value:'60'}});
    expect(screen.getByRole('button',{name:'Demo-Sollluftfeuchtigkeit: Verringern (1 %)'})).toBeDisabled();
    await user.click(screen.getByRole('button',{name:'Demo-Sollluftfeuchtigkeit: Erhöhen (1 %)'}));
    expect(screen.getByRole('slider',{name:'Demo-Sollluftfeuchtigkeit per Slider'})).toHaveValue('61');
    await user.click(screen.getByRole('button',{name:'Manuell'}));
    const light=screen.getByRole('slider',{name:/Helligkeit/});
    fireEvent.change(light,{target:{value:'100'}});
    expect(screen.getByRole('button',{name:'Helligkeit: Erhöhen (1 %)'})).toBeDisabled();
    await user.click(screen.getByRole('button',{name:'Helligkeit: Verringern (1 %)'}));
    expect(light).toHaveValue('99');
    await user.click(screen.getByRole('button',{name:'Einstellungen übernehmen'}));
    expect(saved().settings).toMatchObject({temperature:29.5,humidity:61,brightness:99,mode:'Manuell'});
  });
  it('respektiert Automatik und abgeschlossene Kulturen auch für die neuen Schaltflächen', async()=>{
    setup('/growbox',true);
    expect(screen.getByRole('button',{name:'Demo-Solltemperatur: Erhöhen (0.5 °C)'})).toBeDisabled();
    expect(screen.getByRole('button',{name:'Helligkeit: Verringern (1 %)'})).toBeDisabled();
  });
});
