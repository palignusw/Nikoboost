import type { ValeBossId } from "@/data/vale-guide";
import {
  dormantPositions,
  loamPositions,
  type Point,
  type ValeWorld,
} from "@/data/vale-playback";
import styles from "./vale.module.scss";
const pos = (p: Point, offset = 0) => ({
  left: `${p.x / 6}%`,
  top: `${(p.y + offset) / 4.2}%`,
});
const danger = "#cf94aa",
  safe = "#b8cb96",
  blue = "#b5c8eb",
  gold = "#e2cc94";
function Root({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="20" fill="#40564a" fillOpacity=".5" stroke={safe} />
      <path
        d="M-14 12Q-4-2-10-16M0 17Q8-2 0-15M14 10Q0 1 14-12"
        fill="none"
        stroke={safe}
        strokeWidth="3"
      />
    </g>
  );
}
function Flower({
  x,
  y,
  dead = false,
}: {
  x: number;
  y: number;
  dead?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 15V-4M0 5Q-22 5-15-10Q0-8 0 5M0 0Q22 0 15-15Q0-11 0 0"
        fill={dead ? "#565b65" : "#647860"}
        stroke={dead ? blue : safe}
        strokeWidth="2"
      />
      <circle cy="-12" r="8" fill={dead ? "#65727e" : gold} />
    </g>
  );
}
function Boss({ p, kind }: { p: Point; kind: string }) {
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      {kind === "cat" ? (
        <>
          <path
            d="M-25-20L-9-12L10-12L25-20L22 10L0 28L-22 10Z"
            fill="#6c7885"
            stroke={blue}
            strokeWidth="2"
          />
          <path
            d="M-14-3L-5 1M5 1L14-3M-5 14H5"
            stroke="#192633"
            strokeWidth="3"
          />
        </>
      ) : kind === "bear" ? (
        <>
          <circle cx="-17" cy="-18" r="9" fill="#647184" stroke={blue} />
          <circle cx="17" cy="-18" r="9" fill="#647184" stroke={blue} />
          <path
            d="M-24-9Q0-30 24-9L20 17Q0 35-20 17Z"
            fill="#6c7885"
            stroke={blue}
            strokeWidth="2"
          />
          <path d="M-12-3H-5M5-3H12M-6 14H6" stroke="#182633" strokeWidth="3" />
        </>
      ) : kind === "tree" ? (
        <>
          <path
            d="M-9 22L-5-15L-21-24M-4-7L12-24M0 0L24-12M-5 9L-22-5M-5-15L1-30"
            fill="none"
            stroke={safe}
            strokeWidth="8"
          />
          <path
            d="M-14-5Q0-17 15-5L10 20L0 28L-12 19Z"
            fill="#576e5e"
            stroke={safe}
            strokeWidth="2"
          />
          <path d="M-9 4H-3M4 4H10" stroke={gold} strokeWidth="3" />
        </>
      ) : (
        <>
          <path
            d="M-24-4L-16-26L0-17L16-26L24-4L14 20L0 28L-14 20Z"
            fill="#61748a"
            stroke={blue}
            strokeWidth="2"
          />
          <path
            d="M-12-3L-3 2M3 2L12-3M-5 14H5"
            stroke="#182633"
            strokeWidth="3"
          />
        </>
      )}
    </g>
  );
}
function conePath(origin: Point, target: Point, length = 310) {
  const a = Math.atan2(target.y - origin.y, target.x - origin.x),
    len = length,
    h = 0.17;
  return `M${origin.x} ${origin.y}L${origin.x + len * Math.cos(a - h)} ${origin.y + len * Math.sin(a - h)}A${len} ${len} 0 0 1 ${origin.x + len * Math.cos(a + h)} ${origin.y + len * Math.sin(a + h)}Z`;
}
export default function ValeArena({
  boss,
  world: w,
}: {
  boss: ValeBossId;
  world: ValeWorld;
}) {
  const t = w.time;
  const kind =
    boss === "ikuzz"
      ? "cat"
      : boss === "ziekket"
        ? "tree"
        : boss === "lightwarden-ruia" && t >= 13 && t < 25
          ? "bear"
          : "owl";
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Animated Blinding Vale schematic. Player IDs match party cards. Distances and positions are illustrative."
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
            r="30"
            fill="#82637a"
            fillOpacity=".45"
            stroke={danger}
          />
        ))}
        {w.flowers.map((f, i) => (
          <g key={i}>
            <circle
              cx={f.x}
              cy={f.y}
              r="34"
              fill={
                f.state === "soak"
                  ? f.covered
                    ? "#536745"
                    : "#70523f"
                  : f.state === "loam"
                    ? "#5b5840"
                    : "#684a5b"
              }
              fillOpacity=".5"
              stroke={f.state === "soak" && f.covered ? safe : danger}
              strokeWidth="2"
              strokeDasharray={f.state === "soak" ? undefined : "5 4"}
            />
            {f.state !== "scorched" && <Flower x={f.x} y={f.y} />}
          </g>
        ))}
        {boss === "lightblossom-trinity" && t >= 4 && t < 8 && (
          <path
            d={`M${loamPositions.map((p) => `${p.x} ${p.y}`).join("L")}`}
            fill="none"
            stroke={danger}
            strokeWidth="13"
            strokeOpacity=".35"
            strokeDasharray="10 5"
          />
        )}
        {boss === "lightblossom-trinity" &&
          t >= 8 &&
          t < 16 &&
          w.flowers.map((f, i) => (
            <path
              key={i}
              d={`M350 105L${f.x} ${f.y}`}
              stroke={f.covered ? gold : danger}
              strokeWidth="4"
              opacity=".7"
            />
          ))}
        {w.roots.map((p, i) => (
          <Root key={i} {...p} />
        ))}
        {boss === "ikuzz" && t >= 4 && t < 5 && (
          <circle
            cx="300"
            cy="150"
            r={50 + (t - 4) * 160}
            fill="none"
            stroke={danger}
            strokeWidth="3"
          />
        )}
        {boss === "ikuzz" && t >= 12 && t < 22 && (
          <>
            <path
              d={`M${w.boss.x} ${w.boss.y}L${w.actors[2].x} ${w.actors[2].y}`}
              fill="none"
              stroke={danger}
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <circle
              cx={w.boss.x}
              cy={w.boss.y}
              r="30"
              fill="none"
              stroke={gold}
              strokeDasharray="6 5"
            />
          </>
        )}
        {w.impacts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="28"
            fill={danger}
            fillOpacity=".15"
            stroke={danger}
            strokeDasharray="5 4"
          />
        ))}
        {w.lines.map((line, i) => (
          <path
            key={i}
            d={`M${line.from.x} ${line.from.y}L${line.to.x} ${line.to.y}`}
            stroke={gold}
            strokeWidth="9"
            strokeLinecap="round"
            opacity=".7"
          />
        ))}
        {w.cones.map((p, i) => (
          <path
            key={i}
            d={conePath(w.boss, p)}
            fill={danger}
            fillOpacity={
              0.12 + Math.max(0, Math.cos((t - 19) * Math.PI)) * 0.15
            }
            stroke={danger}
            strokeWidth="1.5"
          />
        ))}
        {boss === "ziekket" &&
          w.adds !== "none" &&
          w.adds !== "cleared" &&
          dormantPositions.map((p, i) => (
            <g key={i}>
              <Flower {...p} dead={w.adds === "dormant"} />
              {w.adds === "regrown" && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="25"
                  fill="none"
                  stroke={danger}
                  strokeWidth="3"
                />
              )}
            </g>
          ))}
        {w.beamTarget && (
          <path
            d={conePath(w.boss, w.beamTarget, 380)}
            fill={t >= 10 ? gold : "none"}
            fillOpacity=".22"
            stroke={gold}
            strokeWidth={t >= 10 ? 2 : 1}
            strokeDasharray={t < 10 ? "5 5" : undefined}
          />
        )}
        {w.orbs.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="13"
              fill="#8b8254"
              stroke={gold}
              strokeWidth="2"
            />
            <circle cx={p.x} cy={p.y} r="6" fill={gold} />
          </g>
        ))}
        {w.bosses.length ? (
          w.bosses.map((p, i) => (
            <Boss key={i} p={p} kind={i === 0 ? "tree" : "owl"} />
          ))
        ) : (
          <Boss p={w.boss} kind={kind} />
        )}
        {w.actors.map((a) => (
          <g
            key={a.id}
            data-vale-player={a.id}
            data-x={a.x.toFixed(2)}
            data-y={a.y.toFixed(2)}
          >
            {a.marked && (
              <path d={`M${a.x} ${a.y - 35}l8 8-8 8-8-8Z`} fill={danger} />
            )}
            {a.rooted && (
              <circle
                cx={a.x}
                cy={a.y}
                r="22"
                fill="none"
                stroke={safe}
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
      {w.bosses.length ? (
        w.bosses.map((p, i) => (
          <span key={i} className={styles.arenaLabel} style={pos(p, -38)}>
            {["Meittik", "Lekshi", "Kezkitt"][i]}
          </span>
        ))
      ) : (
        <span
          className={styles.npcLabel}
          style={pos(
            boss === "ziekket" ? { x: 200, y: 55 } : { x: 300, y: 25 },
          )}
        >
          {boss === "ikuzz" ? "Ikuzz" : boss === "ziekket" ? "Ziekket" : w.form}
        </span>
      )}
      {w.actors.map((a) => (
        <span
          key={a.id}
          className={styles.actorLabel}
          style={pos(a, a.y >= 360 ? -27 : 27)}
        >
          {a.id}
        </span>
      ))}
      {boss === "ziekket" && (
        <span className={styles.arenaLabel} style={pos({ x: 440, y: 150 })}>
          {w.adds === "active"
            ? "Lashers · control"
            : w.adds === "dormant"
              ? "Dormant · beam these"
              : w.adds === "regrown"
                ? "Regrowth · stronger"
                : "Lightsap · avoid"}
        </span>
      )}
    </div>
  );
}
