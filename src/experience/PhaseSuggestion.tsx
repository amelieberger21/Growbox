import { useState } from "react";
import { ArrowRight, WandSparkles } from "lucide-react";
import { useGrowbox } from "../state/GrowboxProvider";
import { useT } from "../i18n";
import { PHASES } from "../data/catalog";
import { formatNumber, percent, phaseAt } from "../simulation/engine";
import { suggestedSettings } from "./model";
import { Modal, InfoNote } from "../components/ui";
import type { AppliedSettings } from "../types";
export function PhaseSuggestion({
  onLoad,
}: {
  onLoad: (settings: AppliedSettings) => void;
}) {
  const tx = useT();
  const { state, notify } = useGrowbox();
  const [open, setOpen] = useState(false);
  const proposal = suggestedSettings(state);
  const phase = PHASES[phaseAt(percent(state))];
  return (
    <div className="phase-proposal">
      <div>
        <strong>
          <WandSparkles size={16}  aria-hidden="true" />
          {tx("Vorschlag für die aktuelle Phase")}: {tx(phase.name)}
        </strong>
        <p>
          {proposal.available
            ? `${formatNumber(proposal.settings.temperature, 1)} °C · ${formatNumber(proposal.settings.humidity)} %`
            : tx(
                "Für diese Phase fehlen Kulturwerte. Der Vorschlag verwendet ausschließlich das synthetische Beispielprofil.",
              )}
        </p>
      </div>
      <button
        className="button button-outline"
        type="button"
        onClick={(event) => {
          event.currentTarget.focus();
          setOpen(true);
        }}
       aria-label={tx("Phasenprofil vorschlagen")} title={tx("Phasenprofil vorschlagen")}>
        {tx("Phasenprofil vorschlagen")}
        <ArrowRight size={15}  aria-hidden="true" />
      </button>
      {open && (
        <Modal
          title={tx("Vorschlag erst prüfen, dann übernehmen")}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button
                className="button button-outline"
                onClick={() => setOpen(false)}
              >
                {tx("Abbrechen")}
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  onLoad(proposal.settings);
                  setOpen(false);
                  notify(
                    "Phasenprofil in den Entwurf geladen. Zum Anwenden bitte übernehmen.",
                  );
                }}
              >
                {tx("Vorschlag in Entwurf laden")}
              </button>
            </>
          }
        >
          <p>
            <strong>{tx(phase.name)}</strong>
          </p>
          <p>
            {tx("Demo-Solltemperatur")}:{" "}
            {formatNumber(proposal.settings.temperature, 1)} °C
            <br />
            {tx("Demo-Sollluftfeuchtigkeit")}:{" "}
            {formatNumber(proposal.settings.humidity)} %
          </p>
          <InfoNote>
            {tx(
              proposal.available
                ? proposal.provisional
                  ? "Die vorgeschlagenen Mittelwerte beruhen auf vorläufigen Bereichen. Sie werden nur in der Demo verwendet."
                  : "Die vorgeschlagenen Mittelwerte stammen aus einem konkreten Studienprotokoll. Die Eignung für reale Hardware ist nicht bestätigt."
                : "Für diese Phase fehlen Kulturwerte. Der Vorschlag verwendet ausschließlich das synthetische Beispielprofil.",
            )}
          </InfoNote>
          <p>
            {tx(
              "Der Vorschlag ändert zunächst nur deinen Entwurf. Erst „Einstellungen übernehmen“ wendet ihn an.",
            )}
          </p>
        </Modal>
      )}
    </div>
  );
}
