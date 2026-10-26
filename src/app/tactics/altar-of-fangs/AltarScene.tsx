"use client";

import { useId } from "react";
import type { AltarBossId } from "@/data/altar-study";
import styles from "./altar.module.scss";

type Point = { x: number; y: number };
export function Player({
  x,
  y,
  focus = false,
  tank = false,
  faded = false,
}: Point & { focus?: boolean; tank?: boolean; faded?: boolean }) {
  const color = focus ? "#e6cd98" : "#a6baff";
  return (
    <g transform={`translate(${x} ${y})`} opacity={faded ? 0.3 : 1}>
      <ellipse cy="21" rx="22" ry="8" fill="#03060b" opacity=".7" />
      <circle
        r="23"
        fill={focus ? "#3e3423" : "#202e49"}
        stroke={color}
        strokeWidth={focus ? 2.8 : 1.8}
      />
      {tank ? (
        <path d="M-10 -10H10V1Q8 10 0 14Q-8 10 -10 1Z" fill={color} />
      ) : (
        <>
          <circle cy="-6" r="6" fill={color} />
          <path d="M-11 12V7Q-11 1 0 1Q11 1 11 7V12Z" fill={color} />
        </>
      )}
    </g>
  );
}
export function Serpent({ small = false }: { small?: boolean }) {
  return (
    <g transform={small ? "scale(.48)" : undefined}>
      <path
        d="M-31 28C-55 12-38-12-10-5C15 1 31-9 18-26C10-36-6-32-7-20"
        fill="none"
        stroke="#a4b2c5"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path d="M12-37L36-29L27-13L10-18Z" fill="#d5c3ac" stroke="#e6d7bd" />
      <circle cx="27" cy="-27" r="2.5" fill="#101621" />
    </g>
  );
}
export function Boss({
  id,
  x,
  y,
  shield = false,
}: Point & { id: AltarBossId; shield?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="31" rx="48" ry="12" fill="#020509" opacity=".6" />
      <circle r="43" fill="#272d35" stroke="#78899e" strokeWidth="1.5" />
      {id === "writhing-coil" ? (
        <Serpent />
      ) : id === "ravi" ? (
        <g fill="none" stroke="#c0caba" strokeWidth="9" strokeLinecap="round">
          <path d="M0 25Q-34 10-23-13M0 25V-18M0 25Q34 10 23-13" />
          <path
            d="M-31-21L-17-26L-12-11L-27-5ZM-9-28H9V-11H-9ZM15-25L30-20L26-5L12-12Z"
            fill="#c0caba"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g>
          <path
            d="M-24-21L-12-33L0-21L12-33L24-21L19 16L0 30L-19 16Z"
            fill="#bcaeae"
          />
          <path d="M-16-5L-5 0M16-5L5 0" stroke="#181d28" strokeWidth="5" />
          <path d="M-14 8L-9 24M14 8L9 24" stroke="#e4d9c4" strokeWidth="5" />
        </g>
      )}
      {shield && (
        <>
          <circle
            r="54"
            fill="#8ea5ff"
            fillOpacity=".06"
            stroke="#9db5ff"
            strokeWidth="3"
          />
        </>
      )}
    </g>
  );
}
export function Pile({ x, y, corpse }: Point & { corpse: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse
        rx="43"
        ry="28"
        fill="#5b5140"
        fillOpacity=".35"
        stroke="#9c917a"
        strokeWidth="1.5"
      />
      <g stroke="#c4b89b" strokeWidth="5" strokeLinecap="round">
        <path d="M-25 7L9-9M-16-9L22 10M-7 17L27-3" />
      </g>
      {corpse && (
        <g transform="translate(0 -19)">
          <path
            d="M-22 6Q-29-14-8-17H12Q30-11 21 8L10 14H-10Z"
            fill="#9d8284"
            stroke="#cfacaf"
            strokeWidth="1.5"
          />
          <path d="M-15 8L-17 21M15 8L17 21" stroke="#d7c5aa" strokeWidth="4" />
          <circle cx="-8" cy="-3" r="4" fill="#29242b" />
          <circle cx="8" cy="-3" r="4" fill="#29242b" />
        </g>
      )}
    </g>
  );
}
const pilePoints = [
  { id: "a", x: 105, y: 130 },
  { id: "b", x: 105, y: 310 },
  { id: "c", x: 490, y: 130 },
];
export default function AltarScene({
  boss,
  step,
  mistake,
  practice,
}: {
  boss: AltarBossId;
  step: number;
  mistake: boolean;
  practice: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const floor = `floor-${uid}`,
    arrow = `arrow-${uid}`;
  const phase = practice
    ? boss === "ravi"
      ? 1
      : boss === "zuljan"
        ? 1
        : 2
    : mistake && boss === "writhing-coil"
      ? 0
      : step;
  const raviMoved = phase > 0;
  const raviPos = raviMoved
    ? mistake
      ? { x: 180, y: 170 }
      : { x: 410, y: 165 }
    : { x: 300, y: 190 };
  const coilStart = [
    { x: 175, y: 115 },
    { x: 425, y: 115 },
    { x: 135, y: 285 },
    { x: 300, y: 335 },
    { x: 465, y: 285 },
  ];
  const coilEnd = [
    { x: 110, y: 80 },
    { x: 490, y: 80 },
    { x: 80, y: 330 },
    { x: 300, y: 360 },
    { x: 520, y: 330 },
  ];
  const sources = [
    { x: 95, y: 75 },
    { x: 505, y: 75 },
    { x: 95, y: 345 },
    { x: 505, y: 345 },
  ];
  const intercepts = [
    { x: 185, y: 135 },
    { x: 415, y: 135 },
    { x: 185, y: 285 },
    { x: 415, y: 285 },
  ];
  return (
    <div className={styles.sceneWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.scene}
        role="img"
        aria-label={
          boss === "ravi"
            ? "Rav’i scene: bone piles, boss and gold tank. Pile C has no corpse."
            : boss === "writhing-coil"
              ? "Death Rattle scene: players break tethers, then gather the adds."
              : "Ritual and venom clear scene: cover beams, take a planned edge clear, then leave blood pools."
        }
      >
        <defs>
          <pattern
            id={floor}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0H0V40"
              fill="none"
              stroke="#273243"
              strokeOpacity=".35"
            />
          </pattern>
          <marker
            id={arrow}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path
              d="M0 0L6 3L0 6"
              fill="none"
              stroke="#c6d3ff"
              strokeWidth="1.5"
            />
          </marker>
        </defs>
        <path
          d="M75 20H525L580 75V345L525 400H75L20 345V75Z"
          fill="#111b26"
          stroke="#354352"
          strokeWidth="2"
        />
        <path
          d="M75 20H525L580 75V345L525 400H75L20 345V75Z"
          fill={`url(#${floor})`}
        />
        <path
          d="M80 37H520L563 80V340L520 383H80L37 340V80Z"
          fill="none"
          stroke="#718191"
          strokeOpacity=".13"
        />
        {[
          { x: 45, y: 45 },
          { x: 555, y: 45 },
          { x: 45, y: 375 },
          { x: 555, y: 375 },
        ].map((p) => (
          <path
            key={p.x + "-" + p.y}
            d={`M${p.x} ${p.y - 12}l9 12-9 12-9-12Z`}
            fill="#596575"
            opacity=".35"
          />
        ))}
        {boss === "ravi" && (
          <>
            {pilePoints.map((p, i) => (
              <Pile key={p.id} {...p} corpse={i < 2} />
            ))}
            {raviMoved && !mistake && phase === 1 && (
              <path
                d="M315 204Q372 237 421 213"
                fill="none"
                stroke="#b1c5ff"
                strokeWidth="3"
                strokeDasharray="7 6"
                markerEnd={`url(#${arrow})`}
              />
            )}
            {raviMoved && mistake && (
              <circle
                cx="105"
                cy="130"
                r="63"
                fill="#d97889"
                fillOpacity=".08"
                stroke="#d97889"
                strokeDasharray="5 5"
              />
            )}
            {phase === 2 &&
              !mistake &&
              [{ x: 255, y: 287 }].map((p) => (
                <g key={p.x}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="33"
                    fill="#8fa9e4"
                    fillOpacity=".08"
                    stroke="#a9baff"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                  <Player {...p} />
                </g>
              ))}
            <Boss id={boss} {...raviPos} shield={phase === 2} />
            <Player x={raviPos.x} y={raviPos.y + 77} focus tank />
            {(phase !== 2 || mistake) && (
              <>
                {[
                  { x: 205, y: 300 },
                  { x: 265, y: 345 },
                  { x: 355, y: 345 },
                  { x: 450, y: 330 },
                ].map((p) => (
                  <Player key={p.x + "-" + p.y} {...p} />
                ))}
              </>
            )}
            {phase === 2 && !mistake && (
              <>
                <Player x={300} y={365} />
                <Player x={365} y={320} />
                <Player x={490} y={300} />
              </>
            )}
          </>
        )}
        {boss === "writhing-coil" && (
          <>
            {phase < 2 &&
              coilStart.map((p, i) => {
                const dest = phase === 1 && !mistake ? coilEnd[i] : p;
                return (
                  <g key={i}>
                    {(phase > 0 || mistake) && (
                      <path
                        d={`M300 200L${dest.x} ${dest.y}`}
                        stroke={phase === 1 && !mistake ? "#607080" : "#c38195"}
                        strokeWidth="3"
                        strokeDasharray={
                          phase === 1 && !mistake ? "3 14" : "7 4"
                        }
                        opacity={phase === 1 && !mistake ? 0.25 : 0.8}
                      />
                    )}
                    <Player {...dest} focus={i === 4} />
                  </g>
                );
              })}
            {phase < 2 && <Boss id={boss} x={300} y={200} />}
            {phase === 1 && !mistake && (
              <path
                d="M470 298L505 322"
                stroke="#b1c5ff"
                strokeWidth="3"
                markerEnd={`url(#${arrow})`}
              />
            )}
            {phase === 2 && (
              <>
                <ellipse
                  cx="300"
                  cy="170"
                  rx="83"
                  ry="63"
                  stroke="#a9baff"
                  fill="#7c94d9"
                  fillOpacity=".06"
                  strokeDasharray="5 7"
                />
                {[
                  { x: 260, y: 148 },
                  { x: 300, y: 134 },
                  { x: 340, y: 148 },
                  { x: 277, y: 190 },
                  { x: 327, y: 190 },
                ].map((p) => (
                  <g key={p.x} transform={`translate(${p.x} ${p.y})`}>
                    <Serpent small />
                  </g>
                ))}
                {[
                  { x: 230, y: 275 },
                  { x: 300, y: 305 },
                  { x: 370, y: 275 },
                  { x: 260, y: 342 },
                  { x: 340, y: 342 },
                ].map((p, i) => (
                  <Player key={p.x} {...p} focus={i === 4} />
                ))}
              </>
            )}
          </>
        )}
        {boss === "zuljan" && (
          <>
            {phase === 0 ? (
              <>
                {sources.map((p, i) => (
                  <g key={i}>
                    <path
                      d={`M${p.x} ${p.y}L${intercepts[i].x} ${intercepts[i].y}`}
                      stroke="#a7c2b8"
                      strokeWidth="3"
                    />
                    <path
                      d={`M${intercepts[i].x} ${intercepts[i].y}L300 210`}
                      stroke="#5b6977"
                      strokeDasharray="3 7"
                      opacity=".35"
                    />
                    <path
                      d={`M${p.x - 14} ${p.y + 18}V${p.y - 13}L${p.x} ${p.y - 24}L${p.x + 14} ${p.y - 13}V${p.y + 18}Z`}
                      fill="#384249"
                      stroke="#9caeaa"
                    />
                    <circle cx={p.x} cy={p.y - 3} r="5" fill="#c7d6c8" />
                  </g>
                ))}
                <Boss id={boss} x={300} y={210} />
                <Player x={300} y={280} tank />
                {intercepts.map((p, i) => (
                  <Player key={i} {...p} focus={i === 3} />
                ))}
              </>
            ) : (
              <>
                {phase === 1 && (
                  <path
                    d="M300 210L530 360"
                    fill="none"
                    stroke="#d2b98d"
                    strokeOpacity=".28"
                    strokeWidth="28"
                    strokeDasharray="5 5"
                  />
                )}
                {(phase === 2 || mistake) &&
                  (mistake
                    ? [
                        { x: 360, y: 270 },
                        { x: 375, y: 290 },
                        { x: 345, y: 295 },
                      ]
                    : [
                        { x: 445, y: 305 },
                        { x: 467, y: 327 },
                        { x: 425, y: 328 },
                      ]
                  ).map((p, i) => (
                    <ellipse
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      rx="29"
                      ry="21"
                      fill="#874c60"
                      fillOpacity=".4"
                      stroke="#bb788e"
                      strokeWidth="1.3"
                    />
                  ))}
                <Boss id={boss} x={300} y={210} />
                <Player x={300} y={280} tank />
                {[
                  { x: 165, y: 120 },
                  { x: 420, y: 110 },
                  { x: 150, y: 285 },
                ].map((p) => (
                  <Player key={p.x} {...p} />
                ))}
                <Player
                  x={mistake ? 410 : phase === 1 ? 445 : 490}
                  y={mistake ? 290 : phase === 1 ? 305 : 235}
                  focus
                />
                {phase === 2 && !mistake && (
                  <path
                    d="M458 280L480 249"
                    stroke="#b1c5ff"
                    strokeWidth="3"
                    markerEnd={`url(#${arrow})`}
                  />
                )}
              </>
            )}
          </>
        )}
      </svg>
      {boss === "ravi" &&
        !practice &&
        pilePoints.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x / 6}%`, top: `${(p.y + 52) / 4.2}%` }}
            className={`${styles.hotspot} ${styles.pileHotspot}`}
          >
            <span>{p.id.toUpperCase()}</span>
          </div>
        ))}
    </div>
  );
}
