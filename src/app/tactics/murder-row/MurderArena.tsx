import type { MurderBossId } from "@/data/murder-guide";
import {
  coverPositions,
  coverSpot,
  type Point,
  type MurderWorld,
} from "@/data/murder-playback";
import styles from "./murder.module.scss";
const pos = (p: Point, offset = 0) => ({
  left: `${p.x / 6}%`,
  top: `${(p.y + offset) / 4.2}%`,
});
const danger = "#cf94aa",
  safe = "#b8cb96",
  blue = "#b5c8eb";
function Barrel({
  x,
  y,
  fel = false,
}: {
  x: number;
  y: number;
  fel?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-12"
        y="-15"
        width="24"
        height="30"
        rx="7"
        fill={fel ? "#3c5849" : "#5e4d39"}
        stroke={fel ? safe : "#c7b28b"}
        strokeWidth="2"
      />
      <path
        d="M-12-7H12M-12 7H12M0-14V14"
        fill="none"
        stroke="#d1bd92"
        strokeWidth="2"
      />
    </g>
  );
}
function Imp({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-10-7L-15-20L-2-12L12-20L10-6L0 12Z"
        fill="#3c524b"
        stroke={safe}
        strokeWidth="2"
      />
      <path d="M-6-3H-2M3-3H7" stroke="#e0d5b0" strokeWidth="2" />
    </g>
  );
}
export default function MurderArena({
  boss,
  world: w,
}: {
  boss: MurderBossId;
  world: MurderWorld;
}) {
  const t = w.time;
  const labels: { p: Point; text: string }[] = [];
  if (w.nibbles)
    labels.push({
      p: { x: w.nibbles.x, y: w.nibbles.y - 32 },
      text: t >= 18 ? "Nibbles · friendly" : "Nibbles · focus",
    });
  if (w.infernal)
    labels.push({
      p: { x: w.infernal.x, y: w.infernal.y - 32 },
      text: "Infernal · kite",
    });
  if (w.axe)
    labels.push({ p: { x: w.axe.x, y: w.axe.y - 32 }, text: "Axe · kill" });
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Animated encounter schematic. Player numbers match party cards. Distances are illustrative."
      >
        <path
          d="M75 20H525L580 75V345L525 400H75L20 345V75Z"
          fill="#111e2b"
          stroke="#536981"
          strokeWidth="2"
        />
        {[100, 200, 300, 400, 500].map((x) => (
          <path key={x} d={`M${x} 25V395`} stroke="#41546c" opacity=".12" />
        ))}
        {w.pools.map((p, i) => (
          <circle
            key={i}
            {...{ cx: p.x, cy: p.y }}
            r="26"
            fill="#52644e"
            opacity=".55"
            stroke={safe}
          />
        ))}
        {boss === "xathuux" && t < 4 && (
          <path
            d="M300 115L235 25H365Z"
            fill={danger}
            fillOpacity=".23"
            stroke={danger}
            strokeDasharray="5 4"
          />
        )}
        {boss === "kystia-manaheart" && t >= 5 && t < 10 && (
          <path
            d="M365 135L555 65L555 205Z"
            transform={`rotate(${60 - (t - 5) * 12} 365 135)`}
            fill={danger}
            fillOpacity=".23"
            stroke={danger}
          />
        )}
        {w.ring && (
          <circle
            cx={w.ring.center.x}
            cy={w.ring.center.y}
            r={w.ring.radius}
            fill={boss === "kystia-manaheart" ? danger : "none"}
            fillOpacity=".15"
            stroke={danger}
            strokeWidth={boss === "lithiel-cinderfury" ? 9 : 3}
            strokeDasharray={boss === "kystia-manaheart" ? "6 4" : undefined}
          />
        )}
        {boss === "zaen-bladesorrow" && (
          <>
            {t < 19 &&
              coverPositions.map((b, i) => {
                const s = coverSpot(b);
                return (
                  <g key={i}>
                    {t >= 11 && t < 14 && (
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r="21"
                        fill={safe}
                        fillOpacity=".18"
                        stroke={safe}
                        strokeDasharray="4 3"
                      />
                    )}
                    {t >= 14 && (
                      <circle
                        cx={b.x}
                        cy={b.y}
                        r={20 + (t - 14) * 6}
                        fill={danger}
                        fillOpacity=".12"
                        stroke={danger}
                        strokeDasharray="5 4"
                      />
                    )}
                    {t >= 11 && t < 14 && (
                      <path
                        d={`M300 65L${b.x} ${b.y}`}
                        stroke={blue}
                        opacity=".35"
                        strokeDasharray="4 5"
                      />
                    )}
                    {t >= 14 && t < 14.8 && (
                      <path
                        d={`M300 65L${w.failure && i === 2 ? w.actors[i].x : b.x} ${w.failure && i === 2 ? w.actors[i].y : b.y}`}
                        stroke={w.failure && i === 2 ? danger : blue}
                        strokeWidth="2"
                      />
                    )}
                    <Barrel {...b} />
                  </g>
                );
              })}
            {w.freight !== "gone" && (
              <>
                <Barrel x={500} y={80} fel />
                {w.freight === "primed" && (
                  <circle
                    cx="500"
                    cy="80"
                    r={35 + (t - 6) * 8}
                    fill={danger}
                    fillOpacity=".12"
                    stroke={danger}
                  />
                )}
              </>
            )}
            {t < 6 && (
              <circle
                cx={w.actors[2].x}
                cy={w.actors[2].y}
                r="44"
                fill={danger}
                fillOpacity=".1"
                stroke={danger}
                strokeDasharray="5 4"
              />
            )}
          </>
        )}
        {boss === "lithiel-cinderfury" && t >= 12 && (
          <>
            <path
              d="M160 300Q330 350 470 160"
              fill="none"
              stroke={safe}
              strokeDasharray="5 7"
              opacity=".5"
            />
            {[
              { x: 160, y: 300 },
              { x: 470, y: 160 },
            ].map((p, i) => (
              <g key={i}>
                <ellipse
                  cx={p.x}
                  cy={p.y}
                  rx="17"
                  ry="28"
                  fill="#263d3a"
                  stroke={safe}
                  strokeWidth="3"
                />
                <ellipse
                  cx={p.x}
                  cy={p.y}
                  rx="9"
                  ry="21"
                  fill="none"
                  stroke={blue}
                />
              </g>
            ))}
          </>
        )}
        {w.impacts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={boss === "lithiel-cinderfury" ? 42 : 34}
            fill={danger}
            fillOpacity=".12"
            stroke={danger}
            strokeDasharray="5 4"
          />
        ))}
        {w.clones.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="15" fill="#344b61" stroke={blue} />
            <path
              d={`M${p.x} ${p.y + 20}v20`}
              stroke={danger}
              strokeWidth="3"
            />
          </g>
        ))}
        {w.adds === "active" && (
          <>
            <Imp x={180} y={220} />
            <Imp x={250} y={295} />
            <Imp x={310} y={250} />
            <path
              d="M335 200L350 180L380 190L390 215L365 228L345 220Z"
              fill="#495c47"
              stroke={safe}
            />
          </>
        )}
        {w.nibbles && (
          <g transform={`translate(${w.nibbles.x} ${w.nibbles.y})`}>
            <path
              d="M-22-4Q0-28 23-1Q-4 8-12 20Q-28 30-15 6"
              fill={t >= 18 ? "#bdc796" : "#526c61"}
              stroke={safe}
              strokeWidth="2"
            />
          </g>
        )}
        {w.infernal && (
          <g transform={`translate(${w.infernal.x} ${w.infernal.y})`}>
            <path
              d="M-20-12L0-25L22-10L18 15L0 24L-22 12Z"
              fill="#4f6556"
              stroke={safe}
              strokeWidth="3"
            />
            <path
              d="M-8-5L0 3L9-7"
              fill="none"
              stroke="#d7c293"
              strokeWidth="3"
            />
          </g>
        )}
        {w.axe && (
          <g transform={`translate(${w.axe.x} ${w.axe.y})`}>
            <path
              d="M0-20V20M-1-17Q-26-24-20 0L0-7L20 0Q26-24 1-17"
              fill="#5a6c78"
              stroke={blue}
              strokeWidth="3"
            />
          </g>
        )}
        <g transform={`translate(${w.boss.x} ${w.boss.y})`}>
          <path
            d="M-23-10L-12-29L0-20L12-29L23-10L18 18L0 30L-18 18Z"
            fill="#5b6c81"
            stroke={blue}
            strokeWidth="2"
          />
          <path
            d="M-12-1L-3 4M3 4L12-1M-5 16H5"
            stroke="#172431"
            strokeWidth="4"
          />
          {boss === "kystia-manaheart" && t < 18 && (
            <circle
              r="38"
              fill="none"
              stroke={safe}
              strokeWidth="3"
              strokeDasharray="8 4"
            />
          )}
        </g>
        {w.actors.map((a) => (
          <g
            key={a.id}
            data-murder-player={a.id}
            data-x={a.x.toFixed(2)}
            data-y={a.y.toFixed(2)}
          >
            {a.marked && (
              <path d={`M${a.x} ${a.y - 35}l8 8-8 8-8-8Z`} fill={danger} />
            )}
            <circle
              cx={a.x}
              cy={a.y}
              r="16"
              fill={a.hurt ? "#623b51" : a.id === "P3" ? "#64543b" : "#2c4466"}
              stroke={a.hurt ? danger : a.id === "P3" ? "#e2cc94" : blue}
              strokeWidth="2"
            />
            {a.role === "Tank" ? (
              <path
                d={`M${a.x - 8} ${a.y - 8}h16v10q-2 8-8 10q-6-2-8-10Z`}
                fill={blue}
              />
            ) : (
              <>
                <circle cx={a.x} cy={a.y - 5} r="5" fill={blue} />
                <path
                  d={`M${a.x - 9} ${a.y + 9}q0-12 9-12q9 0 9 12Z`}
                  fill={blue}
                />
              </>
            )}
          </g>
        ))}
      </svg>
      <span
        className={styles.npcLabel}
        style={pos(
          boss === "xathuux"
            ? { x: 380, y: 80 }
            : boss === "lithiel-cinderfury" && t >= 12
              ? { x: 480, y: 35 }
              : { x: w.boss.x, y: w.boss.y - 42 },
        )}
      >
        Boss
      </span>
      {labels.map((l) => (
        <span key={l.text} className={styles.arenaLabel} style={pos(l.p)}>
          {l.text}
        </span>
      ))}
      {w.actors.map((a) => (
        <span
          key={a.id}
          className={styles.actorLabel}
          style={pos(
            a,
            a.id === "P1" &&
              ((boss === "xathuux" && t < 17) ||
                (boss === "lithiel-cinderfury" && t < 12))
              ? -27
              : 27,
          )}
        >
          {a.id}
        </span>
      ))}
      {boss === "zaen-bladesorrow" && w.freight !== "gone" && (
        <span className={styles.arenaLabel} style={pos({ x: 490, y: 45 })}>
          Fel freight
        </span>
      )}
      {boss === "lithiel-cinderfury" && t >= 12 && (
        <>
          <span className={styles.arenaLabel} style={pos({ x: 160, y: 365 })}>
            Entry
          </span>
          <span className={styles.arenaLabel} style={pos({ x: 560, y: 110 })}>
            Exit
          </span>
        </>
      )}
    </div>
  );
}
