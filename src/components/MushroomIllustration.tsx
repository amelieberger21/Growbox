import { useT } from "../i18n";
import { useId } from "react";
import type { MushroomEntry } from "../types";
/** Original, stylized vector art. Shapes represent library entries, not identification plates. */
export function MushroomArt({
  entry,
  className = "",
  hero = false,
}: {
  entry: MushroomEntry;
  className?: string;
  hero?: boolean;
}) {
  const tx = useT();
  const uid = useId().replaceAll(":", "");
  const color = hero ? "#b8b5a0" : entry.color;
  const cap = `url(#cap-${uid})`;
  const stem = `url(#stem-${uid})`;
  const fan = (x: number, y: number, scale: number, rotation: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
      <path d="M-9 2Q-6 51 22 84L37 81Q14 46 13 0" fill={stem} />
      <path
        d="M-89-26C-92-63-49-83-6-80C42-94 89-64 89-33C76-13 33 5 5 15C-27 11-72-3-89-26Z"
        fill={cap}
      />
      <path
        d="M-89-26Q-40-20 5 15Q44-12 89-33C64-4 31 20 5 24C-34 12-75-5-89-26Z"
        fill="#ddd5be"
      />
      {tx(
        Array.from({ length: 17 }, (_, i) => {
          const x2 = -84 + i * 10.2;
          return (
            <path
              key={i}
              d={`M5 19Q${x2 * 0.25} -1 ${x2} ${-20 - Math.abs(x2) * 0.12}`}
              stroke="#9b947f"
              strokeWidth="0.8"
              fill="none"
              opacity=".6"
            />
          );
        }),
      )}
      <path
        d="M-83-31C-76-57-42-69-8-68C30-80 69-61 78-40"
        fill="none"
        stroke="#fff"
        opacity=".22"
        strokeWidth="1.5"
      />
    </g>
  );
  const mushroom = (
    x: number,
    y: number,
    scale: number,
    rot: number,
    long = false,
  ) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path
        d={
          long
            ? "M-8-3Q-8 44-15 78Q0 84 14 78Q6 38 8-3Z"
            : "M-12-4Q-13 30-20 58Q0 66 19 57Q10 23 12-4Z"
        }
        fill={stem}
      />
      <path d="M-51-6C-48-58 46-61 52-7C33 3-31 8-51-6Z" fill={cap} />
      <ellipse cx="0" cy="-5" rx="50" ry="10" fill="#d8cdb4" />
      {tx(
        Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d={`M0 3L${-45 + i * 9} -5`}
            stroke="#afa087"
            strokeWidth=".7"
            opacity=".6"
          />
        )),
      )}
      <path d="M-51-9C-43-57 41-60 52-9Q22-1-4-1Q-31 3-51-9Z" fill={cap} />
      {tx(
        entry.speciesId === "shiitake" &&
          Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`M${Math.sin(i * 2.4) * 35} ${-16 - (i % 3) * 10}l4 -3l-1 6`}
              fill="#dfc5a0"
              opacity=".6"
            />
          )),
      )}
      <path
        d="M-40-17Q-22-42 5-42"
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity=".23"
      />
    </g>
  );
  return (
    <svg
      viewBox="0 0 320 260"
      className={`mushroom-art ${className}`}
      role="img"
      aria-label={tx(`Illustration: ${entry.name}`)}
    >
      <defs>
        <linearGradient id={`cap-${uid}`} x1=".1" y1="0" x2=".85" y2="1">
          <stop stopColor="#eee5cc" />
          <stop offset=".22" stopColor={color} />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <linearGradient id={`stem-${uid}`}>
          <stop stopColor="#c6b99f" />
          <stop offset=".45" stopColor="#f4ead3" />
          <stop offset="1" stopColor="#d6cab0" />
        </linearGradient>
        <radialGradient id={`ground-${uid}`}>
          <stop stopColor={hero ? "#0f2c22" : "#a6a18d"} stopOpacity=".3" />
          <stop
            offset="1"
            stopColor={hero ? "#0f2c22" : "#a6a18d"}
            stopOpacity="0"
          />
        </radialGradient>
      </defs>
      <ellipse
        cx="161"
        cy="231"
        rx="129"
        ry="22"
        fill={`url(#ground-${uid})`}
      />
      {tx(
        entry.illustration === "oyster" && (
          <g>
            <path
              d="M113 216Q110 234 164 239Q218 237 217 219L207 200H122Z"
              fill={hero ? "#526b48" : "#969878"}
            />
            <path
              d="M121 202Q160 187 207 202L216 215Q167 231 113 216Z"
              fill={hero ? "#77815a" : "#a9a789"}
            />
            {tx(fan(116, 163, 0.58, -32))}
            {tx(fan(210, 165, 0.58, 20))}
            {tx(fan(164, 112, 0.83, -10))}
            {tx(fan(220, 126, 0.5, 24))}
            {tx(fan(130, 83, 0.67, -19))}
            {tx(fan(190, 61, 0.69, 14))}
          </g>
        ),
      )}
      {tx(
        entry.illustration === "king" && (
          <g>
            {tx(mushroom(206, 152, 0.66, 17))}
            {tx(mushroom(128, 149, 1.25, -9))}
          </g>
        ),
      )}
      {tx(
        entry.illustration === "round" && (
          <g>
            {tx(mushroom(219, 173, 0.63, 20))}
            {tx(mushroom(104, 157, 0.8, -15))}
            {tx(mushroom(170, 121, 1.1, 7))}
          </g>
        ),
      )}
      {tx(
        entry.illustration === "cluster" && (
          <g>
            {tx(
              Array.from({ length: 8 }, (_, i) => (
                <g key={i}>
                  {tx(
                    mushroom(
                      85 + i * 21,
                      130 + Math.sin(i * 2.3) * 26,
                      0.43 + (i % 3) * 0.055,
                      -25 + i * 8,
                      true,
                    ),
                  )}
                </g>
              )),
            )}
            {tx(mushroom(154, 166, 0.64, 0, true))}
            {tx(mushroom(201, 171, 0.45, 10, true))}
          </g>
        ),
      )}
      {tx(
        entry.illustration === "enoki" && (
          <g>
            {tx(
              Array.from({ length: 13 }, (_, i) => (
                <g key={i}>
                  {tx(
                    mushroom(
                      75 + i * 14,
                      95 + Math.sin(i * 2.4) * 24,
                      0.38 + (i % 3) * 0.035,
                      -20 + i * 3.5,
                      true,
                    ),
                  )}
                </g>
              )),
            )}
            <path d="M114 172L120 229Q160 242 202 229L208 176" fill={stem} />
            {tx(
              Array.from({ length: 14 }, (_, i) => (
                <path
                  key={i}
                  d={`M${116 + i * 6.5} 177L${123 + i * 5.6} 230`}
                  stroke="#b7ad92"
                  strokeWidth="1"
                />
              )),
            )}
          </g>
        ),
      )}
      {tx(
        entry.illustration === "lion" && (
          <g>
            <path d="M139 184L132 225Q165 237 192 222L183 182" fill={stem} />
            <path
              d="M81 138C65 95 96 45 140 50C174 21 225 54 225 88C265 108 250 158 222 181C190 221 95 205 81 138Z"
              fill={cap}
            />
            {tx(
              Array.from({ length: 100 }, (_, i) => {
                const x = 88 + (i % 16) * 9;
                const y = 88 + Math.floor(i / 16) * 15 + Math.sin(i) * 6;
                return (
                  <path
                    key={i}
                    d={`M${x} ${y}q-2 14 1 26`}
                    fill="none"
                    stroke={i % 3 === 0 ? "#a99d7e" : "#fff7df"}
                    strokeWidth="2.7"
                    strokeLinecap="round"
                    opacity=".7"
                  />
                );
              }),
            )}
          </g>
        ),
      )}
      <g fill={hero ? "#c4d2a6" : "#697e51"} opacity=".65">
        <path d="M80 230Q63 217 64 205Q82 209 80 230" />
        <path d="M82 230Q94 209 105 212Q99 228 82 230" />
        <path d="M242 229Q239 215 251 208Q254 222 242 229" />
      </g>
    </svg>
  );
}
