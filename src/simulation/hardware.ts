import type {
  AppliedSettings,
  FanSpeed,
  PersistedAppState,
  WaterState,
} from "../types";
import { PHASES } from "../data/catalog";

/** UI and engine use the same deliberately simple demo rules. */
export const HARDWARE_DEMO = {
  tankLow: 20,
  tankEmpty: 0,
  freshAirBoostCo2: 1500,
} as const;
export const FAN_LABELS = ["Aus", "Niedrig", "Mittel", "Hoch"] as const;
export const TANK_LABELS = {
  sufficient: "Ausreichend",
  low: "Niedrig",
  empty: "Leer",
  unavailable: "Sensor nicht verfügbar",
} as const;
export function tankStatus(water: WaterState): keyof typeof TANK_LABELS {
  return water.level === null
    ? "unavailable"
    : water.level <= HARDWARE_DEMO.tankEmpty
      ? "empty"
      : water.level <= HARDWARE_DEMO.tankLow
        ? "low"
        : "sufficient";
}
export function validClock(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
export function lightWindow(hour: number, start: string, end: string) {
  if (!validClock(start) || !validClock(end) || start === end) return false;
  const minutes = (value: string) =>
    Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const from = minutes(start),
    to = minutes(end),
    now = (((hour * 60) % 1440) + 1440) % 1440;
  return from < to ? now >= from && now < to : now >= from || now < to;
}
export function demoDeviceProfile(
  phase: number,
): Pick<
  AppliedSettings,
  | "light"
  | "ventilation"
  | "circulation"
  | "freshAir"
  | "brightness"
  | "lightStart"
  | "lightEnd"
> {
  return {
    light: phase >= 2,
    ventilation: true,
    circulation: phase < 2 ? 1 : 2,
    freshAir: phase < 2 ? 1 : 2,
    brightness: phase < 2 ? 0 : phase === 2 ? 40 : 65,
    lightStart: "08:00",
    lightEnd: "20:00",
  };
}
export function deviceState(state: PersistedAppState) {
  const progress = state.cycle
    ? (state.cycle.elapsedHours / (state.cycle.totalDays * 24)) * 100
    : 0;
  const phase = PHASES.reduce(
    (n, p, i) => (progress >= p.threshold ? i : n),
    0,
  );
  const automatic = state.settings.mode === "Automatik";
  const control = automatic ? demoDeviceProfile(phase) : state.settings;
  const running = state.cycle?.status === "Läuft";
  const time = state.cycle
    ? state.cycle.origin + state.cycle.elapsedHours * 3600000
    : state.reading.time;
  const date = new Date(time);
  const lightOn =
    running &&
    control.light &&
    control.brightness > 0 &&
    lightWindow(
      date.getUTCHours() + date.getUTCMinutes() / 60,
      control.lightStart,
      control.lightEnd,
    );
  const circulation: FanSpeed = running ? control.circulation : 0;
  const freshAir: FanSpeed = running
    ? automatic && state.reading.co2 > HARDWARE_DEMO.freshAirBoostCo2
      ? 3
      : control.freshAir
    : 0;
  const water = tankStatus(state.water);
  const pumpBlocked = water === "empty" || water === "unavailable";
  const pumpOn =
    running && !pumpBlocked && state.reading.humidity < state.settings.humidity;
  return {
    automatic,
    running,
    phase,
    circulation,
    freshAir,
    lightOn,
    brightness: lightOn ? control.brightness : 0,
    lightStart: control.lightStart,
    lightEnd: control.lightEnd,
    pumpOn,
    pumpBlocked,
    water,
    uv: { status: "not-connected" as const, sensor: null },
  };
}
