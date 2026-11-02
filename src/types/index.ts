export type Difficulty = "Einfach" | "Mittel" | "Anspruchsvoll";
export type Verification = "verified" | "demo" | "unverified";
export type Status =
  | "Bereit"
  | "Läuft"
  | "Pausiert"
  | "Beendet"
  | "Abgeschlossen";
export interface DemoProfile {
  id: string;
  difficulty: Difficulty;
  temperature: number;
  humidity: number;
  days: number;
  verification: "demo";
}
export interface SpeciesProfile {
  id: string;
  scientificName: string;
  substrate: string;
  light: string;
  air: string;
  care: string;
  harvest: string;
  verification: Verification;
  sources: string[];
}
export type IllustrationKind =
  | "oyster"
  | "king"
  | "round"
  | "lion"
  | "cluster"
  | "enoki";
export interface MushroomEntry {
  slug: string;
  name: string;
  speciesId: string;
  demoId: string;
  synonyms: string[];
  short: string;
  description: string;
  color: string;
  background: string;
  illustration: IllustrationKind;
}
export interface GrowthPhase {
  name: string;
  short: string;
  threshold: number;
  description: string;
}
export interface AppliedSettings {
  temperature: number;
  humidity: number;
  light: boolean;
  ventilation: boolean;
  circulation: FanSpeed;
  freshAir: FanSpeed;
  brightness: number;
  lightStart: string;
  lightEnd: string;
  mode: "Automatik" | "Manuell";
}
export type FanSpeed = 0 | 1 | 2 | 3;
export interface WaterState {
  level: number | null;
  lastChanged: number;
}
export interface GrowCycle {
  slug: string;
  status: Status;
  elapsedHours: number;
  totalDays: number;
  origin: number;
}
export interface SensorReading {
  time: number;
  hours: number;
  temperature: number;
  humidity: number;
  co2: number;
  targetTemperature: number;
  targetHumidity: number;
}
export interface EventLogEntry {
  id: string;
  time: number;
  type:
    | "culture"
    | "settings"
    | "status"
    | "scenario"
    | "warning"
    | "resolved"
    | "phase";
  text: string;
}
export type AlertKey = "temperature" | "humidity" | "co2";
export interface PersistedAppState {
  version: 1;
  cycle: GrowCycle | null;
  settings: AppliedSettings;
  reading: SensorReading;
  history: SensorReading[];
  events: EventLogEntry[];
  seed: number;
  eventId: number;
  alerts: AlertKey[];
  water: WaterState;
  observation: { reportedAt: number; acknowledgedAt: number | null } | null;
}
