import { useT } from "../i18n";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { CONFIG, reducer, type Action } from "../simulation/engine";
import { loadState } from "./persistence";
import type { PersistedAppState } from "../types";
interface AppContext {
  state: PersistedAppState;
  dispatch: Dispatch<Action>;
  notify: (message: string) => void;
}
const Context = createContext<AppContext | null>(null);
export function GrowboxProvider({ children }: { children: ReactNode }) {
  const tx = useT();
  const [loaded] = useState(() => loadState());
  const [state, dispatch] = useReducer(reducer, loaded.state);
  const [message, setMessage] = useState(loaded.message);
  const storageFailed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = (text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 6500);
  };
  useEffect(() => {
    const interval = setInterval(
      () => dispatch({ type: "TICK" }),
      CONFIG.tickMs,
    );
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    } catch {
      if (!storageFailed.current) {
        storageFailed.current = true;
        setMessage(
          "Speichern ist blockiert. Die Demo bleibt im Arbeitsspeicher nutzbar.",
        );
      }
    }
  }, [state]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const previousStatus = useRef(state.cycle?.status);
  useEffect(() => {
    if (
      state.cycle?.status === "Abgeschlossen" &&
      previousStatus.current !== "Abgeschlossen"
    )
      setMessage("Demo-Zyklus abgeschlossen.");
    previousStatus.current = state.cycle?.status;
  }, [state.cycle?.status]);
  return (
    <Context.Provider value={{ state, dispatch, notify }}>
      {tx(children)}
      <div
        className={`toast ${message ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {tx(message)}
      </div>
    </Context.Provider>
  );
}
export function useGrowbox() {
  const context = useContext(Context);
  if (!context) throw new Error("GrowboxProvider fehlt.");
  return context;
}
