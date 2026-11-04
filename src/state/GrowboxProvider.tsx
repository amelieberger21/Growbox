import { X } from "lucide-react";
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
import { CONFIG, type Action } from "../simulation/engine";
import { loadFleet, fleetReducer, FLEET_KEY, type GrowboxDevice, type FleetAction } from "./fleet";
import type { PersistedAppState } from "../types";
interface AppContext {
  state: PersistedAppState;
  boxes: GrowboxDevice[];
  selectedBox: GrowboxDevice;
  canControl: boolean;
  requestBoxSelection: (id:string) => boolean;
  pendingBoxId: string | null;
  confirmBoxSelection: () => void;
  cancelBoxSelection: () => void;
  setBoxDraftDirty: (dirty:boolean) => void;
  manageBoxes: Dispatch<FleetAction>;
  dispatch: Dispatch<Action>;
  notify: (message: string) => void;
}
const Context = createContext<AppContext | null>(null);
export function GrowboxProvider({ children }: { children: ReactNode }) {
  const tx = useT();
  const [loaded] = useState(() => loadFleet());
  const [fleet, manageBoxes] = useReducer(fleetReducer, loaded.fleet);
  const selectedBox = fleet.boxes.find(box=>box.id===fleet.selectedId)!;
  const state = selectedBox.state;
  const canControl = selectedBox.connected && selectedBox.hasData;
  const [boxDraftDirty,setBoxDraftDirty]=useState(false);
  const [pendingBoxId,setPendingBoxId]=useState<string|null>(null);
  const requestBoxSelection=(id:string)=>{if(id===fleet.selectedId)return true; if(!fleet.boxes.some(b=>b.id===id))return false; if(boxDraftDirty){setPendingBoxId(id);return false;} manageBoxes({type:'SELECT',id});return true;};
  const confirmBoxSelection=()=>{if(pendingBoxId)manageBoxes({type:'SELECT',id:pendingBoxId});setPendingBoxId(null);setBoxDraftDirty(false);};
  const dispatch:Dispatch<Action>=(action)=>manageBoxes({type:'ENGINE',action});
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
      localStorage.setItem(FLEET_KEY, JSON.stringify(fleet));
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    } catch {
      if (!storageFailed.current) {
        storageFailed.current = true;
        setMessage(
          "Speichern ist blockiert. Die Demo bleibt im Arbeitsspeicher nutzbar.",
        );
      }
    }
  }, [fleet]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const previousStatus = useRef({id:selectedBox.id,status:state.cycle?.status});
  useEffect(() => {
    if (
      state.cycle?.status === "Abgeschlossen" &&
      previousStatus.current.id===selectedBox.id && previousStatus.current.status !== "Abgeschlossen"
    )
      setMessage("Demo-Zyklus abgeschlossen.");
    previousStatus.current = {id:selectedBox.id,status:state.cycle?.status};
  }, [state.cycle?.status, selectedBox.id]);
  return (
    <Context.Provider value={{ state, dispatch, notify, boxes:fleet.boxes, selectedBox, canControl, requestBoxSelection, pendingBoxId, confirmBoxSelection, cancelBoxSelection:()=>setPendingBoxId(null), setBoxDraftDirty, manageBoxes }}>
      {tx(children)}
      <div
        className={`toast ${message ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span>{tx(message)}</span>{message&&<button type="button" className="icon-button" aria-label={tx("Hinweis schließen")} onClick={()=>{setMessage("");clearTimeout(timer.current);}} title={tx("Hinweis schließen")}><X aria-hidden="true"/></button>}
      </div>
    </Context.Provider>
  );
}
export function useGrowbox() {
  const context = useContext(Context);
  if (!context) throw new Error("GrowboxProvider fehlt.");
  return context;
}
