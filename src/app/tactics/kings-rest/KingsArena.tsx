import type { KingsBossId } from "@/data/kings-guide";
import type { KingsWorld, Point } from "@/data/kings-playback";
import styles from "./kings.module.scss";
const pos = (p: Point, offset = 0) => ({
  left: `${p.x / 6}%`,
  top: `${(p.y + offset) / 4.2}%`,
});
export default function KingsArena({
  boss,
  world: w,
}: {
  boss: KingsBossId;
  world: KingsWorld;
}) {
  const names: Record<KingsBossId, string> = {
    "golden-serpent": "Golden Serpent",
    mchimba: "Mchimba",
    "council-of-tribes": "Council",
    dazar: "Dazar",
  };
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Animated Kings’ Rest schematic. Player numbers match party cards. Positions and timing are illustrative."
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
        {w.coffins.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <rect
              x="-22"
              y="-30"
              width="44"
              height="60"
              rx="8"
              fill="#454b53"
              stroke={i === w.activeCoffin ? "#e2cc94" : "#8493a4"}
              strokeWidth={i === w.activeCoffin ? 4 : 2}
            />
            <path d="M-10-12H10M0-20V10" stroke="#b8c4cf" strokeWidth="2" />
            {i === w.activeCoffin && (
              <path
                d="M-30-18l-6-8M30-18l6-8"
                stroke="#e2cc94"
                strokeWidth="3"
              />
            )}
          </g>
        ))}
        {w.hazard.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="25"
            fill="#9c7746"
            fillOpacity=".5"
            stroke="#e2cc94"
            strokeWidth="2"
          />
        ))}
        {[w.zone, w.zone2]
          .filter((p): p is Point => p !== null)
          .map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={boss === "council-of-tribes" ? 70 : 42}
              fill="#cf94aa"
              fillOpacity=".15"
              stroke="#cf94aa"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          ))}
        {w.frontal && (
          <path
            d="M300 170L210 20H390Z"
            fill="#cf94aa"
            fillOpacity=".2"
            stroke="#cf94aa"
            strokeDasharray="6 4"
          />
        )}
        {w.adds.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <path
              d="M0-18L17-8L14 14L0 20L-14 14L-17-8Z"
              fill="#66563e"
              stroke="#e2cc94"
              strokeWidth="2"
            />
            <text textAnchor="middle" y="5" fill="#f7e7c4" fontSize="12">
              {boss === "council-of-tribes" ? i + 1 : "+"}
            </text>
          </g>
        ))}
        <g transform={`translate(${w.boss.x} ${w.boss.y})`}>
          <path
            d="M-24-8L-16-28L0-19L16-28L24-8L18 20L0 30L-18 20Z"
            fill="#68788d"
            stroke="#b5c8eb"
            strokeWidth="2"
          />
          <path
            d="M-13-3L-4 1M4 1L13-3M-5 15H5"
            stroke="#192632"
            strokeWidth="3"
          />
        </g>
        {w.actors.map((a) => (
          <g
            key={a.id}
            data-kings-player={a.id}
            data-x={a.x.toFixed(2)}
            data-y={a.y.toFixed(2)}
          >
            {a.marked && (
              <path d={`M${a.x} ${a.y - 35}l8 8-8 8-8-8Z`} fill="#cf94aa" />
            )}
            <circle
              cx={a.x}
              cy={a.y}
              r="16"
              fill={a.hurt ? "#623b51" : a.id === "P3" ? "#64543b" : "#2c4466"}
              stroke={
                a.hurt ? "#cf94aa" : a.id === "P3" ? "#e2cc94" : "#b5c8eb"
              }
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
      <span className={styles.npcLabel} style={pos({ x: 300, y: 125 })}>
        {names[boss]}
      </span>
      <span className={styles.arenaLabel} style={pos({ x: 300, y: 40 })}>
        {w.label}
      </span>
    </div>
  );
}
