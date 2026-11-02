import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useGrowbox } from "../state/GrowboxProvider";
import { demoTime, createInitialState } from "../simulation/engine";
import {
  DEFAULT_PREFERENCES,
  EXPERIENCE_KEY,
  initialExperience,
  updateExperience,
  type ExperienceState,
  type Preferences,
} from "./model";
import i18n from "../i18n";

export function validExperience(value: unknown): value is ExperienceState {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ExperienceState>;
  const p = data.preferences;
  if (
    data.version !== 1 ||
    !p ||
    !["de", "en", "fa"].includes(p.language) ||
    ![1, 1.15, 1.3].includes(p.fontScale) ||
    !Number.isFinite(p.speechRate) ||
    p.speechRate < 0.6 ||
    p.speechRate > 1.6 ||
    !Number.isInteger(p.waterIntervalDays) ||
    p.waterIntervalDays < 1 ||
    p.waterIntervalDays > 30
  )
    return false;
  if (
    ![
      "highContrast",
      "easyLanguage",
      "readerEnabled",
      "notificationsEnabled",
      "welcomeAnswered",
      "champReminder",
    ].every((key) => typeof p[key as keyof Preferences] === "boolean")
  )
    return false;
  const w = p.warning;
  if (
    !w ||
    ![
      w.temperatureCritical,
      w.humidityCritical,
      w.co2Limit,
      w.co2Critical,
    ].every(Number.isFinite) ||
    w.temperatureCritical < 0.5 ||
    w.temperatureCritical > 10 ||
    w.humidityCritical < 2 ||
    w.humidityCritical > 20 ||
    w.co2Limit < 500 ||
    w.co2Limit > 5000 ||
    w.co2Critical < 100 ||
    w.co2Critical > 2000 ||
    typeof w.provisionalDemo !== "boolean"
  )
    return false;
  if (
    !Number.isFinite(data.lastDemoTime) ||
    Math.abs(Number(data.lastDemoTime)) > 8.64e15 ||
    !Number.isInteger(data.nextId) ||
    Number(data.nextId) < 0 ||
    !Array.isArray(data.activeConditions) ||
    !data.activeConditions.every((x) => typeof x === "string") ||
    typeof data.lastCycle !== "string" ||
    typeof data.lastStatus !== "string" ||
    !Number.isInteger(data.lastPhase) ||
    Number(data.lastPhase) < 0 ||
    Number(data.lastPhase) > 4
  )
    return false;
  if (
    !data.assessments ||
    !["temperature", "humidity", "co2"].every((metric) => {
      const a =
        data.assessments?.[metric as keyof ExperienceState["assessments"]];
      return (
        a &&
        ["optimal", "warning", "critical", "unknown"].includes(a.level) &&
        ["low", "high", "inside", "unknown"].includes(a.direction) &&
        ["demo", "study", "unknown"].includes(a.basis) &&
        (a.range === null ||
          (Array.isArray(a.range) &&
            a.range.length === 2 &&
            a.range.every(Number.isFinite) &&
            a.range[0] <= a.range[1]))
      );
    })
  )
    return false;
  return (
    Array.isArray(data.notifications) &&
    data.notifications.length <= 100 &&
    data.notifications.every(
      (n) =>
        n &&
        Number.isInteger(n.id) &&
        typeof n.key === "string" &&
        typeof n.read === "boolean" &&
        typeof n.kind === "string" &&
        ["info", "warning", "critical"].includes(n.severity) &&
        Number.isFinite(n.demoTime) &&
        Math.abs(n.demoTime) <= 8.64e15 &&
        (!n.params ||
          (typeof n.params === "object" &&
            Object.values(n.params).every(
              (x) => typeof x === "string" || typeof x === "number",
            ))),
    )
  );
}
interface ExperienceContext {
  experience: ExperienceState;
  setPreferences: (patch: Partial<Preferences>) => void;
  markRead: (id?: number) => void;
  waterAction: (
    action:
      | "changed"
      | "refilled"
      | "low"
      | "empty"
      | "unavailable"
      | "restored"
      | "due",
  ) => void;
  welcome: (tutorial: boolean, reader: boolean) => void;
  resetDemo: () => void;
}
const Context = createContext<ExperienceContext | null>(null);
export function ExperienceProvider({ children }: { children: ReactNode }) {
  const { state, dispatch, notify } = useGrowbox();
  const [experience, setExperience] = useState<ExperienceState>(() => {
    try {
      const raw = localStorage.getItem(EXPERIENCE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validExperience(parsed)) {
          const restored = { ...parsed };
          delete (restored as ExperienceState & { water?: unknown }).water;
          return {
            ...restored,
            assessments: initialExperience(state).assessments,
            lastDemoTime: demoTime(state),
          };
        }
      }
    } catch {
      /* memory fallback */
    }
    return initialExperience(state);
  });
  useEffect(() => {
    setExperience((previous) => updateExperience(previous, state));
  }, [
    state,
    experience.preferences.warning,
    experience.preferences.waterIntervalDays,
    experience.preferences.notificationsEnabled,
  ]);
  useEffect(() => {
    try {
      localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(experience));
    } catch {
      /* memory mode remains usable */
    }
  }, [experience]);
  useEffect(() => {
    const p = experience.preferences;
    void i18n.changeLanguage(p.language);
    document.documentElement.lang = p.language;
    document.documentElement.dir = p.language === "fa" ? "rtl" : "ltr";
    document.documentElement.dataset.contrast = p.highContrast
      ? "high"
      : "normal";
    document.documentElement.dataset.easy = String(p.easyLanguage);
    document.documentElement.style.setProperty(
      "--user-font-scale",
      String(p.fontScale),
    );
  }, [experience.preferences]);
  const setPreferences = (patch: Partial<Preferences>) =>
    setExperience((previous) => ({
      ...previous,
      preferences: { ...previous.preferences, ...patch },
    }));
  const markRead = (id?: number) =>
    setExperience((previous) => ({
      ...previous,
      notifications: previous.notifications.map((n) =>
        id === undefined || n.id === id ? { ...n, read: true } : n,
      ),
    }));
  const waterAction = (
    action:
      | "changed"
      | "refilled"
      | "low"
      | "empty"
      | "unavailable"
      | "restored"
      | "due",
  ) => {
    dispatch({
      type: "WATER",
      action,
      intervalDays: experience.preferences.waterIntervalDays,
    });
    notify(
      action === "changed"
        ? "Wasserwechsel bestätigt. Erinnerung aktualisiert."
        : action === "refilled"
          ? state.water.level === null
            ? "Nachfüllen bestätigt. Sensorwert weiterhin nicht verfügbar."
            : "Wasser nachgefüllt. Füllstand aktualisiert."
          : "Tankzustand im Demo-Modell aktualisiert.",
    );
  };
  const welcome = (tutorial: boolean, reader: boolean) =>
    setPreferences({
      welcomeAnswered: true,
      readerEnabled: reader,
      champReminder: !tutorial,
    });
  const resetDemo = () =>
    setExperience((previous) => ({
      ...initialExperience(createInitialState()),
      preferences: previous.preferences,
    }));
  return (
    <Context.Provider
      value={{
        experience,
        setPreferences,
        markRead,
        waterAction,
        welcome,
        resetDemo,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useExperience() {
  const value = useContext(Context);
  if (!value) throw new Error("ExperienceProvider fehlt.");
  return value;
}
export function safePreferences(): Preferences {
  try {
    const raw = localStorage.getItem(EXPERIENCE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (validExperience(parsed)) return parsed.preferences;
    }
  } catch {
    /* fallback */
  }
  return structuredClone(DEFAULT_PREFERENCES);
}
