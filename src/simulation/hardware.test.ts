import { describe, it, expect } from "vitest";
import {
  createInitialState,
  reducer,
  tick,
  validateSettings,
  CONFIG,
  phaseAt,
  percent,
} from "./engine";
import { deviceState, lightWindow, tankStatus } from "./hardware";
import { loadState, isValidState } from "../state/persistence";
import { exampleFrame } from "../components/GrowthVisual";
import { getEntry } from "../data/catalog";

describe("Gemeinsames Technikmodell", () => {
  it("verarbeitet Tageslicht und Zeiträume über Mitternacht einschließlich der Grenzen", () => {
    expect(lightWindow(8, "08:00", "20:00")).toBe(true);
    expect(lightWindow(20, "08:00", "20:00")).toBe(false);
    expect(lightWindow(23, "20:00", "08:00")).toBe(true);
    expect(lightWindow(0, "20:00", "08:00")).toBe(true);
    expect(lightWindow(7.5, "20:00", "08:00")).toBe(true);
    expect(lightWindow(8, "20:00", "08:00")).toBe(false);
    expect(lightWindow(12, "20:00", "08:00")).toBe(false);
    expect(lightWindow(12, "08:00", "08:00")).toBe(false);
    expect(lightWindow(12, "", "25:00")).toBe(false);
  });
  it("lehnt unvollständige Zeiten, gleiche Grenzen, ungültige Helligkeit und Lüfterstufen ab", () => {
    const settings = createInitialState().settings;
    for (const patch of [
      { lightStart: "" },
      { lightEnd: "25:00" },
      { lightEnd: settings.lightStart },
      { brightness: 101 },
      { freshAir: 4 },
    ])
      expect(
        validateSettings({ ...settings, ...patch } as typeof settings).length,
      ).toBeGreaterThan(0);
  });
  it("verwendet in Automatik das aktive Phasenprofil und erhöht Frischluft bei CO₂", () => {
    let state = createInitialState();
    state = reducer(state, { type: "SCENARIO", scenario: "co2" });
    expect(deviceState(state).freshAir).toBe(3);
    expect(tick(state).reading.co2).toBeLessThan(state.reading.co2);
    state = reducer(state, { type: "PREPARE", slug: "enoki" });
    state = reducer(state, { type: "STATUS", status: "Läuft" });
    expect(deviceState(state).brightness).toBe(0);
    expect(deviceState(state).circulation).toBe(1);
  });
  it("unterscheidet Umluft und Frischluft und setzt Lichtentwürfe erst beim Anwenden um", () => {
    const state = createInitialState();
    const draft = {
      ...state.settings,
      mode: "Manuell" as const,
      freshAir: 0 as const,
      circulation: 3 as const,
      brightness: 75,
      lightStart: "20:00",
      lightEnd: "08:00",
    };
    expect(state.settings).not.toEqual(draft);
    const manual = reducer(state, { type: "APPLY", settings: draft });
    expect(deviceState(manual).circulation).toBe(3);
    expect(deviceState(manual).freshAir).toBe(0);
    expect(tick(manual).reading.co2).toBeGreaterThan(manual.reading.co2);
    expect(deviceState(manual).lightOn).toBe(false); // initial demo clock is 08:00
    const dark = reducer(manual, {
      type: "APPLY",
      settings: { ...draft, brightness: 0 },
    });
    expect(deviceState(dark).lightOn).toBe(false);
  });
  it.each(["empty", "unavailable"] as const)(
    "sperrt bei %s die Wasserförderung auch bei Feuchtigkeitsbedarf",
    (action) => {
      let state = createInitialState();
      state = reducer(state, { type: "SCENARIO", scenario: "humidity" });
      state = reducer(state, { type: "WATER", action });
      expect(deviceState(state).pumpBlocked).toBe(true);
      expect(deviceState(state).pumpOn).toBe(false);
      expect(tick(state).reading.humidity).toBeLessThanOrEqual(
        state.reading.humidity,
      );
      expect(tankStatus(state.water)).toBe(
        action === "empty" ? "empty" : "unavailable",
      );
    },
  );
  it("unterscheidet Nachfüllen, Wechsel und Sensorausfall ohne fehlende Werte als 0 zu behandeln", () => {
    let state = reducer(createInitialState(), { type: "WATER", action: "low" });
    const lastChanged = state.water.lastChanged;
    state = reducer(state, { type: "WATER", action: "refilled" });
    expect(state.water.level).toBe(100);
    expect(state.water.lastChanged).toBe(lastChanged);
    state = reducer(state, { type: "WATER", action: "low" });
    state = reducer(state, { type: "WATER", action: "changed" });
    expect(state.water.level).toBe(8);
    expect(state.water.lastChanged).toBe(state.reading.time);
    state = reducer(state, { type: "WATER", action: "unavailable" });
    expect(state.water.level).toBeNull();
    state = reducer(state, { type: "WATER", action: "refilled" });
    expect(state.water.level).toBeNull();
    expect(deviceState(state).pumpOn).toBe(false);
    expect(isValidState(state)).toBe(true);
  });
  it("hält quittierte Beobachtung im Verlauf und verändert die Ursache nicht", () => {
    let state = reducer(createInitialState(), {
      type: "SCENARIO",
      scenario: "co2",
    });
    state = reducer(state, { type: "REPORT_OBSERVATION" });
    const reading = state.reading;
    state = reducer(state, { type: "ACK_OBSERVATION" });
    expect(state.reading).toEqual(reading);
    expect(state.alerts).toContain("co2");
    expect(state.observation?.acknowledgedAt).not.toBeNull();
    expect(
      state.events.filter(
        (e) => e.text.includes("Verdächtige") || e.text.includes("quittiert"),
      ),
    ).toHaveLength(2);
  });
  it("migriert alte Profile und übernimmt die vorhandene Wasserwartung nur beim ersten Laden", () => {
    const initial = createInitialState();
    const legacy = JSON.parse(JSON.stringify(initial));
    delete legacy.water;
    delete legacy.observation;
    for (const key of [
      "circulation",
      "freshAir",
      "brightness",
      "lightStart",
      "lightEnd",
    ])
      delete legacy.settings[key];
    legacy.settings.ventilation = false;
    const storage = {
      getItem: (key: string) =>
        key === CONFIG.storageKey
          ? JSON.stringify(legacy)
          : JSON.stringify({
              water: {
                level: 31,
                lastChanged: initial.reading.time - 86400000,
              },
            }),
    };
    const restored = loadState(storage);
    expect(restored.message).toBe("");
    expect(restored.state.cycle).toEqual(initial.cycle);
    expect(restored.state.history).toEqual(initial.history);
    expect(restored.state.water.level).toBe(31);
    expect(restored.state.settings.freshAir).toBe(0);
    expect(restored.state.settings.lightStart).toBe("08:00");
    expect(isValidState(restored.state)).toBe(true);
    const saved = {
      ...restored.state,
      water: { ...restored.state.water, level: 0 },
    };
    expect(
      loadState({
        getItem: (key) =>
          key === CONFIG.storageKey
            ? JSON.stringify(saved)
            : storage.getItem(key),
      }).state.water.level,
    ).toBe(0);
  });
  it("aktualisiert Phasenbild mit Fortschritt und entfernt die alte Pilzzuordnung beim Wechsel", () => {
    const state = createInitialState();
    const next = reducer(state, { type: "NEXT_PHASE" });
    const frame = exampleFrame(
      getEntry(state.cycle!.slug)!,
      phaseAt(percent(state)),
    );
    const updated = exampleFrame(
      getEntry(next.cycle!.slug)!,
      phaseAt(percent(next)),
    );
    expect(frame.id).not.toBe(updated.id);
    const changed = reducer(next, { type: "PREPARE", slug: "igelstachelbart" });
    expect(
      exampleFrame(getEntry(changed.cycle!.slug)!, phaseAt(percent(changed)))
        .id,
    ).toBe("igelstachelbart:phase-0");
  });
});
