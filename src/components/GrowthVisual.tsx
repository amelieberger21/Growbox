import { useT } from "../i18n";
import { PHASES } from "../data/catalog";
import type { MushroomEntry } from "../types";
import { MushroomArt as MushroomIllustration } from "./MushroomIllustration";

/** A future camera adapter can return a real source. This adapter only supplies local schematics. */
export interface PreviewFrame {
  kind: "schematic";
  id: string;
  entry: MushroomEntry;
  phase: number;
}
export function exampleFrame(
  entry: MushroomEntry,
  phase: number,
): PreviewFrame {
  return {
    kind: "schematic",
    id: `${entry.slug}:phase-${phase}`,
    entry,
    phase,
  };
}
export function PhaseVisual({
  frame,
  compact = false,
}: {
  frame: PreviewFrame;
  compact?: boolean;
}) {
  const tx = useT();
  const { entry, phase } = frame;
  return (
    <figure
      className={`phase-visual stage-${phase} ${compact ? "compact" : ""}`}
      data-frame={frame.id}
      aria-label={`${tx("Schematische Illustration")} · ${tx(entry.name)} · ${tx(PHASES[phase].name)}`}
    >
      <div
        className="phase-visual-scene"
        role="img"
        aria-label={`${tx(entry.name)} · ${tx(PHASES[phase].name)}`}
      >
        <svg
          viewBox="0 0 400 250"
          className="phase-substrate"
          aria-hidden="true"
        >
          <rect x="15" y="15" width="370" height="220" rx="25" fill="#e9ede0" />
          <path
            d="M55 183 Q200 158 345 183 L337 223 Q200 244 63 223Z"
            fill="#9b8a6a"
          />
          <ellipse cx="200" cy="181" rx="145" ry="19" fill="#b4a480" />
          {Array.from({ length: 35 }, (_, i) => (
            <circle
              key={i}
              cx={67 + ((i * 47) % 264)}
              cy={174 + ((i * 13) % 48)}
              r={(i % 3) + 1}
              fill="#756647"
              opacity=".55"
            />
          ))}
          {phase > 0 &&
            Array.from({ length: phase === 1 ? 11 : 20 }, (_, i) => (
              <path
                key={i}
                d={`M${80 + i * 12} 183q20 ${i % 2 ? -18 : 18} 35 24m-19-10l-9 10m15-3l12-9`}
                stroke="#f8f4e6"
                strokeWidth="2"
                fill="none"
                opacity=".85"
              />
            ))}
          {phase === 2 &&
            Array.from({ length: 7 }, (_, i) => (
              <g
                key={i}
                transform={`translate(${121 + i * 26} ${169 - (i % 3) * 5})`}
              >
                <path d="M-3 0v-17h6V0" fill="#e8ddbf" />
                {entry.illustration === "lion" ? (
                  <path
                    d="M-8-17q-2-12 8-12q12 2 8 14l-4 5l-2-7l-3 6l-3-7Z"
                    fill="#f9edcd"
                  />
                ) : (
                  <path d="M-10-17q1-17 20 0Z" fill={entry.color} />
                )}
              </g>
            ))}
          {phase === 0 && (
            <path
              d="M177 124l23-32l23 32m-23-31v65"
              stroke="#70835c"
              strokeWidth="3"
              fill="none"
            />
          )}
        </svg>
        {phase >= 3 && (
          <div
            className={`phase-fruit phase-fruit-${phase}`}
            aria-hidden="true"
          >
            <MushroomIllustration entry={entry} />
          </div>
        )}
        <span className="phase-visual-species">{tx(entry.name)}</span>
      </div>
      <figcaption>
        {tx("Schematische Illustration")} · {tx(PHASES[phase].short)}
      </figcaption>
    </figure>
  );
}
