import { describe, expect, it } from "vitest";
import { getEntry } from "../data/catalog";
import { createInitialState, reducer } from "../simulation/engine";
import {
  assessState,
  CULTIVATION,
  DEFAULT_PREFERENCES,
  evaluateCondition,
  initialExperience,
  phaseRange,
  suggestedSettings,
  updateExperience,
  type Assessment,
} from "./model";
import { validExperience } from "./ExperienceProvider";
const config = DEFAULT_PREFERENCES.warning;
const entry = getEntry("austernseitling")!;
const assess = (value: number, previous?: Assessment) =>
  evaluateCondition({
    entry,
    phase: 3,
    metric: "temperature",
    value,
    range: [15, 22],
    verified: false,
    config,
    previous,
  });
describe("Phasenbezogene Bewertung", () => {
  it("unterscheidet Grün, Gelb, Rot und fehlende Daten", () => {
    expect(assess(19).level).toBe("optimal");
    expect(assess(23).level).toBe("warning");
    expect(assess(26).level).toBe("critical");
    expect(
      evaluateCondition({
        entry,
        phase: 1,
        metric: "temperature",
        value: 19,
        range: null,
        verified: false,
        config,
      }).level,
    ).toBe("unknown");
  });
  it("vergleicht ungeprüfte Daten nur bei explizit erlaubtem Demo-Vergleich", () => {
    expect(
      evaluateCondition({
        entry,
        phase: 3,
        metric: "temperature",
        value: 19,
        range: [15, 22],
        verified: false,
        config: { ...config, provisionalDemo: false },
      }).level,
    ).toBe("unknown");
    expect(assess(19).basis).toBe("demo");
  });
  it("entprellt die Rückkehr in den grünen Bereich durch Hysterese", () => {
    const warning = assess(22.4);
    expect(assess(21.9, warning).level).toBe("warning");
    expect(assess(21.6, warning).level).toBe("optimal");
    const critical = assess(25.1);
    expect(assess(24.9, critical).level).toBe("critical");
    expect(assess(24.6, critical).level).toBe("warning");
  });
  it("behält für Stockschwämmchen unknown ohne erfundene Zahlen", () => {
    const stock = getEntry("stockschwaemmchen")!;
    for (const phase of [0, 1, 2, 3, 4]) {
      expect(phaseRange(stock, phase, "temperature").range).toBeNull();
      expect(phaseRange(stock, phase, "humidity").range).toBeNull();
    }
  });
  it("trennt nachgewiesene Shimeji-Protokolle nach Phase", () => {
    const shimeji = getEntry("shimeji")!;
    expect(phaseRange(shimeji, 1, "temperature")).toEqual({
      range: [21, 25],
      verified: true,
    });
    expect(phaseRange(shimeji, 3, "temperature")).toEqual({
      range: [13, 15],
      verified: true,
    });
    expect(phaseRange(shimeji, 0, "temperature").range).toBeNull();
  });
  it("verwendet konfigurierbare CO₂-Demoschwellen", () => {
    const grow = createInitialState();
    const high = { ...grow, reading: { ...grow.reading, co2: 1600 } };
    expect(
      assessState(high, { ...config, co2Limit: 1200, co2Critical: 300 }).co2
        .level,
    ).toBe("critical");
    expect(assessState(high, { ...config, co2Limit: 1800 }).co2.level).toBe(
      "optimal",
    );
  });
  it("erfindet keine zweite Art aus widersprüchlichen Nameko/Goldkäppchen-Werten", () => {
    const nameko = getEntry("nameko")!;
    const gold = getEntry("goldkaeppchen")!;
    expect(CULTIVATION[nameko.speciesId]).toBe(CULTIVATION[gold.speciesId]);
    expect(CULTIVATION.nameko.verified).toBe(false);
    expect(CULTIVATION.nameko.note).toContain("widersprechen");
  });
  it("aktualisiert Vorschläge nach Art und Phase ohne Übernahme", () => {
    let grow = reducer(createInitialState(), {
      type: "PREPARE",
      slug: "shimeji",
    });
    const original = grow.settings;
    expect(suggestedSettings(grow).available).toBe(false);
    grow = reducer(grow, { type: "STATUS", status: "Läuft" });
    grow = reducer(grow, { type: "DEMO_FRUITING" });
    const proposed = suggestedSettings(grow);
    expect(proposed.settings.temperature).toBe(14);
    expect(proposed.settings.humidity).toBe(93);
    expect(proposed.provisional).toBe(false);
    expect(grow.settings).toEqual(original);
  });
});
describe("Benachrichtigungen und Wasser", () => {
  it("protokolliert die Behebung genau einmal", () => {
    const grow = createInitialState();
    let exp = initialExperience(grow);
    const high = reducer(grow, {
      type: "SENSOR",
      metric: "temperature",
      value: 28,
    });
    exp = updateExperience(exp, high);
    exp = updateExperience(exp, grow);
    exp = updateExperience(exp, grow);
    expect(
      exp.notifications.filter((n) => n.key === "notification.recovered"),
    ).toHaveLength(1);
  });
  it("erzeugt pro zusammenhängender Warnung keine Meldungsflut", () => {
    const grow = createInitialState();
    let experience = initialExperience(grow);
    const high = reducer(grow, {
      type: "SENSOR",
      metric: "temperature",
      value: 28,
    });
    experience = updateExperience(experience, high);
    const count = experience.notifications.length;
    for (let i = 0; i < 10; i++)
      experience = updateExperience(experience, high);
    expect(experience.notifications).toHaveLength(count);
    expect(experience.notifications[0].severity).toBe("critical");
  });
  it("unterscheidet Wassermangel und fälligen Wechsel als eigene Meldungen", () => {
    const grow = createInitialState();
    const original = initialExperience(grow);
    const experience = updateExperience(original, {
      ...grow,
      water: { level: 8, lastChanged: original.lastDemoTime - 8 * 86400000 },
    });
    expect(experience.notifications.map((n) => n.kind)).toEqual(
      expect.arrayContaining(["water-low", "water-change"]),
    );
  });
  it("sammelt bei deaktivierten Benachrichtigungen keine neuen Meldungen", () => {
    const grow = createInitialState();
    const base = initialExperience(grow);
    const disabled = {
      ...base,
      preferences: { ...base.preferences, notificationsEnabled: false },
    };
    expect(updateExperience(disabled, grow).notifications).toHaveLength(0);
  });
  it("senkt den Tank nur mit Demo-Zeit und nicht während Pause", () => {
    let grow = createInitialState();
    grow = reducer(grow, { type: "TICK", hours: 24 });
    expect(grow.water.level).toBeLessThan(68);
    const paused = reducer(grow, { type: "STATUS", status: "Pausiert" });
    expect(reducer(paused, { type: "TICK", hours: 24 }).water).toEqual(
      paused.water,
    );
  });
  it("meldet neue Phase und Demo-Ernte ohne echte Erntereife zu behaupten", () => {
    let grow = createInitialState();
    let exp = initialExperience(grow);
    grow = reducer(grow, { type: "NEXT_PHASE" });
    exp = updateExperience(exp, grow);
    expect(
      exp.notifications.some((n) => n.key === "notification.harvest"),
    ).toBe(true);
    grow = reducer(grow, { type: "NEXT_PHASE" });
    exp = updateExperience(exp, grow);
    expect(
      exp.notifications.some((n) => n.key === "notification.complete"),
    ).toBe(true);
  });
  it("validiert Einstellungen und beschädigte Zustände", () => {
    const state = initialExperience(createInitialState());
    expect(validExperience(state)).toBe(true);
    expect(
      validExperience({
        ...state,
        preferences: { ...state.preferences, language: "xx" },
      }),
    ).toBe(false);
    expect(validExperience({ ...state, notifications: [{}] })).toBe(false);
  });
});
