import { demoDeviceProfile, deviceState, validClock } from "./hardware";
import { currentLocale } from "../i18n";
import { getEntry, getProfile, PHASES } from "../data/catalog";
import type {
  AlertKey,
  AppliedSettings,
  EventLogEntry,
  PersistedAppState,
  SensorReading,
  Status,
} from "../types";

export const CONFIG = {
  tickMs: 5_000,
  temperatureTolerance: 2,
  humidityTolerance: 5,
  co2Limit: 1_500,
  maxHistory: 168,
  maxEvents: 200,
  storageKey: "mycobox.demo.v1",
} as const;
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export const percent = (state: PersistedAppState) =>
  state.cycle
    ? clamp(
        (state.cycle.elapsedHours / (state.cycle.totalDays * 24)) * 100,
        0,
        100,
      )
    : 0;
export const phaseAt = (progress: number) =>
  PHASES.reduce(
    (phase, item, index) => (progress >= item.threshold ? index : phase),
    0,
  );
export const cultureDay = (state: PersistedAppState) =>
  state.cycle
    ? Math.min(
        state.cycle.totalDays,
        Math.floor(state.cycle.elapsedHours / 24) + 1,
      )
    : 0;
export const demoTime = (state: PersistedAppState) =>
  state.cycle
    ? state.cycle.origin + state.cycle.elapsedHours * 3_600_000
    : state.reading.time;
export const formatNumber = (n: number, digits = 0) =>
  n.toLocaleString(currentLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
export const formatTime = (time: number) =>
  new Date(time).toLocaleTimeString(currentLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
export const formatDate = (time: number) =>
  new Date(time).toLocaleDateString(currentLocale(), {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
export const profileSettings = (slug: string): AppliedSettings => {
  const entry = getEntry(slug);
  const profile = getProfile(entry ?? getEntry("austernseitling")!);
  return {
    temperature: profile.temperature,
    humidity: profile.humidity,
    ...demoDeviceProfile(3),
    mode: "Automatik",
  };
};
export function validateSettings(settings: AppliedSettings): string[] {
  const errors: string[] = [];
  if (
    !Number.isFinite(settings.temperature) ||
    settings.temperature < 10 ||
    settings.temperature > 30 ||
    !Number.isInteger(settings.temperature * 2)
  )
    errors.push(
      "Temperatur: Gib einen Wert von 10 bis 30 °C in 0,5-°C-Schritten ein.",
    );
  if (
    !Number.isFinite(settings.humidity) ||
    settings.humidity < 60 ||
    settings.humidity > 95 ||
    !Number.isInteger(settings.humidity)
  )
    errors.push("Luftfeuchtigkeit: Gib eine ganze Zahl von 60 bis 95 % ein.");
  if (
    ![0, 1, 2, 3].includes(settings.circulation) ||
    ![0, 1, 2, 3].includes(settings.freshAir)
  )
    errors.push("Luftzirkulation: Wähle Aus, Niedrig, Mittel oder Hoch.");
  if (
    !Number.isInteger(settings.brightness) ||
    settings.brightness < 0 ||
    settings.brightness > 100
  )
    errors.push("Beleuchtung: Gib eine Helligkeit von 0 bis 100 Prozent ein.");
  if (!validClock(settings.lightStart) || !validClock(settings.lightEnd))
    errors.push(
      "Lichtzeit: Gib Beginn und Ende vollständig im Format HH:MM ein.",
    );
  else if (settings.lightStart === settings.lightEnd)
    errors.push(
      "Lichtzeit: Beginn und Ende müssen verschieden sein. Für dauerhaft ausgeschaltetes Licht nutze den Schalter.",
    );
  return errors;
}
export function alertsFor(reading: SensorReading): AlertKey[] {
  const alerts: AlertKey[] = [];
  if (
    Math.abs(reading.temperature - reading.targetTemperature) >
    CONFIG.temperatureTolerance
  )
    alerts.push("temperature");
  if (
    reading.humidity <
      Math.max(0, reading.targetHumidity - CONFIG.humidityTolerance) ||
    reading.humidity >
      Math.min(100, reading.targetHumidity + CONFIG.humidityTolerance)
  )
    alerts.push("humidity");
  if (reading.co2 > CONFIG.co2Limit) alerts.push("co2");
  return alerts;
}
export const ALERT_LABELS: Record<AlertKey, string> = {
  temperature: "Temperatur außerhalb des Demo-Bereichs",
  humidity: "Luftfeuchtigkeit außerhalb des Demo-Bereichs",
  co2: "CO₂ über der Demo-Hinweisgrenze von 1.500 ppm",
};
export function appendEvent(
  state: PersistedAppState,
  type: EventLogEntry["type"],
  text: string,
): PersistedAppState {
  const nextId = state.eventId + 1;
  return {
    ...state,
    eventId: nextId,
    events: [
      { id: `event-${nextId}`, time: demoTime(state), type, text },
      ...state.events,
    ].slice(0, CONFIG.maxEvents),
  };
}
function reconcileAlerts(state: PersistedAppState): PersistedAppState {
  const alerts = alertsFor(state.reading);
  let next = state;
  for (const alert of alerts)
    if (!state.alerts.includes(alert))
      next = appendEvent(
        next,
        "warning",
        `${ALERT_LABELS[alert]} (simuliert).`,
      );
  for (const alert of state.alerts)
    if (!alerts.includes(alert))
      next = appendEvent(
        next,
        "resolved",
        `${alert === "co2" ? "CO₂" : alert === "humidity" ? "Luftfeuchtigkeit" : "Temperatur"} wieder im Demo-Bereich.`,
      );
  return { ...next, alerts };
}
export function createInitialState(): PersistedAppState {
  const settings = profileSettings("austernseitling");
  const origin = Date.UTC(2026, 9, 10, 8);
  const history: SensorReading[] = Array.from({ length: 24 }, (_, i) => ({
    time: origin + (433 + i) * 3_600_000,
    hours: 433 + i,
    temperature: Math.round((20.7 + Math.sin(i * 0.6) * 0.65) * 10) / 10,
    humidity: Math.round(89 + Math.sin(i * 0.7) * 2),
    co2: Math.round(850 + Math.sin(i * 0.4) * 75),
    targetTemperature: 20,
    targetHumidity: 90,
  }));
  history[23] = { ...history[23], temperature: 21.2, humidity: 88, co2: 850 };
  const state: PersistedAppState = {
    version: 1,
    cycle: {
      slug: "austernseitling",
      status: "Läuft",
      elapsedHours: 456,
      totalDays: 28,
      origin,
    },
    settings,
    reading: history[23],
    history,
    events: [],
    seed: 20261029,
    eventId: 0,
    alerts: [],
    water: { level: 68, lastChanged: history[23].time - 3 * 86400000 },
    observation: null,
  };
  let next = appendEvent(
    state,
    "culture",
    "Austernseitling: Beispielkultur geladen.",
  );
  next = appendEvent(
    next,
    "phase",
    "Wachstum erreicht – die virtuellen Fruchtkörper entwickeln sich.",
  );
  next = appendEvent(
    next,
    "status",
    "Automatik aktiv. Alle Werte im Demo-Bereich.",
  );
  return next;
}
const toward = (value: number, target: number, step: number) =>
  value + clamp(target - value, -step, step);
export function tick(state: PersistedAppState): PersistedAppState {
  if (!state.cycle || state.cycle.status !== "Läuft") return state;
  const seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
  const noise = seed / 4294967296 - 0.5;
  const settings = state.settings;
  const devices = deviceState(state);
  const elapsedHours = Math.min(
    state.cycle.elapsedHours + 1,
    state.cycle.totalDays * 24,
  );
  const reading: SensorReading = {
    time: state.cycle.origin + elapsedHours * 3_600_000,
    hours: elapsedHours,
    temperature:
      Math.round(
        clamp(
          toward(
            state.reading.temperature,
            settings.temperature,
            (settings.mode === "Automatik" ? 0.22 : 0.08) +
              devices.circulation * 0.04,
          ) +
            noise * 0.1,
          0,
          45,
        ) * 10,
      ) / 10,
    humidity:
      Math.round(
        clamp(
          (state.reading.humidity < settings.humidity
            ? devices.pumpOn
              ? toward(
                  state.reading.humidity,
                  settings.humidity,
                  settings.mode === "Automatik" ? 2 : 0.5,
                )
              : state.reading.humidity - 0.15
            : toward(
                state.reading.humidity,
                settings.humidity,
                0.3 + devices.freshAir * 0.4,
              )) +
            noise * 0.1,
          0,
          100,
        ) * 10,
      ) / 10,
    co2: Math.round(
      clamp(
        devices.freshAir > 0
          ? toward(state.reading.co2, 850, devices.freshAir * 45) + noise * 20
          : state.reading.co2 + 95 + noise * 20,
        350,
        5000,
      ),
    ),
    targetTemperature: settings.temperature,
    targetHumidity: settings.humidity,
  };
  let next: PersistedAppState = {
    ...state,
    seed,
    water: {
      ...state.water,
      level:
        state.water.level === null
          ? null
          : Math.max(
              0,
              Math.round(
                (state.water.level - (devices.pumpOn ? 0.15 : 0.04)) * 100,
              ) / 100,
            ),
    },
    cycle: { ...state.cycle, elapsedHours },
    reading,
    history: [...state.history, reading].slice(-CONFIG.maxHistory),
  };
  const phase = phaseAt(percent(next));
  if (phase !== phaseAt(percent(state)))
    next = appendEvent(next, "phase", `${PHASES[phase].name} erreicht.`);
  if (percent(next) >= 100)
    next = appendEvent(
      { ...next, cycle: { ...next.cycle!, status: "Abgeschlossen" } },
      "status",
      "Demo-Zyklus abgeschlossen.",
    );
  return reconcileAlerts(next);
}
export function advance(
  state: PersistedAppState,
  hours: number,
): PersistedAppState {
  let next = state;
  for (let i = 0; i < hours; i++) {
    const stepped = tick(next);
    if (stepped === next) break;
    next = stepped;
  }
  return next;
}
export type Scenario = "normal" | "humidity" | "temperature" | "co2";
export type Action =
  | { type: "TICK"; hours?: number }
  | { type: "PREPARE"; slug: string }
  | { type: "APPLY"; settings: AppliedSettings }
  | { type: "STATUS"; status: Status }
  | { type: "SCENARIO"; scenario: Scenario }
  | { type: "NEXT_PHASE" }
  | { type: "RESET" }
  | {
      type: "SENSOR";
      metric: "temperature" | "humidity" | "co2";
      value: number;
    }
  | { type: "DEMO_FRUITING" }
  | {
      type: "WATER";
      action:
        | "changed"
        | "refilled"
        | "low"
        | "empty"
        | "unavailable"
        | "restored"
        | "due";
      intervalDays?: number;
    }
  | { type: "REPORT_OBSERVATION" }
  | { type: "ACK_OBSERVATION" };
export function reducer(
  state: PersistedAppState,
  action: Action,
): PersistedAppState {
  switch (action.type) {
    case "WATER": {
      const now = demoTime(state);
      const actionName = action.action;
      const level =
        actionName === "unavailable"
          ? null
          : actionName === "empty"
            ? 0
            : actionName === "low"
              ? 8
              : actionName === "restored"
                ? 68
                : actionName === "refilled" && state.water.level !== null
                  ? 100
                  : state.water.level;
      const lastChanged =
        actionName === "changed"
          ? now
          : actionName === "due"
            ? now - clamp(action.intervalDays ?? 7, 1, 30) * 86400000
            : state.water.lastChanged;
      const text = {
        changed:
          "Wasserwechsel bestätigt. Die Wartungserinnerung wurde aktualisiert; der Füllstand bleibt separat erfasst.",
        refilled:
          state.water.level === null
            ? "Nachfüllen bestätigt. Der Füllstandsensor ist nicht verfügbar; Wasserförderung bleibt gesperrt."
            : "Wasser nachgefüllt. Simulierter Tank auf 100 Prozent; Wechsel-Erinnerung bleibt bestehen.",
        low: "Demo-Szenario: Tankfüllstand niedrig.",
        empty: "Demo-Szenario: Tank leer. Wasserförderung gesperrt.",
        unavailable:
          "Demo-Szenario: Füllstandsensor nicht verfügbar. Wasserförderung gesperrt.",
        restored:
          "Demo-Szenario: Füllstandsensor wieder verfügbar; Beispielwert 68 Prozent.",
        due: "Demo-Szenario: Wasserwechsel fällig.",
      }[actionName];
      return appendEvent(
        { ...state, water: { level, lastChanged } },
        actionName === "changed" || actionName === "refilled"
          ? "status"
          : "scenario",
        text,
      );
    }
    case "REPORT_OBSERVATION":
      return appendEvent(
        {
          ...state,
          observation: { reportedAt: demoTime(state), acknowledgedAt: null },
        },
        "status",
        "Verdächtige Veränderung gemeldet. Kultur prüfen und bei unklaren Veränderungen fachlichen Rat einholen. Keine automatische Diagnose.",
      );
    case "ACK_OBSERVATION":
      if (!state.observation || state.observation.acknowledgedAt !== null)
        return state;
      return appendEvent(
        {
          ...state,
          observation: {
            ...state.observation,
            acknowledgedAt: demoTime(state),
          },
        },
        "status",
        "Beobachtung quittiert. Die Meldung bleibt dokumentiert; fortbestehende Klimahinweise bleiben aktiv.",
      );
    case "RESET":
      return createInitialState();
    case "DEMO_FRUITING": {
      if (!state.cycle || state.cycle.status !== "Läuft") return state;
      return advance(
        state,
        Math.max(
          0,
          Math.ceil(
            state.cycle.totalDays * 24 * 0.45 - state.cycle.elapsedHours,
          ),
        ),
      );
    }
    case "SENSOR": {
      if (state.cycle?.status !== "Läuft" || !Number.isFinite(action.value))
        return state;
      const limits = {
        temperature: [0, 45],
        humidity: [0, 100],
        co2: [350, 5000],
      };
      const reading = {
        ...state.reading,
        [action.metric]: clamp(
          action.value,
          limits[action.metric][0],
          limits[action.metric][1],
        ),
      };
      const history = [...state.history];
      if (history.at(-1)?.time === reading.time)
        history[history.length - 1] = reading;
      else history.push(reading);
      return reconcileAlerts({
        ...state,
        reading,
        history: history.slice(-CONFIG.maxHistory),
      });
    }
    case "TICK":
      return advance(state, action.hours ?? 1);
    case "PREPARE": {
      const entry = getEntry(action.slug);
      if (!entry) return state;
      const settings = {
        ...profileSettings(entry.slug),
        ...demoDeviceProfile(0),
      };
      const cycle = {
        slug: entry.slug,
        status: "Bereit" as const,
        elapsedHours: 0,
        totalDays: getProfile(entry).days,
        origin: demoTime(state),
      };
      const reading = {
        time: cycle.origin,
        hours: 0,
        temperature: settings.temperature,
        humidity: settings.humidity,
        co2: 850,
        targetTemperature: settings.temperature,
        targetHumidity: settings.humidity,
      };
      return appendEvent(
        {
          ...state,
          cycle,
          settings,
          reading,
          history: [],
          events: [],
          alerts: [],
          observation: null,
        },
        "culture",
        `${entry.name}: Kultur vorbereitet. Bereit für den Demo-Start.`,
      );
    }
    case "STATUS": {
      if (!state.cycle) return state;
      const allowed: Record<Status, Status[]> = {
        Bereit: ["Läuft", "Beendet"],
        Läuft: ["Pausiert", "Beendet"],
        Pausiert: ["Läuft", "Beendet"],
        Beendet: [],
        Abgeschlossen: [],
      };
      if (!allowed[state.cycle.status].includes(action.status)) return state;
      const text =
        action.status === "Läuft"
          ? state.cycle.status === "Pausiert"
            ? "Demo fortgesetzt."
            : "Demo gestartet."
          : action.status === "Pausiert"
            ? "Demo pausiert."
            : "Kultur beendet.";
      return appendEvent(
        { ...state, cycle: { ...state.cycle, status: action.status } },
        "status",
        text,
      );
    }
    case "APPLY": {
      if (validateSettings(action.settings).length || !state.cycle)
        return state;
      if (["Beendet", "Abgeschlossen"].includes(state.cycle.status))
        return state;
      const settings =
        action.settings.mode === "Automatik"
          ? {
              ...action.settings,
              ...demoDeviceProfile(phaseAt(percent(state))),
            }
          : { ...action.settings, ventilation: action.settings.freshAir > 0 };
      let next = {
        ...state,
        settings,
        reading: {
          ...state.reading,
          targetTemperature: settings.temperature,
          targetHumidity: settings.humidity,
        },
      };
      if (settings.mode !== state.settings.mode)
        next = appendEvent(
          next,
          "settings",
          `Modus geändert: ${settings.mode}.`,
        );
      return reconcileAlerts(
        appendEvent(next, "settings", "Demo-Einstellungen übernommen."),
      );
    }
    case "NEXT_PHASE": {
      if (!state.cycle || state.cycle.status !== "Läuft") return state;
      const next = PHASES[phaseAt(percent(state)) + 1]?.threshold ?? 100;
      return advance(
        state,
        Math.max(
          0,
          Math.ceil(
            (next / 100) * state.cycle.totalDays * 24 -
              state.cycle.elapsedHours,
          ),
        ),
      );
    }
    case "SCENARIO": {
      if (state.cycle?.status !== "Läuft") return state;
      const reading = { ...state.reading };
      if (action.scenario === "normal") {
        reading.temperature = state.settings.temperature;
        reading.humidity = state.settings.humidity;
        reading.co2 = 850;
      }
      if (action.scenario === "temperature")
        reading.temperature =
          state.settings.temperature + CONFIG.temperatureTolerance + 3;
      if (action.scenario === "humidity")
        reading.humidity = Math.max(
          0,
          state.settings.humidity - CONFIG.humidityTolerance - 10,
        );
      if (action.scenario === "co2") reading.co2 = 1800;
      const history = [...state.history];
      if (history.at(-1)?.time === reading.time)
        history[history.length - 1] = reading;
      else history.push(reading);
      const label = {
        normal: "Normalbetrieb",
        temperature: "Temperatur zu hoch",
        humidity: "Luftfeuchtigkeit zu niedrig",
        co2: "CO₂ erhöht",
      }[action.scenario];
      return reconcileAlerts(
        appendEvent(
          { ...state, reading, history: history.slice(-CONFIG.maxHistory) },
          "scenario",
          `Demo-Szenario aktiviert: ${label}.`,
        ),
      );
    }
  }
}
