import type { VoidscarBossId } from "@/data/voidscar-guide";
import type { Point, VoidscarWorld } from "@/data/voidscar-playback";
import styles from "./voidscar.module.scss";
const pos = (p: Point, offset = 0) => ({
  left: `${p.x / 6}%`,
  top: `${(p.y + offset) / 4.2}%`,
});
const danger = "#cf94aa",
  safe = "#b8cb96",
  blue = "#b5c8eb",
  gold = "#e2cc94";
function Boss({ p, kind }: { p: Point; kind: VoidscarBossId }) {
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      {kind === "atroxus" ? (
        <>
          <path
            d="M-24-16L-12-26L0-18L12-26L24-16L18 18L0 29L-18 18Z"
            fill="#64755f"
            stroke={safe}
            strokeWidth="2"
          />
          <path d="M-13-3H-5M5-3H13M-7 14H7" stroke="#1b2930" strokeWidth="3" />
        </>
      ) : kind === "charonus" ? (
        <>
          <path
            d="M0-31L12-18L26-10L20 18L0 30L-20 18L-26-10L-12-18Z"
            fill="#665f7c"
            stroke={blue}
            strokeWidth="2"
          />
          <circle r="9" fill="#c6b4d5" />
          <circle r="4" fill="#182333" />
        </>
      ) : (
        <>
          <path
            d="M-24-8L-16-28L0-19L16-28L24-8L18 20L0 30L-18 20Z"
            fill="#68788d"
            stroke={blue}
            strokeWidth="2"
          />
          <path
            d="M-13-3L-4 1M4 1L13-3M-5 15H5"
            stroke="#192632"
            strokeWidth="3"
          />
        </>
      )}
    </g>
  );
}
function conePath(origin: Point, target: Point, length = 340, half = 0.28) {
  const a = Math.atan2(target.y - origin.y, target.x - origin.x);
  return `M${origin.x} ${origin.y}L${origin.x + length * Math.cos(a - half)} ${origin.y + length * Math.sin(a - half)}A${length} ${length} 0 0 1 ${origin.x + length * Math.cos(a + half)} ${origin.y + length * Math.sin(a + half)}Z`;
}
export default function VoidscarArena({
  boss,
  world: w,
}: {
  boss: VoidscarBossId;
  world: VoidscarWorld;
}) {
  const t = w.time;
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Animated Voidscar Arena schematic. Player numbers match party cards. Distances and positions are illustrative."
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
            cx={p.x}
            cy={p.y}
            r="27"
            fill={boss === "atroxus" ? "#536a4b" : "#65506c"}
            fillOpacity=".55"
            stroke={boss === "atroxus" ? safe : danger}
            strokeWidth="2"
          />
        ))}
        {w.impacts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={boss === "charonus" ? 34 : 29}
            fill={danger}
            fillOpacity=".14"
            stroke={danger}
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        ))}
        {w.lanes.map((lane, i) => (
          <path
            key={i}
            d={`M${lane.from.x} ${lane.from.y}L${lane.to.x} ${lane.to.y}`}
            fill="none"
            stroke={danger}
            strokeWidth={t >= 4 ? 13 : 8}
            strokeOpacity={t >= 4 ? 0.45 : 0.28}
            strokeDasharray={t < 4 ? "8 6" : undefined}
          />
        ))}
        {w.shades.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <path
              d="M-13-10L0-18L13-10V12L0 18L-13 12Z"
              fill="#504e70"
              stroke="#c6b2d3"
              strokeWidth="2"
            />
            <path d="M-6-2H6M-6 6H6" stroke={blue} strokeWidth="2" />
          </g>
        ))}
        {w.projectiles.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="10"
              fill="#a77a9c"
              stroke="#e3bbd1"
              strokeWidth="2"
            />
            <circle cx={p.x} cy={p.y} r="4" fill="#efd7e3" />
          </g>
        ))}
        {w.breathTarget && (
          <path
            d={conePath(w.boss, w.breathTarget)}
            fill={danger}
            fillOpacity=".2"
            stroke={danger}
            strokeDasharray="6 4"
          />
        )}
        {boss === "charonus" && t >= 18 && t < 22 && (
          <path
            d={conePath(w.boss, { x: 300, y: 300 }, 300, 0.22)}
            fill={danger}
            fillOpacity=".18"
            stroke={danger}
            strokeDasharray="6 4"
          />
        )}
        {w.singularities.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <circle r="30" fill="#27233d" stroke="#c7b1db" strokeWidth="3" />
            <path d="M0-19L5-5L19 0L5 5L0 19L-5 5L-19 0L-5-5Z" fill="#a894c2" />
            <circle r="5" fill="#171827" />
          </g>
        ))}
        {w.orb && (
          <g>
            <path
              d={`M${w.orb.x} ${w.orb.y}L${w.actors[2].x} ${w.actors[2].y}`}
              fill="none"
              stroke={gold}
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <circle
              cx={w.orb.x}
              cy={w.orb.y}
              r="12"
              fill="#7f769c"
              stroke={gold}
              strokeWidth="3"
            />
            <circle cx={w.orb.x} cy={w.orb.y} r="5" fill="#e7d8b0" />
          </g>
        )}
        {w.creeper && (
          <g transform={`translate(${w.creeper.x} ${w.creeper.y})`}>
            <path
              d="M-18-11L-6-17L6-17L18-11L15 12L0 19L-15 12Z"
              fill="#556b50"
              stroke={safe}
              strokeWidth="2"
            />
            <path d="M-9-2H-4M4-2H9M-5 9H5" stroke="#e1d4ab" strokeWidth="2" />
            <path
              d={`M0 0L${w.actors[0].x - w.creeper.x} ${w.actors[0].y - w.creeper.y}`}
              fill="none"
              stroke={gold}
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity=".8"
            />
          </g>
        )}
        <Boss p={w.boss} kind={boss} />
        {w.actors.map((a) => (
          <g
            key={a.id}
            data-voidscar-player={a.id}
            data-x={a.x.toFixed(2)}
            data-y={a.y.toFixed(2)}
          >
            {a.marked && (
              <path d={`M${a.x} ${a.y - 35}l8 8-8 8-8-8Z`} fill={danger} />
            )}
            {a.disabled && (
              <circle
                cx={a.x}
                cy={a.y}
                r="23"
                fill="none"
                stroke={danger}
                strokeWidth="3"
                strokeDasharray="4 3"
              />
            )}
            <circle
              cx={a.x}
              cy={a.y}
              r="16"
              fill={a.hurt ? "#623b51" : a.id === "P3" ? "#64543b" : "#2c4466"}
              stroke={a.hurt ? danger : a.id === "P3" ? gold : blue}
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
                  fill={a.id === "P3" ? gold : blue}
                />
              </>
            )}
          </g>
        ))}
      </svg>
      <span
        className={styles.npcLabel}
        style={pos(
          boss === "tazrah" && t < 18
            ? { x: 290, y: 28 }
            : boss === "charonus"
              ? { x: 300, y: 160 }
              : { x: w.boss.x, y: w.boss.y - 44 },
        )}
      >
        {boss === "tazrah"
          ? "Taz’Rah"
          : boss === "atroxus"
            ? "Atroxus"
            : "Charonus"}
      </span>
      {w.actors.map((a) => (
        <span
          key={a.id}
          className={styles.actorLabel}
          style={pos(
            a,
            a.id === "P1" && boss === "atroxus" ? -27 : a.y >= 350 ? -27 : 27,
          )}
        >
          {a.id}
        </span>
      ))}
      {w.creeper && (
        <span className={styles.arenaLabel} style={pos({ x: 90, y: 35 })}>
          Creeper → P1
        </span>
      )}
      {w.orb && (
        <span className={styles.arenaLabel} style={pos({ x: 80, y: 345 })}>
          Orb follows P3
        </span>
      )}
      {boss === "charonus" && t < 8.8 && (
        <span className={styles.arenaLabel} style={pos({ x: 180, y: 105 })}>
          Singularity
        </span>
      )}
    </div>
  );
}
