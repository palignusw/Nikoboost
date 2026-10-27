import type { TempleBossId } from "@/data/temple-guide";
import type { TempleWorld, Point } from "@/data/temple-playback";
import styles from "./temple.module.scss";
const pos = (p: Point) => ({ left: `${p.x / 6}%`, top: `${p.y / 4.2}%` });
const gold = "#e2cc94",
  blue = "#b5c8eb",
  red = "#cf94aa";
export default function TempleArena({
  boss,
  world: w,
}: {
  boss: TempleBossId;
  world: TempleWorld;
}) {
  const names: Record<TempleBossId, string> = {
    "adderis-and-aspix": "Adderis",
    merektha: "Merektha",
    galvazzt: "Galvazzt",
    "avatar-of-sethraliss": "Avatar · heal",
  };
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Animated Temple of Sethraliss schematic. Player numbers match party cards. Positions and scene timing are illustrative."
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
        {w.hazards.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="28"
            fill="#726050"
            fillOpacity=".55"
            stroke={gold}
            strokeWidth="2"
          />
        ))}
        {w.circles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="95"
            fill="#778dac"
            fillOpacity=".15"
            stroke={blue}
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        ))}
        {boss === "adderis-and-aspix" &&
          w.time >= 5 &&
          w.time < 10 &&
          w.actors.map((a) => (
            <path
              key={a.id}
              d={`M${w.boss.x} ${w.boss.y}L${a.x} ${a.y}`}
              stroke={red}
              strokeOpacity=".55"
              strokeWidth="5"
              strokeDasharray="6 5"
            />
          ))}
        {w.beams.map((b, i) => (
          <path
            key={i}
            d={`M${b.from.x} ${b.from.y}L${b.to.x} ${b.to.y}`}
            stroke={b.covered ? blue : red}
            strokeWidth="8"
            strokeOpacity=".7"
          />
        ))}
        {w.spires.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <path
              d="M0-25L15-8L11 19H-11L-15-8Z"
              fill="#495b72"
              stroke={blue}
              strokeWidth="3"
            />
            <path d="M3-16L-5 2H2L-2 14L7-5H0Z" fill="#f3e5b5" />
          </g>
        ))}
        {w.orbs.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <circle r="20" fill="#705577" stroke={red} strokeWidth="3" />
            <circle r="8" fill="#e4c5df" />
          </g>
        ))}
        {w.adds.map((a, i) => (
          <g key={i} transform={`translate(${a.p.x} ${a.p.y})`}>
            <path
              d="M0-20L18-8L15 14L0 22L-15 14L-18-8Z"
              fill="#645b49"
              stroke={gold}
              strokeWidth="2"
            />
            <text
              textAnchor="middle"
              y="5"
              fill="#fff"
              fontSize={a.label.length > 2 ? "8" : "13"}
            >
              {a.label}
            </text>
          </g>
        ))}
        {w.heal && (
          <path
            d={`M${w.actors[1].x} ${w.actors[1].y}L${w.boss.x} ${w.boss.y}`}
            stroke="#a8d5a0"
            strokeWidth="5"
            strokeDasharray="8 5"
          />
        )}
        {[
          ...(w.bossHidden ? [] : [w.boss]),
          ...(w.secondBoss ? [w.secondBoss] : []),
        ].map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            {w.shield && p === w.shield && (
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
              fill={boss === "avatar-of-sethraliss" ? "#52745e" : "#68788d"}
              stroke={boss === "avatar-of-sethraliss" ? "#a8d5a0" : blue}
              strokeWidth="2"
            />
            <path
              d="M-13-3L-4 1M4 1L13-3M-5 15H5"
              stroke="#192632"
              strokeWidth="3"
            />
          </g>
        ))}
        {w.actors.map((a) => (
          <g
            key={a.id}
            data-temple-player={a.id}
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
      {!w.bossHidden && (
        <span
          className={styles.npcLabel}
          style={pos({ x: w.boss.x, y: w.boss.y - 48 })}
        >
          {names[boss]}
          {w.shield === w.boss ? " · immune" : ""}
        </span>
      )}
      {w.secondBoss && (
        <span
          className={styles.npcLabel}
          style={pos({ x: w.secondBoss.x, y: w.secondBoss.y - 48 })}
        >
          Aspix{w.shield === w.secondBoss ? " · immune" : ""}
        </span>
      )}
      <span className={styles.arenaLabel} style={pos({ x: 300, y: 25 })}>
        {w.message}
      </span>
      {boss === "merektha" && w.time >= 10 && w.time < 15 && (
        <span className={styles.arenaLabel} style={pos({ x: 300, y: 385 })}>
          V · Viper &nbsp; S · Storm Serpent
        </span>
      )}
    </div>
  );
}
