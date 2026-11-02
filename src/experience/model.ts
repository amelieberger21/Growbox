import { demoDeviceProfile } from "../simulation/hardware";
import type {
  AppliedSettings,
  MushroomEntry,
  PersistedAppState,
} from "../types";
import { getEntry } from "../data/catalog";
import {
  demoTime,
  phaseAt,
  percent,
  profileSettings,
} from "../simulation/engine";

export type { Language } from "../i18n/languages";
import type { Language } from "../i18n/languages";
export type Level = "optimal" | "warning" | "critical" | "unknown";
export type Metric = "temperature" | "humidity" | "co2";
export type Range = readonly [number, number];
export interface WarningConfig {
  temperatureCritical: number;
  humidityCritical: number;
  co2Limit: number;
  co2Critical: number;
  provisionalDemo: boolean;
}
export interface Preferences {
  language: Language;
  fontScale: number;
  highContrast: boolean;
  easyLanguage: boolean;
  readerEnabled: boolean;
  speechRate: number;
  notificationsEnabled: boolean;
  waterIntervalDays: number;
  warning: WarningConfig;
  welcomeAnswered: boolean;
  champReminder: boolean;
}
export interface CultivationConditions {
  temperature: Range | null;
  humidity: Range | null;
  colonizationTemperature?: Range;
  colonizationHumidity?: Range;
  verified: boolean;
  note: string;
  sourceUrl?: string;
}
export interface Assessment {
  level: Level;
  direction: "low" | "high" | "inside" | "unknown";
  range: Range | null;
  basis: "demo" | "study" | "unknown";
}
export interface NotificationItem {
  id: number;
  key: string;
  params?: Record<string, string | number>;
  demoTime: number;
  read: boolean;
  severity: "info" | "warning" | "critical";
  kind: string;
}
export interface ExperienceState {
  version: 1;
  preferences: Preferences;
  notifications: NotificationItem[];
  nextId: number;
  lastDemoTime: number;
  lastCycle: string;
  lastPhase: number;
  lastStatus: string;
  activeConditions: string[];
  assessments: Record<Metric, Assessment>;
}
export const EXPERIENCE_KEY = "mycobox.experience.v1";
export const DEFAULT_PREFERENCES: Preferences = {
  language: "de",
  fontScale: 1,
  highContrast: false,
  easyLanguage: false,
  readerEnabled: false,
  speechRate: 1,
  notificationsEnabled: true,
  waterIntervalDays: 7,
  warning: {
    temperatureCritical: 3,
    humidityCritical: 8,
    co2Limit: 1500,
    co2Critical: 500,
    provisionalDemo: true,
  },
  welcomeAnswered: false,
  champReminder: false,
};
const unknown = (): Assessment => ({
  level: "unknown",
  direction: "unknown",
  range: null,
  basis: "unknown",
});

/** Supplied ranges are provisional, not independently verified cultivation limits. */
export const CULTIVATION: Record<string, CultivationConditions> = {
  oyster: {
    temperature: [15, 22],
    humidity: [85, 95],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Stamm und Methode noch zu validieren.",
  },
  king: {
    temperature: [13, 18],
    humidity: [85, 90],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Stamm und Methode noch zu validieren.",
  },
  shiitake: {
    temperature: [15, 21],
    humidity: [80, 90],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Stamm und Methode noch zu validieren.",
  },
  champignon: {
    temperature: [16, 18],
    humidity: [85, 90],
    verified: false,
    note: "Beide Kulturformen teilen die Art Agaricus bisporus. Deckerde und Kompostsystem sind real zu prüfen.",
  },
  pink: {
    temperature: [21, 29],
    humidity: [85, 95],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Stamm und Methode noch zu validieren.",
  },
  yellow: {
    temperature: [21, 29],
    humidity: [85, 95],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Stamm und Methode noch zu validieren.",
  },
  lion: {
    temperature: [16, 20],
    humidity: [85, 95],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Stamm und Methode noch zu validieren.",
  },
  pioppino: {
    temperature: [13, 21],
    humidity: [85, 95],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Stamm und Methode noch zu validieren.",
  },
  enoki: {
    temperature: [7, 15],
    humidity: [80, 90],
    verified: false,
    note: "Vorläufige Fruchtungswerte. Der Prototyp erlaubt Sollwerte erst ab 10 °C; ein Vorschlag wird entsprechend begrenzt.",
  },
  nameko: {
    temperature: [12, 16],
    humidity: [88, 95],
    verified: false,
    note: "Nameko und Goldkäppchen teilen dasselbe Profil. Die zusätzlich genannten 16–21 °C / 85–95 % für Goldkäppchen widersprechen der gemeinsamen Artzuordnung und werden nicht als eigene Artwerte übernommen. Datenprüfung erforderlich.",
    sourceUrl:
      "https://www.bzfe.de/presse/pressemeldungen-archiv/bissfester-pilz-mit-nussigem-aroma",
  },
  shimeji: {
    temperature: [13, 15],
    humidity: [90, 95],
    colonizationTemperature: [21, 25],
    colonizationHumidity: [75, 75],
    verified: true,
    note: "Studienbezogene Werte für Hypsizygus marmoreus. Die Studie beschreibt ein bestimmtes Kulturverfahren; keine universellen Grenzwerte.",
    sourceUrl: "https://www.mdpi.com/2309-608X/11/12/842",
  },
  almond: {
    temperature: [24, 28],
    humidity: [75, 85],
    verified: false,
    note: "Vorläufige Bereiche aus dem Erweiterungsauftrag. Kompost und Deckerde sowie reale Box-Eignung noch prüfen.",
  },
  stock: {
    temperature: null,
    humidity: null,
    verified: false,
    note: "Datenprüfung erforderlich. Keine verlässlichen Temperatur- oder Feuchtigkeitsbereiche hinterlegt.",
  },
};
export function phaseRange(
  entry: MushroomEntry,
  phase: number,
  metric: Metric,
): { range: Range | null; verified: boolean } {
  const profile = CULTIVATION[entry.speciesId];
  if (!profile || metric === "co2" || phase === 0)
    return { range: null, verified: false };
  if (phase === 1)
    return {
      range:
        (metric === "temperature"
          ? profile.colonizationTemperature
          : profile.colonizationHumidity) ?? null,
      verified: profile.verified,
    };
  return { range: profile[metric], verified: profile.verified };
}
export function evaluateCondition(input: {
  entry: MushroomEntry;
  phase: number;
  metric: Metric;
  value: number;
  range: Range | null;
  verified: boolean;
  config: WarningConfig;
  previous?: Assessment;
}): Assessment {
  const { metric, value, config, previous } = input;
  const range: Range | null =
    metric === "co2" ? [350, config.co2Limit] : input.range;
  const basis = metric === "co2" || !input.verified ? "demo" : "study";
  if (
    !range ||
    !Number.isFinite(value) ||
    (!input.verified && !config.provisionalDemo && metric !== "co2")
  )
    return unknown();
  const [low, high] = range;
  if (!Number.isFinite(low) || !Number.isFinite(high) || low > high)
    return unknown();
  const margin =
    metric === "temperature" ? 0.3 : metric === "humidity" ? 1 : 40;
  const threshold =
    metric === "temperature"
      ? config.temperatureCritical
      : metric === "humidity"
        ? config.humidityCritical
        : config.co2Critical;
  const direction = value < low ? "low" : value > high ? "high" : "inside";
  const distance = value < low ? low - value : value > high ? value - high : 0;
  let level: Level =
    distance === 0 ? "optimal" : distance >= threshold ? "critical" : "warning";
  // Recovery hysteresis: a previous warning must move clearly inside; a critical must recover below its threshold by a margin.
  if (
    previous?.range?.[0] === low &&
    previous.range[1] === high &&
    previous.direction !== "unknown"
  ) {
    if (
      previous.level === "critical" &&
      previous.direction !== "inside" &&
      distance > Math.max(0, threshold - margin)
    )
      level = "critical";
    else if (
      (previous.level === "warning" || previous.level === "critical") &&
      level === "optimal" &&
      (value < low + Math.min(margin, (high - low) / 3) ||
        value > high - Math.min(margin, (high - low) / 3))
    )
      level = "warning";
  }
  return {
    level,
    direction:
      level !== "optimal" && direction === "inside"
        ? (previous?.direction ?? "inside")
        : direction,
    range,
    basis,
  };
}
export function assessState(
  grow: PersistedAppState,
  config: WarningConfig,
  previous?: ExperienceState["assessments"],
): ExperienceState["assessments"] {
  const entry = grow.cycle ? getEntry(grow.cycle.slug) : undefined;
  if (!entry)
    return { temperature: unknown(), humidity: unknown(), co2: unknown() };
  const phase = phaseAt(percent(grow));
  const assess = (metric: Metric) =>
    evaluateCondition({
      entry,
      phase,
      metric,
      value: grow.reading[metric],
      ...phaseRange(entry, phase, metric),
      config,
      previous: previous?.[metric],
    });
  return {
    temperature: assess("temperature"),
    humidity: assess("humidity"),
    co2: assess("co2"),
  };
}
export function suggestedSettings(grow: PersistedAppState): {
  settings: AppliedSettings;
  provisional: boolean;
  available: boolean;
} {
  const slug = grow.cycle?.slug ?? "austernseitling";
  const entry = getEntry(slug)!;
  const phase = phaseAt(percent(grow));
  const temperature = phaseRange(entry, phase, "temperature");
  const humidity = phaseRange(entry, phase, "humidity");
  const base = { ...profileSettings(slug), ...demoDeviceProfile(phase) };
  return {
    settings: {
      ...base,
      temperature: temperature.range
        ? Math.max(
            10,
            Math.min(
              30,
              Math.round(
                ((temperature.range[0] + temperature.range[1]) / 2) * 2,
              ) / 2,
            ),
          )
        : base.temperature,
      humidity: humidity.range
        ? Math.max(
            60,
            Math.min(
              95,
              Math.round((humidity.range[0] + humidity.range[1]) / 2),
            ),
          )
        : base.humidity,
    },
    provisional: !temperature.verified || !humidity.verified,
    available: !!temperature.range && !!humidity.range,
  };
}
export function initialExperience(grow: PersistedAppState): ExperienceState {
  const now = demoTime(grow);
  return {
    version: 1,
    preferences: structuredClone(DEFAULT_PREFERENCES),
    notifications: [],
    nextId: 0,
    lastDemoTime: now,
    lastCycle: grow.cycle ? `${grow.cycle.slug}:${grow.cycle.origin}` : "",
    lastPhase: phaseAt(percent(grow)),
    lastStatus: grow.cycle?.status ?? "",
    activeConditions: [],
    assessments: assessState(grow, DEFAULT_PREFERENCES.warning),
  };
}
function addNotification(
  state: ExperienceState,
  grow: PersistedAppState,
  key: string,
  kind: string,
  severity: NotificationItem["severity"],
  params?: NotificationItem["params"],
): ExperienceState {
  if (!state.preferences.notificationsEnabled) return state;
  const nextId = state.nextId + 1;
  return {
    ...state,
    nextId,
    notifications: [
      {
        id: nextId,
        key,
        kind,
        severity,
        params,
        demoTime: demoTime(grow),
        read: false,
      },
      ...state.notifications,
    ].slice(0, 100),
  };
}
export function updateExperience(
  state: ExperienceState,
  grow: PersistedAppState,
): ExperienceState {
  const now = demoTime(grow);
  const cycleKey = grow.cycle ? `${grow.cycle.slug}:${grow.cycle.origin}` : "";
  const sameCycle = state.lastCycle === cycleKey;
  let next: ExperienceState = {
    ...state,
    lastDemoTime: now,
    lastCycle: cycleKey,
    lastPhase: phaseAt(percent(grow)),
    lastStatus: grow.cycle?.status ?? "",
    assessments: assessState(
      grow,
      state.preferences.warning,
      sameCycle ? state.assessments : undefined,
    ),
  };
  const conditions: string[] = [];
  for (const metric of ["temperature", "humidity", "co2"] as const) {
    const reading = next.assessments[metric];
    if (
      sameCycle &&
      reading.level === "optimal" &&
      state.activeConditions.some((kind) => kind.startsWith(`${metric}:`))
    ) {
      next = addNotification(
        next,
        grow,
        "notification.recovered",
        `${metric}:recovered`,
        "info",
        { metric },
      );
    }
    if (reading.level === "warning" || reading.level === "critical") {
      const kind = `${metric}:${reading.direction}:${reading.level}`;
      conditions.push(kind);
      if (!state.activeConditions.includes(kind))
        next = addNotification(
          next,
          grow,
          "notification.condition",
          kind,
          reading.level,
          {
            metric,
            direction: reading.direction,
            level: reading.level,
            value: grow.reading[metric],
          },
        );
    }
  }
  if (
    grow.water.level !== null &&
    grow.water.level > 0 &&
    grow.water.level <= 20
  ) {
    conditions.push("water-low");
    if (!state.activeConditions.includes("water-low"))
      next = addNotification(
        next,
        grow,
        "notification.waterLow",
        "water-low",
        grow.water.level <= 10 ? "critical" : "warning",
      );
  }
  if (grow.water.level === null) {
    conditions.push("water-unavailable");
    if (!state.activeConditions.includes("water-unavailable"))
      next = addNotification(
        next,
        grow,
        "notification.waterUnavailable",
        "water-unavailable",
        "warning",
      );
  } else if (grow.water.level === 0) {
    conditions.push("water-empty");
    if (!state.activeConditions.includes("water-empty"))
      next = addNotification(
        next,
        grow,
        "notification.waterEmpty",
        "water-empty",
        "critical",
      );
  }
  if (
    now - grow.water.lastChanged >=
    state.preferences.waterIntervalDays * 86400000
  ) {
    conditions.push("water-change");
    if (!state.activeConditions.includes("water-change"))
      next = addNotification(
        next,
        grow,
        "notification.waterChange",
        "water-change",
        "warning",
      );
  }
  if (sameCycle && next.lastPhase !== state.lastPhase)
    next = addNotification(
      next,
      grow,
      next.lastPhase === 4 ? "notification.harvest" : "notification.phase",
      "phase",
      "info",
      { phase: next.lastPhase },
    );
  if (
    sameCycle &&
    next.lastStatus === "Abgeschlossen" &&
    state.lastStatus !== "Abgeschlossen"
  )
    next = addNotification(
      next,
      grow,
      "notification.complete",
      "complete",
      "info",
    );
  return { ...next, activeConditions: conditions };
}
