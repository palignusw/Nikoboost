import type { RubyBossId } from "@/data/ruby-guide";
import type { RubyWorld, Point } from "@/data/ruby-playback";
import styles from "./ruby.module.scss";
const pos = (p: Point) => ({ left: `${p.x / 6}%`, top: `${p.y / 4.2}%` });
const gold = "#e2cc94",
  blue = "#b5c8eb",
  red = "#cf94aa";
export default function RubyArena({
  boss,
  world: w,
}: {
  boss: RubyBossId;
  world: RubyWorld;
}) {
  const names: Record<RubyBossId, string> = {
    "melidrussa-chillworn": "Melidrussa",
    "kokia-blazehoof": "Kokia",
    "kyrakka-and-erkhart": "Erkhart",
  };
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Animated Ruby Life Pools schematic. Player numbers match party cards. Positions and scene timing are illustrative."
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
            r="25"
            fill={boss === "melidrussa-chillworn" ? "#607892" : "#805949"}
            fillOpacity=".55"
            stroke={boss === "melidrussa-chillworn" ? blue : gold}
            strokeWidth="2"
          />
        ))}
        {w.storm && (
          <g transform={`translate(${w.storm.x} ${w.storm.y})`}>
            <circle
              r="70"
              fill={red}
              fillOpacity=".15"
              stroke={red}
              strokeWidth="2"
            />
            <circle r="47" fill="none" stroke={red} strokeDasharray="6 5" />
            <path
              d="M-20 0q20-35 40 0q-20 35-40 0"
              fill="none"
              stroke={red}
              strokeWidth="3"
            />
          </g>
        )}
        {w.zone && (
          <circle
            cx={w.zone.x}
            cy={w.zone.y}
            r="50"
            fill={red}
            fillOpacity=".14"
            stroke={red}
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}
        {w.lane && (
          <path
            d={`M${w.lane.from.x} ${w.lane.from.y}L${w.lane.to.x} ${w.lane.to.y}`}
            stroke={red}
            strokeOpacity=".5"
            strokeWidth="36"
            strokeDasharray="8 5"
          />
        )}
        {w.breath && (
          <path
            d="M430 100L340 325H520Z"
            fill={red}
            fillOpacity=".18"
            stroke={red}
            strokeWidth="2"
            strokeDasharray="6 5"
          />
        )}
        {w.wind && (
          <g>
            <path d="M510 55H390" stroke={blue} strokeWidth="3" />
            <path
              d="M402 45L390 55L402 65"
              fill="none"
              stroke={blue}
              strokeWidth="3"
            />
          </g>
        )}
        {w.projectile && (
          <circle
            cx={w.projectile.x}
            cy={w.projectile.y}
            r="18"
            fill="#a5644d"
            stroke={gold}
            strokeWidth="3"
          />
        )}
        {w.adds.map((a, i) => (
          <g key={i} transform={`translate(${a.p.x} ${a.p.y})`}>
            <path
              d="M0-19L17-8L14 14L0 20L-14 14L-17-8Z"
              fill="#645b49"
              stroke={gold}
              strokeWidth="2"
            />
            <text textAnchor="middle" y="5" fill="#fff" fontSize="11">
              {a.label}
            </text>
          </g>
        ))}
        <g transform={`translate(${w.boss.x} ${w.boss.y})`}>
          {w.shield && (
            <circle
              r="38"
              fill="#829dcc"
              fillOpacity=".18"
              stroke={blue}
              strokeWidth="3"
              strokeDasharray="5 4"
            />
          )}
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
        </g>
        {w.dragon && (
          <g transform={`translate(${w.dragon.x} ${w.dragon.y})`}>
            <path
              d="M-35-12L-22-22L-12-10L0-27L12-10L22-22L35-12L19 5L15 20L0 29L-15 20L-19 5Z"
              fill="#805b54"
              stroke={gold}
              strokeWidth="2"
            />
            <path d="M-10 0L-3 4M3 4L10 0" stroke="#1a222d" strokeWidth="3" />
          </g>
        )}
        {w.actors.map((a) => (
          <g
            key={a.id}
            data-ruby-player={a.id}
            data-x={a.x.toFixed(2)}
            data-y={a.y.toFixed(2)}
          >
            {a.marked && (
              <path d={`M${a.x} ${a.y - 35}l8 8-8 8-8-8Z`} fill={red} />
            )}
            <circle
              cx={a.x}
              cy={a.y}
              r="16"
              fill={a.hurt ? "#623b51" : a.id === "P3" ? "#64543b" : "#2c4466"}
              stroke={a.hurt ? red : a.id === "P3" ? gold : blue}
              strokeWidth="2"
            />
            <text
              x={a.x}
              y={a.y + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize="11"
            >
              {a.id}
            </text>
          </g>
        ))}
      </svg>
      <span
        className={styles.npcLabel}
        style={pos({ x: w.boss.x, y: w.boss.y - 48 })}
      >
        {names[boss]}
      </span>
      {w.dragon && (
        <span
          className={styles.npcLabel}
          style={pos({ x: w.dragon.x, y: w.dragon.y - 48 })}
        >
          Kyrakka
        </span>
      )}
      <span className={styles.arenaLabel} style={pos({ x: 300, y: 25 })}>
        {w.message}
      </span>
      {boss === "melidrussa-chillworn" && w.shield && (
        <span className={styles.arenaLabel} style={pos({ x: 300, y: 370 })}>
          W · Whelps
        </span>
      )}
    </div>
  );
}
