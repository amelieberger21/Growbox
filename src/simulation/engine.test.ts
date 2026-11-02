import { describe, expect, it } from "vitest";
import {
  entries,
  filterEntries,
  getEntry,
  getProfile,
  profiles,
  species,
} from "../data/catalog";
import {
  advance,
  CONFIG,
  createInitialState,
  cultureDay,
  percent,
  phaseAt,
  profileSettings,
  reducer,
  tick,
  validateSettings,
} from "./engine";
import { isValidState, loadState } from "../state/persistence";

describe("Verbindliche Bibliothek", () => {
  it("enthält genau 15 eindeutige Einträge mit gültigen Referenzen", () => {
    expect(entries).toHaveLength(15);
    expect(new Set(entries.map((item) => item.slug)).size).toBe(15);
    for (const entry of entries) {
      expect(profiles[entry.demoId]).toBeDefined();
      expect(species[entry.speciesId]).toBeDefined();
    }
    expect(entries.map((entry) => entry.slug)).toEqual([
      "austernseitling",
      "kraeuterseitling",
      "shiitake",
      "weisser-champignon",
      "brauner-champignon",
      "rosenseitling",
      "zitronenseitling",
      "igelstachelbart",
      "pioppino",
      "enoki",
      "nameko",
      "shimeji",
      "mandelpilz",
      "stockschwaemmchen",
      "goldkaeppchen",
    ]);
  });
  it("teilt Nameko/Goldkäppchen und die Champignon-Art korrekt", () => {
    expect(getProfile(getEntry("nameko")!)).toBe(
      getProfile(getEntry("goldkaeppchen")!),
    );
    expect(getEntry("nameko")!.speciesId).toBe(
      getEntry("goldkaeppchen")!.speciesId,
    );
    expect(getEntry("weisser-champignon")!.speciesId).toBe(
      getEntry("brauner-champignon")!.speciesId,
    );
    expect(getEntry("weisser-champignon")!.color).not.toBe(
      getEntry("brauner-champignon")!.color,
    );
  });
  it("kombiniert Umlautsuche, Synonyme, Wissenschaftsnamen, Filter und Sortierung", () => {
    expect(
      filterEntries("Kraeuterseitling", "Mittel", "default").map(
        (entry) => entry.slug,
      ),
    ).toEqual(["kraeuterseitling"]);
    expect(filterEntries("Hericium", "Alle", "default")[0].name).toBe(
      "Igelstachelbart",
    );
    expect(filterEntries("Goldkaeppchen", "Alle", "default")).toHaveLength(2);
    expect(filterEntries("Hericium", "Einfach", "name")).toHaveLength(0);
    const sorted = filterEntries("", "Alle", "name");
    expect(sorted[0].name).toBe("Austernseitling");
    expect(sorted.at(-1)?.name).toBe("Zitronenseitling");
  });
});
describe("Zentrale Simulation", () => {
  it("startet exakt mit der definierten Austernseitling-Demo", () => {
    const initial = createInitialState();
    expect(initial.cycle?.status).toBe("Läuft");
    expect(initial.reading.temperature).toBe(21.2);
    expect(initial.reading.humidity).toBe(88);
    expect(initial.reading.co2).toBe(850);
    expect(cultureDay(initial)).toBe(20);
    expect(Math.round(percent(initial))).toBe(68);
    expect(phaseAt(percent(initial))).toBe(3);
    expect(initial.history).toHaveLength(24);
  });
  it("bereitet die neue Kultur vor und startet nur ausdrücklich", () => {
    const prepared = reducer(createInitialState(), {
      type: "PREPARE",
      slug: "igelstachelbart",
    });
    expect(prepared.cycle?.status).toBe("Bereit");
    expect(percent(prepared)).toBe(0);
    expect(prepared.history).toHaveLength(0);
    expect(tick(prepared)).toBe(prepared);
    expect(
      reducer(prepared, { type: "STATUS", status: "Läuft" }).cycle?.status,
    ).toBe("Läuft");
  });
  it("stoppt in Pause und nach Beenden vollständig", () => {
    const paused = reducer(createInitialState(), {
      type: "STATUS",
      status: "Pausiert",
    });
    expect(tick(paused)).toBe(paused);
    expect(advance(paused, 24)).toBe(paused);
    const resumed = reducer(paused, { type: "STATUS", status: "Läuft" });
    expect(tick(resumed).cycle?.elapsedHours).toBe(
      resumed.cycle!.elapsedHours + 1,
    );
    const ended = reducer(resumed, { type: "STATUS", status: "Beendet" });
    expect(tick(ended)).toBe(ended);
    expect(reducer(ended, { type: "STATUS", status: "Läuft" })).toBe(ended);
  });
  it("ignoriert unzulässige Zustandsübergänge", () => {
    const state = createInitialState();
    expect(reducer(state, { type: "STATUS", status: "Bereit" })).toBe(state);
  });
  it("validiert Bediengrenzen, leere Werte und Schrittlängen", () => {
    const settings = profileSettings("austernseitling");
    expect(validateSettings(settings)).toEqual([]);
    for (const temperature of [NaN, 9, 31, 20.2])
      expect(validateSettings({ ...settings, temperature })).not.toHaveLength(
        0,
      );
    for (const humidity of [NaN, 59, 96, 88.5])
      expect(validateSettings({ ...settings, humidity })).not.toHaveLength(0);
    expect(
      validateSettings({ ...settings, temperature: 30, humidity: 95 }),
    ).toHaveLength(0);
  });
  it("übernimmt erst per Action und erhält historische Sollwerte", () => {
    const state = createInitialState();
    const oldHistory = structuredClone(state.history);
    const draft = { ...state.settings, temperature: 24 };
    expect(state.settings.temperature).toBe(20);
    const applied = reducer(state, { type: "APPLY", settings: draft });
    expect(applied.settings.temperature).toBe(24);
    expect(applied.history).toEqual(oldHistory);
    expect(tick(applied).history.at(-1)?.targetTemperature).toBe(24);
    expect(tick(applied).history.at(-2)?.targetTemperature).toBe(20);
  });
  it("ignoriert ungültige Einstellungen", () => {
    const state = createInitialState();
    expect(
      reducer(state, {
        type: "APPLY",
        settings: { ...state.settings, humidity: 100 },
      }),
    ).toBe(state);
  });
  it("regelt Automatik und manuelle Belüftung nachvollziehbar", () => {
    const state = createInitialState();
    expect(tick(state).reading.temperature).toBeLessThan(
      state.reading.temperature,
    );
    const manual = reducer(state, {
      type: "APPLY",
      settings: {
        ...state.settings,
        mode: "Manuell",
        ventilation: false,
        freshAir: 0,
      },
    });
    expect(tick(manual).reading.co2).toBeGreaterThan(manual.reading.co2);
    const auto = reducer(manual, {
      type: "APPLY",
      settings: { ...manual.settings, mode: "Automatik", light: false },
    });
    expect(auto.settings.ventilation).toBe(true);
    expect(auto.settings.light).toBe(true);
  });
  it("verwendet reproduzierbare Schwankungen", () => {
    expect(advance(createInitialState(), 24)).toEqual(
      advance(createInitialState(), 24),
    );
  });
  it("setzt Szenarien exakt und protokolliert eine Abweichung nur einmal", () => {
    const initial = createInitialState();
    const high = reducer(initial, { type: "SCENARIO", scenario: "co2" });
    expect(high.reading.co2).toBe(1800);
    expect(high.alerts).toContain("co2");
    const repeated = reducer(high, { type: "SCENARIO", scenario: "co2" });
    expect(
      repeated.events.filter((event) => event.type === "warning"),
    ).toHaveLength(1);
    const normal = reducer(repeated, { type: "SCENARIO", scenario: "normal" });
    expect(normal.alerts).toEqual([]);
    expect(
      normal.events.filter((event) => event.type === "resolved"),
    ).toHaveLength(1);
    expect(
      reducer(initial, { type: "SCENARIO", scenario: "humidity" }).reading
        .humidity,
    ).toBe(75);
    expect(
      reducer(initial, { type: "SCENARIO", scenario: "temperature" }).reading
        .temperature,
    ).toBe(25);
  });
  it("verändert in Pause keine Sensorwerte durch Szenarien", () => {
    const paused = reducer(createInitialState(), {
      type: "STATUS",
      status: "Pausiert",
    });
    expect(reducer(paused, { type: "SCENARIO", scenario: "co2" })).toBe(paused);
  });
  it("springt konsistent zum nächsten Tag und zur nächsten Phase", () => {
    const initial = createInitialState();
    const day = advance(initial, 24);
    expect(day.cycle?.elapsedHours).toBe(480);
    expect(cultureDay(day)).toBe(21);
    expect(day.history).toHaveLength(48);
    const phase = reducer(initial, { type: "NEXT_PHASE" });
    expect(phaseAt(percent(phase))).toBe(4);
    expect(percent(phase)).toBeGreaterThanOrEqual(90);
    expect(phase.reading.hours).toBe(phase.cycle?.elapsedHours);
  });
  it("berechnet alle Phasengrenzen einschließlich 100 Prozent", () => {
    expect(
      [0, 9.9, 10, 44.9, 45, 64.9, 65, 89.9, 90, 100].map(phaseAt),
    ).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });
  it("schließt bei 100 Prozent ab und begrenzt Messwerte & Ereignisse", () => {
    let state = advance(createInitialState(), 1000);
    expect(percent(state)).toBe(100);
    expect(state.cycle?.status).toBe("Abgeschlossen");
    expect(cultureDay(state)).toBe(28);
    expect(tick(state)).toBe(state);
    expect(state.history).toHaveLength(CONFIG.maxHistory);
    state = reducer(state, { type: "PREPARE", slug: "austernseitling" });
    for (let i = 0; i < 110; i++) {
      state = reducer(state, { type: "STATUS", status: "Läuft" });
      state = reducer(state, { type: "STATUS", status: "Pausiert" });
    }
    expect(state.events).toHaveLength(200);
    expect(new Set(state.events.map((event) => event.id)).size).toBe(200);
  });
});
describe("Speicherung und Wiederherstellung", () => {
  it("prüft gespeicherte Daten und erhält sie ohne Nachberechnung", () => {
    const state = createInitialState();
    expect(isValidState(state)).toBe(true);
    const raw = JSON.stringify(state);
    expect(loadState({ getItem: () => raw }).state).toEqual(state);
  });
  it("fängt beschädigte Daten, unbekannte Versionen und blockierten Speicher ab", () => {
    for (const raw of [
      "broken",
      "{}",
      '{"version":2}',
      JSON.stringify({
        ...createInitialState(),
        settings: { temperature: 999 },
      }),
      JSON.stringify({ ...createInitialState(), history: ["invalid"] }),
    ]) {
      const loaded = loadState({ getItem: () => raw });
      expect(loaded.state.cycle?.slug).toBe("austernseitling");
      expect(loaded.message).not.toBe("");
    }
    expect(
      loadState({
        getItem: () => {
          throw new Error("blocked");
        },
      }).message,
    ).toContain("Arbeitsspeicher");
  });
  it("setzt den kompletten Demo-Zustand wieder zurück", () => {
    const state = advance(createInitialState(), 80);
    expect(reducer(state, { type: "RESET" })).toEqual(createInitialState());
  });
});
