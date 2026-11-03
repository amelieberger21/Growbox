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
          <rect width="400" height="250" fill="#eef2eb" />
          <ellipse cx="205" cy="231" rx="171" ry="9" fill="#cbd5cb" />
          {/* Front elevation of the prototype, with its top screen and side tank. */}
          <rect x="243" y="48" width="15" height="20" fill="#394641" />
          <rect x="224" y="65" width="53" height="5" rx="2" fill="#394641" />
          <rect x="196" y="12" width="110" height="41" rx="4" fill="#26332e" />
          <rect x="202" y="17" width="98" height="31" rx="2" fill="#465952" />
          <path d="M32 76L54 68H355L370 81V225H32Z" fill="#26332e" />
          <rect x="40" y="83" width="320" height="132" rx="3" fill="#d9e4da" />
          <path d="M43 203H357M43 209H357" stroke="#6e8275" strokeWidth="2" />
          <rect x="75" y="90" width="164" height="5" rx="2" fill="#fff9db" />
          <rect x="300" y="84" width="7" height="130" fill="#40574c" />
          <path d="M332 151V119Q332 108 321 108H286" fill="none" stroke="#63796e" strokeWidth="6" />
          <rect x="315" y="143" width="36" height="63" rx="4" fill="#b8d6d1" stroke="#69877c" />
          <path d="M318 178H348V202H318Z" fill="#73b5c7" />
          <rect x="355" y="125" width="7" height="48" rx="3" fill="#14251e" />
          <path d="M52 181H286L279 211H60Z" fill="#a5c5b7" stroke="#607f70" />
          <path d="M57 183H281L276 207H63Z" fill="#8c7658" />
          <path d="M52 181L66 174H277L286 181Z" fill="#b6a27c" />
          {Array.from({ length: 35 }, (_, i) => (
            <circle
              key={i}
              cx={67 + ((i * 47) % 204)}
              cy={181 + ((i * 13) % 22)}
              r={(i % 3) + 1}
              fill="#756647"
              opacity=".55"
            />
          ))}
          {phase > 0 &&
            Array.from({ length: phase === 1 ? 10 : 16 }, (_, i) => (
              <path
                key={i}
                d={`M${67 + i * 12} 186q12 ${i % 2 ? -8 : 8} 22 15m-10-7l-5 6`}
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
                transform={`translate(${76 + i * 31} ${178 - (i % 3) * 4})`}
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
              d="M151 145l16-21l16 21m-16-20v43"
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
