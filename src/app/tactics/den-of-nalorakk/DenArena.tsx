"use client";
import { useId } from "react";
import type { DenBossId, Vec } from "@/data/den-guide";
import { denGeometry, type getDenState } from "@/data/den-playback";
import styles from "./den.module.scss";
type World = ReturnType<typeof getDenState>;
function Person({
  x,
  y,
  tank = false,
  focus = false,
}: Vec & { tank?: boolean; focus?: boolean }) {
  const color = focus ? "#e6cd98" : "#adc1ff";
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="18" rx="20" ry="6" fill="#02060c" opacity=".8" />
      <circle
        r="18"
        fill={focus ? "#3e3423" : "#1c2c46"}
        stroke={color}
        strokeWidth="2"
      />
      {tank ? (
        <path d="M-8-9H8V0Q7 8 0 12Q-7 8-8 0Z" fill={color} />
      ) : (
        <>
          <circle cy="-5" r="5" fill={color} />
          <path d="M-9 10V5Q0-3 9 5V10Z" fill={color} />
        </>
      )}
    </g>
  );
}
function Bear({ x, y, small = false }: Vec & { small?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${small ? 0.55 : 1})`}>
      <circle r="37" fill="#27313c" stroke="#899db4" strokeWidth="2" />
      <path
        d="M-24-15Q-40-40-17-33L-10-25Q0-30 10-25L17-33Q40-40 24-15L24 12Q16 34 0 32Q-16 34-24 12Z"
        fill="#a7a5a5"
      />
      <ellipse cy="13" rx="14" ry="11" fill="#d6c5b1" />
      <path d="M-6 5H6L3 13H-3Z" fill="#252735" />
      <path d="M-15-6L-6-3M15-6L6-3" stroke="#1c2532" strokeWidth="4" />
    </g>
  );
}
function Crystal({ x, y, small = false }: Vec & { small?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${small ? 0.6 : 1})`}>
      <path
        d="M0-40L28-10L19 28L0 40L-24 22L-30-13Z"
        fill="#638096"
        stroke="#c1d5e8"
        strokeWidth="2"
      />
      <path
        d="M0-40V40M-30-13L0 2L28-10M0 2L19 28"
        fill="none"
        stroke="#b3c8dc"
        strokeWidth="2"
      />
      <path d="M-10-4L-3 0M10-4L3 0" stroke="#17273d" strokeWidth="4" />
    </g>
  );
}
const pos = (p: Vec, offset = 0) => ({
  left: `${p.x / 6}%`,
  top: `${(p.y + offset) / 4.2}%`,
});
export default function DenArena({
  boss,
  world,
}: {
  boss: DenBossId;
  world: World;
}) {
  const uid = useId().replace(/:/g, ""),
    floor = `den-floor-${uid}`;
  const { time: t } = world;
  const winterStack = world.tempest && world.inDrift;
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Encounter schematic. Player numbers match the party cards. Positions and distances are illustrative."
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
              stroke="#30405a"
              strokeOpacity=".28"
            />
          </pattern>
        </defs>
        <path
          d="M75 20H525L580 75V345L525 400H75L20 345V75Z"
          fill="#111c29"
          stroke="#43536a"
          strokeWidth="2"
        />
        <path
          d="M75 20H525L580 75V345L525 400H75L20 345V75Z"
          fill={`url(#${floor})`}
        />
        {boss === "hoardmonger" && (
          <>
            {[
              { x: 100, y: 80 },
              { x: 500, y: 80 },
              { x: 500, y: 340 },
            ].map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y})`}>
                <ellipse
                  rx="36"
                  ry="24"
                  fill={i === 0 && t >= 5 ? "#39442e" : "#33313a"}
                  stroke={i === 0 ? "#bcb28d" : "#697c99"}
                  strokeWidth="1.5"
                />
                {i === 0 ? (
                  <path d="M-18 8Q-28-9-9-14L14-8Q30 9 9 15Z" fill="#a28484" />
                ) : i === 1 ? (
                  <path
                    d="M-20-10L20 10M-20 10L20-10"
                    stroke="#c9c1b1"
                    strokeWidth="6"
                  />
                ) : (
                  <>
                    <path d="M0 0V16" stroke="#c7c1b1" strokeWidth="7" />
                    <path d="M-20 0Q0-33 20 0Z" fill="#96a08d" />
                  </>
                )}
              </g>
            ))}
            {t < 6 && (
              <path
                d={`M${world.bossAt.x} ${world.bossAt.y}L100 80`}
                className={styles.connector}
                stroke="#d9c995"
                strokeDasharray="5 6"
              />
            )}
            {world.mushroom && (
              <g
                transform={`translate(${world.mushroom.x} ${world.mushroom.y})`}
              >
                <circle
                  r={24 + world.mushroom.growth * 12}
                  fill="#a8ba89"
                  fillOpacity=".1"
                  stroke="#bdcf9d"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <path d="M0-2V16" stroke="#c5d1b5" strokeWidth="7" />
                <path
                  d="M-20-2Q0-33 20-2Z"
                  fill="#91a276"
                  stroke="#c8d5ae"
                  strokeWidth="1.5"
                />
              </g>
            )}
            {world.frontal && (
              <path
                d="M175 130L365 380L500 230Z"
                fill="#b47a8c"
                fillOpacity=".2"
                stroke="#c08a9c"
                strokeDasharray="6 6"
              />
            )}
            {t >= 23 && t < 28 && (
              <circle
                cx={world.bossAt.x}
                cy={world.bossAt.y}
                r={55 + (t - 23) * 16}
                fill="none"
                stroke="#b5c6e8"
                strokeOpacity={Math.max(0.1, 1 - (t - 23) / 5)}
                strokeWidth="3"
              />
            )}
          </>
        )}
        {boss === "sentinel-of-winter" && (
          <>
            {(world.bait || world.squalls) && (
              <g>
                <ellipse
                  cx="435"
                  cy="145"
                  rx="80"
                  ry="67"
                  fill="#a6badc"
                  fillOpacity={world.bait ? 0.05 : 0.14}
                  stroke="#9dafcf"
                  strokeDasharray="5 7"
                />
                {world.squalls && (
                  <g
                    transform={`translate(${435 + Math.sin(t * 0.4) * 12} ${145 + Math.cos(t * 0.5) * 12}) rotate(${t * 35})`}
                  >
                    <path
                      d="M-31 0C-30-36 36-36 30 0C26 25-25 25-20 0C-15-16 17-14 13 0C10 10-8 10-5 0"
                      fill="none"
                      stroke="#b9cee6"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            )}
            {world.spikeImpacts &&
              denGeometry.adds.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="32"
                  fill="#bd829c"
                  fillOpacity=".15"
                  stroke="#cc96ad"
                  strokeDasharray="5 5"
                />
              ))}
            {world.adds
              .filter((a) => a.dead)
              .map((a) => (
                <ellipse
                  key={a.id}
                  cx={a.x}
                  cy={a.y + 10}
                  rx="66"
                  ry="61"
                  fill="#b9d0e3"
                  fillOpacity=".14"
                  stroke="#b9d0e3"
                  strokeDasharray="4 6"
                />
              ))}
            {world.tempest && (
              <>
                <path
                  d="M75 20H525L580 75V345L525 400H75L20 345V75Z"
                  fill="#6483b0"
                  fillOpacity=".12"
                />
                <circle
                  cx={world.bossAt.x}
                  cy={world.bossAt.y}
                  r="146"
                  fill="#111c29"
                  fillOpacity=".55"
                  stroke="#87a9d1"
                  strokeDasharray="6 8"
                />
                <ellipse
                  cx="240"
                  cy="250"
                  rx="66"
                  ry="61"
                  fill="#c6daee"
                  fillOpacity=".18"
                  stroke="#c6daee"
                />
                {[0, 1, 2].map((i) => (
                  <path
                    key={i}
                    d={`M${45 + i * 42} 335l-12 12 12 12`}
                    stroke="#8eaccd"
                    fill="none"
                    strokeWidth="2"
                  />
                ))}
              </>
            )}
            {world.adds
              .filter((a) => a.visible)
              .map((a) => (
                <g key={a.id}>
                  <Crystal x={a.x} y={a.y} small />
                  {a.controlled && (
                    <>
                      <circle
                        cx={a.x}
                        cy={a.y}
                        r="31"
                        fill="none"
                        stroke="#c9c5f1"
                        strokeDasharray="3 5"
                      />
                      <path
                        d={`M${a.x - 10} ${a.y - 7}l20 20m0-20l-20 20`}
                        stroke="#d2d0ed"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </g>
              ))}
            {world.rime && (
              <g>
                <circle
                  cx={world.rime.x}
                  cy={world.rime.y}
                  r="30"
                  fill={world.rime.covered ? "#8eaa9b" : "#a5bfff"}
                  fillOpacity=".12"
                  stroke={world.rime.covered ? "#afcbbb" : "#b5c8ff"}
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <path
                  d={`M${world.rime.x} ${world.rime.y - 10}l8 10-8 10-8-10Z`}
                  fill="#c6d6f4"
                />
              </g>
            )}
          </>
        )}
        {boss === "nalorakk" && (
          <>
            {world.shelter && (
              <>
                <path
                  d="M400 300L305 400H495Z"
                  fill="#93aed8"
                  fillOpacity=".15"
                />
                <path
                  d="M335 310Q400 275 465 310"
                  fill="none"
                  stroke="#c0d6fb"
                  strokeWidth="7"
                />
                <path
                  d="M400 218V280"
                  stroke="#bbc8e1"
                  strokeWidth="6"
                  strokeDasharray="5 5"
                />
              </>
            )}
            {world.slam && (
              <circle
                cx="400"
                cy="310"
                r="43"
                fill="#a7bfff"
                fillOpacity=".12"
                stroke="#c0d2ff"
                strokeWidth="2"
                strokeDasharray="6 5"
              />
            )}
            {t >= 4 &&
              denGeometry.echoDrops.map((p, i) => (
                <g key={i} opacity=".25">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="33"
                    fill="#98a4ca"
                    fillOpacity=".1"
                    stroke="#8598c4"
                    strokeDasharray="5 7"
                  />
                </g>
              ))}
            {world.intercepting &&
              denGeometry.echoDrops.map((p, i) => (
                <path
                  key={i}
                  d={`M${p.x} ${p.y}L300 210`}
                  stroke="#ac9ebf"
                  strokeDasharray="5 7"
                  className={styles.connector}
                />
              ))}
            {world.echoes.map((p, i) => (
              <g key={i} opacity={p.intercepted ? 0.3 : 0.85}>
                <Bear {...p} small />
                {p.intercepted && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="25"
                    fill="none"
                    stroke="#bed2af"
                    strokeWidth="2"
                  />
                )}
              </g>
            ))}
          </>
        )}
        {boss === "sentinel-of-winter" ? (
          <Crystal {...world.bossAt} />
        ) : (
          <Bear {...world.bossAt} />
        )}
        {world.npc && (
          <g transform={`translate(${world.npc.x} ${world.npc.y})`}>
            <path
              d="M0-18L14 0L0 18L-14 0Z"
              fill="#726a4e"
              stroke="#e1c98d"
              strokeWidth="2"
            />
            <path d="M-5 0H5M0-5V5" stroke="#f2dfb8" strokeWidth="2" />
          </g>
        )}
        {!winterStack &&
          world.actors.map((a) => (
            <g
              key={a.id}
              data-den-player={a.id}
              data-x={a.x.toFixed(2)}
              data-y={a.y.toFixed(2)}
            >
              {a.poison && (
                <circle
                  cx={a.x}
                  cy={a.y}
                  r="23"
                  fill="none"
                  stroke="#bacd94"
                  strokeWidth="2"
                />
              )}
              <Person {...a} tank={a.role === "Tank"} focus={a.id === "P3"} />
              {a.marked && (
                <path d={`M${a.x} ${a.y - 33}l7 7-7 7-7-7Z`} fill="#dfa8bd" />
              )}
            </g>
          ))}
        {winterStack && (
          <g>
            <Person x={235} y={257} focus />
            <circle cx="255" cy="237" r="12" fill="#bdd0ec" />
            <text
              x="255"
              y="241"
              fontSize="12"
              textAnchor="middle"
              fill="#17243a"
            >
              5
            </text>
          </g>
        )}
        {world.failure && (
          <path
            d="M75 20H525L580 75V345L525 400H75L20 345V75Z"
            fill="#b96f89"
            fillOpacity=".12"
            stroke="#cf94aa"
            strokeWidth="3"
          />
        )}
      </svg>
      {!winterStack &&
        world.actors.map((a) => (
          <span key={a.id} className={styles.actorLabel} style={pos(a, 29)}>
            {a.id}
          </span>
        ))}
      {winterStack && (
        <span className={styles.actorLabel} style={pos({ x: 235, y: 290 })}>
          P1–P5 · in snowdrift
        </span>
      )}
      {world.npc && (
        <span className={styles.npcLabel} style={pos(world.npc, -32)}>
          Zul’jarra{world.intercepting ? " · protect" : ""}
        </span>
      )}
      {boss === "hoardmonger" && (
        <>
          {[
            { x: 100, y: 43, label: "Meat" },
            { x: 500, y: 43, label: "Bones" },
            { x: 500, y: 383, label: "Mushrooms" },
          ].map((p) => (
            <span key={p.label} className={styles.arenaLabel} style={pos(p)}>
              {p.label}
            </span>
          ))}
        </>
      )}
      {boss === "sentinel-of-winter" && (
        <>
          <span className={styles.arenaLabel} style={pos({ x: 435, y: 50 })}>
            {world.bait ? "BAIT AREA" : "SQUALL AREA"}
          </span>
          {world.adds
            .filter((a) => a.visible)
            .map((a) => (
              <span key={a.id} className={styles.arenaLabel} style={pos(a, 36)}>
                Add {a.id}
                {a.controlled ? " · CC" : ""}
              </span>
            ))}
          {world.adds
            .filter((a) => a.dead)
            .map((a) => (
              <span
                key={a.id}
                className={styles.arenaLabel}
                style={pos({ x: a.id === "A" ? 140 : 535, y: a.y + 15 })}
              >
                Snowdrift {a.id}
              </span>
            ))}
        </>
      )}
    </div>
  );
}
