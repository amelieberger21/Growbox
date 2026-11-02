import { getEntry, getProfile } from "../data/catalog";
import {
  CONFIG,
  createInitialState,
  validateSettings,
} from "../simulation/engine";
import type {
  AppliedSettings,
  PersistedAppState,
  SensorReading,
} from "../types";
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const readingValid = (value: unknown): value is SensorReading =>
  record(value) &&
  [
    "time",
    "hours",
    "temperature",
    "humidity",
    "co2",
    "targetTemperature",
    "targetHumidity",
  ].every((key) => finite(value[key])) &&
  Math.abs(Number(value.time)) <= 8.64e15 &&
  Number.isInteger(value.hours) &&
  Number(value.hours) >= 0 &&
  Number(value.humidity) >= 0 &&
  Number(value.humidity) <= 100 &&
  Number(value.temperature) >= 0 &&
  Number(value.temperature) <= 45 &&
  Number(value.co2) >= 350 &&
  Number(value.co2) <= 5000 &&
  Number(value.targetTemperature) >= 10 &&
  Number(value.targetTemperature) <= 30 &&
  Number(value.targetHumidity) >= 60 &&
  Number(value.targetHumidity) <= 95;
export function isValidState(value: unknown): value is PersistedAppState {
  if (
    !record(value) ||
    value.version !== 1 ||
    !record(value.settings) ||
    !readingValid(value.reading)
  )
    return false;
  const settings = value.settings;
  if (
    !finite(settings.temperature) ||
    !finite(settings.humidity) ||
    typeof settings.light !== "boolean" ||
    typeof settings.ventilation !== "boolean" ||
    !["Automatik", "Manuell"].includes(String(settings.mode))
  )
    return false;
  if (validateSettings(settings as unknown as AppliedSettings).length)
    return false;
  if (
    !record(value.water) ||
    !(
      value.water.level === null ||
      (finite(value.water.level) &&
        value.water.level >= 0 &&
        value.water.level <= 100)
    ) ||
    !finite(value.water.lastChanged) ||
    Math.abs(value.water.lastChanged) > 8.64e15
  )
    return false;
  if (
    value.observation !== null &&
    (!record(value.observation) ||
      !finite(value.observation.reportedAt) ||
      Math.abs(value.observation.reportedAt) > 8.64e15 ||
      !(
        value.observation.acknowledgedAt === null ||
        (finite(value.observation.acknowledgedAt) &&
          Math.abs(value.observation.acknowledgedAt) <= 8.64e15)
      ))
  )
    return false;
  if (
    !finite(value.seed) ||
    !Number.isInteger(value.seed) ||
    !finite(value.eventId) ||
    value.eventId < 0 ||
    !Number.isInteger(value.eventId)
  )
    return false;
  if (value.cycle !== null) {
    if (!record(value.cycle)) return false;
    const cycle = value.cycle;
    const entry =
      typeof cycle.slug === "string" ? getEntry(cycle.slug) : undefined;
    if (
      !entry ||
      !finite(cycle.origin) ||
      Math.abs(Number(cycle.origin)) > 8.64e15 ||
      !finite(cycle.elapsedHours) ||
      !Number.isInteger(cycle.elapsedHours) ||
      cycle.elapsedHours < 0 ||
      cycle.totalDays !== getProfile(entry).days ||
      cycle.elapsedHours > getProfile(entry).days * 24 ||
      !["Bereit", "Läuft", "Pausiert", "Beendet", "Abgeschlossen"].includes(
        String(cycle.status),
      )
    )
      return false;
    if (
      value.reading.hours !== cycle.elapsedHours ||
      value.reading.time !== cycle.origin + cycle.elapsedHours * 3_600_000
    )
      return false;
    if (
      cycle.status === "Abgeschlossen" &&
      cycle.elapsedHours !== getProfile(entry).days * 24
    )
      return false;
    if (cycle.status === "Bereit" && cycle.elapsedHours !== 0) return false;
  }
  if (
    !Array.isArray(value.history) ||
    value.history.length > CONFIG.maxHistory ||
    !value.history.every(readingValid)
  )
    return false;
  if (
    !Array.isArray(value.events) ||
    value.events.length > CONFIG.maxEvents ||
    !value.events.every(
      (event) =>
        record(event) &&
        typeof event.id === "string" &&
        typeof event.text === "string" &&
        finite(event.time) &&
        Math.abs(Number(event.time)) <= 8.64e15 &&
        [
          "culture",
          "settings",
          "status",
          "scenario",
          "warning",
          "resolved",
          "phase",
        ].includes(String(event.type)),
    )
  )
    return false;
  if (
    !Array.isArray(value.alerts) ||
    !value.alerts.every((item) =>
      ["temperature", "humidity", "co2"].includes(item),
    )
  )
    return false;
  return true;
}
export function loadState(storage?: Pick<Storage, "getItem">): {
  state: PersistedAppState;
  message: string;
} {
  try {
    const raw = (storage ?? window.localStorage).getItem(CONFIG.storageKey);
    if (!raw) return { state: createInitialState(), message: "" };
    const parsed: unknown = JSON.parse(raw);
    const migrated = migrateStoredState(parsed, storage ?? window.localStorage);
    if (isValidState(migrated)) return { state: migrated, message: "" };
    return {
      state: createInitialState(),
      message:
        "Gespeicherte Demo-Daten waren ungültig. Die Ausgangsdemo wurde geladen.",
    };
  } catch {
    return {
      state: createInitialState(),
      message:
        "Der lokale Speicher ist nicht verfügbar. Du kannst die Demo im Arbeitsspeicher verwenden.",
    };
  }
}

/** Additive migration retains old culture/history and imports the former maintenance record once. */
export function migrateStoredState(
  value: unknown,
  storage?: Pick<Storage, "getItem">,
): unknown {
  if (!record(value) || value.version !== 1 || !record(value.settings))
    return value;
  const old = value.settings;
  let water: unknown = value.water;
  if (water === undefined) {
    const time = readingValid(value.reading) ? value.reading.time : 0;
    water = { level: 68, lastChanged: time - 3 * 86400000 };
    try {
      const legacy: unknown = JSON.parse(
        storage?.getItem("mycobox.experience.v1") ?? "null",
      );
      if (
        record(legacy) &&
        record(legacy.water) &&
        finite(legacy.water.level) &&
        legacy.water.level >= 0 &&
        legacy.water.level <= 100 &&
        finite(legacy.water.lastChanged) &&
        Math.abs(legacy.water.lastChanged) <= 8.64e15
      )
        water = legacy.water;
    } catch {
      /* safe defaults if the separate old record is corrupt */
    }
  }
  return {
    ...value,
    water,
    observation: value.observation === undefined ? null : value.observation,
    settings: {
      circulation: 2,
      freshAir: old.ventilation === false ? 0 : 2,
      brightness: old.light === false ? 0 : 65,
      lightStart: "08:00",
      lightEnd: "20:00",
      ...old,
    },
  };
}
