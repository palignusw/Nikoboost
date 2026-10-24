"use client";
import type { CatalogLesson } from "@/data/tactics-catalog";
import styles from "./tactics.module.scss";

export default function CatalogArena({
  lesson,
  step,
  practice,
  correct,
  answer,
  onChoose,
}: {
  lesson: CatalogLesson;
  step: number;
  practice: boolean;
  correct: boolean;
  answer: string | null;
  onChoose: (id: string) => void;
}) {
  const scene = lesson.scene!;
  const kind = scene.kind;
  const beamSoak = lesson.bossId === "galvazzt" || lesson.bossId === "zuljan";
  const phase = practice ? (correct ? 2 : 0) : step;
  const goal = lesson.choices[0];
  const start = { x: 57, y: 65 };
  const end =
    kind === "orbs"
      ? { x: 77, y: 80 }
      : kind === "spread"
        ? { x: 67, y: 80 }
        : { x: goal.x, y: goal.y };
  const focus =
    phase === 0 || phase === 3
      ? start
      : phase === 1
        ? { x: goal.x, y: goal.y }
        : end;
  const actor = scene.actor;
  const symbol = actor === "tank" ? "T" : actor === "healer" ? "+" : "D";
  const actors = [
    { id: "tank", x: 50, y: 37, s: "T" },
    { id: "healer", x: 33, y: 63, s: "+" },
    { id: "ally", x: 46, y: 70, s: "D" },
    { id: "melee", x: 61, y: 43, s: "D" },
  ].filter((a) => a.id !== actor);
  if (actor !== "dps") actors.push({ id: "extra-dps", x: 58, y: 72, s: "D" });
  const active = phase > 0 && phase < 3;
  const showChoices = practice && !correct && scene.decision === "position";
  const positional = scene.decision === "position";
  const floor = `${lesson.id}-floor`;
  const grid = `${lesson.id}-grid`;
  const arrow = `${lesson.id}-arrow`;
  const point = (x: number, y: number) => `${x * 8} ${y * 6.1}`;
  const zone = (
    x: number,
    y: number,
    r: number,
    color: string,
    label?: string,
  ) => (
    <g>
      <circle
        cx={x * 8}
        cy={y * 6.1}
        r={r}
        fill={color}
        fillOpacity=".12"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      {label && (
        <text
          x={x * 8}
          y={y * 6.1 + r + 17}
          textAnchor="middle"
          className={styles.dangerLabel}
        >
          {label}
        </text>
      )}
    </g>
  );
  return (
    <div className={styles.arena}>
      <div className={styles.arenaTop}>
        <span>
          {practice && !correct ? "YOUR DECISION" : lesson.steps[phase].phase}
        </span>
        <span>{practice ? "PRACTICE" : `STEP 0${step + 1}`}</span>
      </div>
      <svg
        viewBox="0 0 800 610"
        role="img"
        aria-label={`${lesson.mechanic} tactics diagram. ${lesson.steps[0].text}`}
      >
        <defs>
          <radialGradient id={floor}>
            <stop stopColor="#18202e" />
            <stop offset="1" stopColor="#0c111b" />
          </radialGradient>
          <pattern
            id={grid}
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M32 0H0V32"
              fill="none"
              stroke="#8ea5ff"
              strokeOpacity=".055"
            />
          </pattern>
          <marker
            id={arrow}
            markerWidth="8"
            markerHeight="8"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path
              d="M0 0L6 3L0 6"
              fill="none"
              stroke="#8ea5ff"
              strokeWidth="1.3"
            />
          </marker>
        </defs>
        <circle
          cx="400"
          cy="305"
          r="248"
          fill={`url(#${floor})`}
          stroke="#293347"
          strokeWidth="2"
        />
        <circle
          cx="400"
          cy="305"
          r="239"
          fill={`url(#${grid})`}
          stroke="#8ea5ff"
          strokeOpacity=".08"
        />
        <circle
          cx="400"
          cy="305"
          r="195"
          fill="none"
          stroke="#8ea5ff"
          strokeOpacity=".08"
          strokeDasharray="3 10"
        />
        <path
          d="M400 57V553M152 305H648"
          stroke="#8ea5ff"
          strokeOpacity=".07"
        />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path
            key={a}
            d="M393 70L400 63L407 70L400 77Z"
            transform={`rotate(${a} 400 305)`}
            fill="#293347"
          />
        ))}
        <text x="400" y="33" textAnchor="middle" className={styles.compass}>
          N
        </text>
        {kind === "frontal" && lesson.bossId !== "ziekket" && active && (
          <path
            d="M400 170L505 450Q400 490 295 450Z"
            fill="#d75d6b"
            fillOpacity=".18"
            stroke="#d75d6b"
            strokeOpacity=".7"
          />
        )}
        {kind === "spread" &&
          active &&
          (lesson.bossId === "tazrah" ||
          lesson.bossId === "lightwarden-ruia" ? (
            <path
              d={`M400 170L${point(focus.x - 4, focus.y + 10)}L${point(focus.x + 4, focus.y + 10)}Z`}
              fill="#d75d6b"
              fillOpacity=".2"
              stroke="#d75d6b"
            />
          ) : (
            zone(77, 65, 67, "#d75d6b", "LEAVE CLEAR")
          ))}
        {kind === "move" &&
          lesson.bossId !== "ravi" &&
          active &&
          zone(50, 65, 65, "#d75d6b", "LEAVE THIS AREA")}
        {kind === "soak" && (
          <g>
            {beamSoak && (
              <path
                d="M640 396L400 170M232 360L400 170M480 490L400 170"
                stroke="#cdb06d"
                strokeOpacity={phase === 2 ? 0.3 : 0.7}
                strokeWidth="3"
                strokeDasharray="8 5"
              />
            )}
            {zone(65, 47, 25, "#78b887")}
            {zone(36, 47, 25, "#78b887")}
            {zone(56, 63, 25, "#78b887")}
            {lesson.bossId === "zuljan" && (
              <>
                <path
                  d="M200 230L400 170"
                  stroke="#cdb06d"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
                {zone(36, 31, 25, "#78b887")}
              </>
            )}
          </g>
        )}
        {lesson.bossId === "ravi" && (
          <g>
            {[0, 1, 2].map((n) => (
              <g
                key={n}
                transform={`translate(${n === 0 ? 616 : 250 + n * 90} ${n === 0 ? 396 : 320 + n * 70})`}
              >
                <circle
                  r="31"
                  fill="#302a27"
                  stroke={n === 0 ? "#cdb06d" : "#6b6270"}
                />
                <path
                  d="M-14 -8L14 8M-14 8L14 -8"
                  stroke="#a69e95"
                  strokeWidth="4"
                />
                {n > 0 && <circle r="15" fill="#813c4a" />}
              </g>
            ))}
          </g>
        )}
        {lesson.bossId === "sentinel-of-winter" && active && (
          <g>
            {[0, 1, 2].map((n) => (
              <path
                key={n}
                d={`M${290 + n * 45} 365q-30 12 0 24q30 12 0 24`}
                stroke="#b4c2ff"
                strokeWidth="3"
                fill="none"
              />
            ))}
          </g>
        )}
        {lesson.bossId === "ikuzz" && (
          <g>
            {[0, 1, 2, 3].map((n) => (
              <path
                key={n}
                d={`M${230 + n * 54} 410l12 -35l-2 18l20 -8l-18 25`}
                stroke="#78b887"
                strokeWidth="3"
                fill="none"
              />
            ))}
          </g>
        )}
        {lesson.bossId === "nalorakk" && (
          <path
            d="M345 283Q400 260 455 283L445 305Q400 325 355 305Z"
            fill="#344672"
            stroke="#8ea5ff"
            strokeWidth="2"
          />
        )}
        {lesson.bossId === "ziekket" && (
          <g>
            <circle cx="500" cy="350" r="22" fill="#403840" stroke="#cdb06d" />
            {active && (
              <path
                d="M400 170L540 425"
                stroke="#cdb06d"
                strokeOpacity=".5"
                strokeWidth="20"
              />
            )}
            <text
              x="500"
              y="398"
              textAnchor="middle"
              className={styles.bossLabel}
            >
              DEFEATED ADD
            </text>
          </g>
        )}
        {kind === "hide" && (
          <g>
            <path
              d="M400 170L660 540L720 450Z"
              fill="#8ea5ff"
              fillOpacity=".08"
            />
            <rect
              x="494"
              y="270"
              width="52"
              height="55"
              rx="8"
              fill="#34303b"
              stroke="#cdb06d"
            />
            <path
              d="M499 282H541M499 312H541"
              stroke="#cdb06d"
              strokeOpacity=".5"
            />
            {zone(78, 68, 30, "#78b887", "SEPARATE COVER")}
          </g>
        )}
        {kind === "tether" && phase < 2 && (
          <path
            d={`M400 170L${point(focus.x, focus.y)}`}
            stroke="#cdb06d"
            strokeWidth="2"
            strokeDasharray="4 7"
          />
        )}
        {kind === "orbs" && (
          <g>
            {zone(75, 60, 38, "#b393d7", "SINGULARITY")}
            <circle
              cx={phase === 2 ? 600 : 520}
              cy={phase === 2 ? 366 : 300}
              r="20"
              fill="#31394c"
              stroke="#c0c8dd"
            />
            {phase === 2 && (
              <text
                x="600"
                y="315"
                textAnchor="middle"
                className={styles.bossLabel}
              >
                ORB CLEARED
              </text>
            )}
            <path
              d="M520 300Q570 330 600 366"
              stroke="#8ea5ff"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5 6"
              markerEnd={`url(#${arrow})`}
            />
          </g>
        )}
        {kind === "gateway" && (
          <g>
            <path
              d={phase === 2 ? "M160 460H640" : "M160 290H640"}
              stroke="#d75d6b"
              strokeWidth="15"
              strokeOpacity=".3"
            />
            <ellipse
              cx="560"
              cy="396"
              rx="20"
              ry="31"
              fill="#1b2440"
              stroke="#a897e8"
            />
            <ellipse
              cx="240"
              cy="256"
              rx="20"
              ry="31"
              fill="#1b2440"
              stroke="#a897e8"
            />
            <path
              d="M550 390Q400 450 248 270"
              stroke="#8ea5ff"
              fill="none"
              strokeDasharray="6 6"
              markerEnd={`url(#${arrow})`}
            />
          </g>
        )}
        {kind === "rescue" &&
          [0, 1, 2, 3].map((n) => (
            <g
              key={n}
              transform={`translate(${n % 2 ? 576 : 224} ${n < 2 ? 260 : 440})`}
            >
              <rect
                x="-24"
                y="-33"
                width="48"
                height="66"
                rx="8"
                fill="#242432"
                stroke={n === 1 ? "#cdb06d" : "#526078"}
                strokeWidth={n === 1 ? 3 : 1}
              />
              {n === 1 && (
                <text y="5" textAnchor="middle" fill="#e4cb8c" fontSize="23">
                  !
                </text>
              )}
            </g>
          ))}
        {kind === "adds" && (
          <g>
            <g transform="translate(544 317)">
              <circle r="28" fill="#342331" stroke="#cdb06d" />
              <text y="5" textAnchor="middle" fill="#dcb5c1" fontSize="13">
                !
              </text>
            </g>
            <text
              x="544"
              y="365"
              textAnchor="middle"
              className={styles.bossLabel}
            >
              {lesson.bossId === "kystia-manaheart"
                ? "NIBBLES"
                : "PRIORITY ADD"}
            </text>
            {phase === 2 && (
              <path
                d="M510 300L575 340M575 300L510 340"
                stroke="#8ea5ff"
                strokeWidth="2"
              />
            )}
          </g>
        )}
        <g
          transform={
            lesson.bossId === "ravi" && active
              ? "translate(616 325)"
              : "translate(400 170)"
          }
        >
          <circle
            r="47"
            fill={kind === "heal" ? "#182f2c" : "#171a27"}
            stroke={kind === "heal" ? "#78b887" : "#614955"}
          />
          <circle r="39" fill="none" stroke="#b87877" strokeOpacity=".4" />
          {kind === "heal" ? (
            <path d="M-5 -19H5V-5H19V5H5V19H-5V5H-19V-5H-5Z" fill="#78b887" />
          ) : (
            <path
              d="M-16 -8L-5 -20L0 -8L5 -20L16 -8L12 13L0 21L-12 13Z"
              fill="#b68984"
            />
          )}
          <text y="-65" textAnchor="middle" className={styles.bossLabel}>
            {kind === "heal" ? "FRIENDLY OBJECTIVE" : lesson.boss.toUpperCase()}
          </text>
        </g>
        {kind === "swap" && (
          <g>
            <circle
              cx="400"
              cy="170"
              r="55"
              fill="#8ea5ff"
              fillOpacity=".08"
              stroke="#8ea5ff"
              strokeDasharray="5 5"
            />
            <circle cx="560" cy="210" r="37" fill="#302432" stroke="#cdb06d" />
            <text
              x="400"
              y="248"
              textAnchor="middle"
              className={styles.bossLabel}
            >
              IMMUNE
            </text>
            <text
              x="560"
              y="268"
              textAnchor="middle"
              className={styles.bossLabel}
            >
              ATTACK
            </text>
          </g>
        )}
        {kind === "interrupt" && (
          <g>
            <rect
              x="290"
              y="255"
              width="220"
              height="20"
              rx="5"
              fill="#222b3c"
            />
            <rect
              x="290"
              y="255"
              width={phase === 2 ? 0 : phase === 1 ? 185 : 90}
              height="20"
              rx="5"
              fill="#b66d80"
            />
            <text
              x="400"
              y="298"
              textAnchor="middle"
              className={styles.bossLabel}
            >
              {phase === 2 ? "INTERRUPTED" : lesson.mechanic.toUpperCase()}
            </text>
          </g>
        )}
        {kind === "heal" && phase === 2 && (
          <path
            d="M440 350Q420 270 400 220"
            fill="none"
            stroke="#78b887"
            strokeWidth="5"
            strokeDasharray="6 7"
          />
        )}
        {actors.map((a) => (
          <g
            key={a.id}
            transform={`translate(${point(a.x, a.y)})`}
            className={styles.player}
          >
            <circle
              r="17"
              fill={a.id === "healer" ? "#182f2c" : "#20273b"}
              stroke={a.id === "healer" ? "#78b887" : "#8ea5ff"}
            />
            <text y="5" textAnchor="middle">
              {a.s}
            </text>
          </g>
        ))}
        {positional && active && (
          <path
            d={`M${point(start.x, start.y)}Q${point(66, 78)} ${point(focus.x, focus.y)}`}
            fill="none"
            stroke="#8ea5ff"
            strokeWidth="2"
            strokeDasharray="6 7"
            markerEnd={`url(#${arrow})`}
          />
        )}
        <g
          transform={`translate(${point(focus.x, focus.y)})`}
          className={styles.target}
        >
          <circle
            r="29"
            fill="#cdb06d"
            fillOpacity=".07"
            stroke="#cdb06d"
            strokeDasharray="3 4"
          />
          <circle r="18" fill="#344672" stroke="#b4c2ff" strokeWidth="2" />
          <text y="5" textAnchor="middle">
            {symbol}
          </text>
          <text y="44" textAnchor="middle" className={styles.targetLabel}>
            FOCUS {actor.toUpperCase()}
          </text>
        </g>
      </svg>
      {showChoices && (
        <div className={styles.destinations}>
          {lesson.choices.map((c, i) => (
            <button
              key={c.id}
              aria-label={c.label}
              onClick={() => onChoose(c.id)}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              className={answer === c.id ? styles.wrongChoice : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <div className={styles.arenaNote}>
        ⌖{" "}
        {practice && !correct
          ? positional
            ? "Choose a position, or use the options below."
            : "Choose an action using the options below."
          : "Schematic only · not measured game geometry"}
      </div>
    </div>
  );
}
