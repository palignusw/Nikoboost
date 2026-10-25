"use client";
import { useId } from "react";
import type { AltarBossId } from "@/data/altar-study";
import {
  beamSources,
  beamSlots,
  getPlaybackState,
} from "@/data/altar-playback";
import { Player, Boss, Pile, Serpent } from "./AltarScene";
import styles from "./playback.module.scss";

export default function LiveArena({
  boss,
  time,
}: {
  boss: AltarBossId;
  time: number;
}) {
  const state = getPlaybackState(boss, time),
    uid = useId().replace(/:/g, ""),
    floor = `live-floor-${uid}`;
  const groups: (typeof state.actors)[] = [];
  const remaining =
    boss === "zuljan" && time >= 13 && time < 24 ? state.actors.slice(1) : [];
  while (remaining.length) {
    const group = [remaining.pop()!];
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (let i = remaining.length - 1; i >= 0; i--) {
        if (
          group.some(
            (a) => Math.hypot(a.x - remaining[i].x, a.y - remaining[i].y) < 48,
          )
        ) {
          group.push(remaining.splice(i, 1)[0]);
          expanded = true;
        }
      }
    }
    if (group.length > 1) groups.push(group);
  }
  const groupedIds = new Set(groups.flatMap((g) => g.map((a) => a.id)));
  const visibleActors = state.actors.filter((a) => !groupedIds.has(a.id));
  const clusters = groups.map((g) => {
    const x = g.reduce((sum, a) => sum + a.x, 0) / g.length,
      y = g.reduce((sum, a) => sum + a.y, 0) / g.length;
    const ids = g.map((a) => a.id).sort();
    return {
      x,
      y,
      ids,
      label: ids.length === 4 ? "P2–P5" : ids.join("+"),
      marked: g.some((a) => a.marked),
      focus: ids.includes("P5"),
      stacked: g.every((a) => Math.hypot(a.x - x, a.y - y) < 5),
    };
  });
  return (
    <div className={styles.arenaWrap}>
      <svg
        viewBox="0 0 600 420"
        className={styles.arena}
        role="img"
        aria-label="Animated encounter: player IDs match the party cards below. Positions and paths are illustrative."
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
          strokeOpacity=".15"
        />
        {boss === "ravi" && (
          <>
            {[
              { x: 105, y: 130 },
              { x: 105, y: 310 },
              { x: 490, y: 130 },
            ].map((p, i) => (
              <Pile key={i} {...p} corpse={time >= 3 && i < 2} />
            ))}
            {state.soaks.map((s) => (
              <g key={s.player}>
                {!s.covered && (
                  <path
                    d={`M${state.actors.find((a) => a.id === s.player)!.x} ${state.actors.find((a) => a.id === s.player)!.y}L${s.x} ${s.y}`}
                    stroke="#a6baff"
                    strokeDasharray="3 5"
                    opacity=".5"
                  />
                )}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r="32"
                  fill={s.covered ? "#80b49a" : "#a6baff"}
                  fillOpacity=".1"
                  stroke={s.covered ? "#9ec9b1" : "#c2cfff"}
                  strokeWidth="2"
                  strokeDasharray={s.covered ? undefined : "5 5"}
                />
                <circle
                  cx={s.x}
                  cy={s.y}
                  r="7"
                  fill="#c6d7ff"
                  fillOpacity={s.covered ? 0 : 0.5}
                />
              </g>
            ))}
          </>
        )}
        {boss === "zuljan" &&
          time < 13 &&
          beamSources.map((p, i) => (
            <g key={i}>
              <path
                d={
                  state.beams
                    ? `M${p.x} ${p.y}L${beamSlots[i].x} ${beamSlots[i].y}`
                    : `M${p.x} ${p.y}L300 210`
                }
                opacity={state.beams ? 1 : 0.3}
                strokeDasharray={state.beams ? undefined : "5 8"}
                stroke="#a7c2b8"
                strokeWidth="3"
              />
              <path
                d={`M${beamSlots[i].x} ${beamSlots[i].y}L300 210`}
                stroke="#5b6977"
                strokeDasharray="3 7"
                opacity=".3"
              />
              <path
                d={`M${p.x - 14} ${p.y + 18}V${p.y - 13}L${p.x} ${p.y - 24}L${p.x + 14} ${p.y - 13}V${p.y + 18}Z`}
                fill="#384249"
                stroke="#9caeaa"
              />
            </g>
          ))}
        {state.clearPath && (
          <path
            d="M300 210L550 379"
            fill="none"
            stroke="#d2b98d"
            strokeOpacity=".28"
            strokeWidth="28"
            strokeDasharray="5 5"
          />
        )}
        {state.pools.map((p, i) => (
          <ellipse
            key={i}
            cx={p.x}
            cy={p.y}
            rx="29"
            ry="21"
            fill="#874c60"
            fillOpacity=".45"
            stroke="#bb788e"
            strokeWidth="1.5"
          />
        ))}
        {state.reform &&
          [
            { x: 100, y: 40 },
            { x: 510, y: 40 },
            { x: 560, y: 300 },
            { x: 300, y: 390 },
            { x: 45, y: 300 },
          ].map((p, i) => (
            <path
              key={i}
              d={`M300 210L${p.x} ${p.y}`}
              stroke="#d58ba0"
              strokeWidth="11"
              opacity=".18"
            />
          ))}
        {state.tethers.map((t) => (
          <path
            key={t.actor.id}
            d={`M300 210L${t.actor.x} ${t.actor.y}`}
            stroke={t.broken ? "#64758a" : "#c38195"}
            strokeWidth="3"
            strokeDasharray={t.broken ? "3 14" : "7 4"}
            opacity={t.broken ? 0.15 : 0.9}
          />
        ))}
        {state.adds.map((p, i) => (
          <g key={i}>
            {time < 29 && (
              <path
                d={`M${p.x} ${p.y}L${state.actors[i].x} ${state.actors[i].y}`}
                stroke="#c39ab4"
                strokeDasharray="2 7"
                opacity=".4"
              />
            )}
            <g transform={`translate(${p.x} ${p.y})`}>
              <Serpent small />
              {time >= 22 && time < 29 && (
                <circle
                  r="26"
                  stroke="#a9baff"
                  fill="none"
                  strokeDasharray="3 5"
                  opacity=".7"
                />
              )}
            </g>
          </g>
        ))}
        {state.interruptPlayer && (
          <g>
            <path
              d={`M${state.interruptPlayer.x} ${state.interruptPlayer.y}L${state.bossPosition.x} ${state.bossPosition.y}`}
              stroke="#c8d6ff"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            <circle
              cx={state.bossPosition.x}
              cy={state.bossPosition.y}
              r="51"
              fill="none"
              stroke="#d8e3ff"
              strokeWidth="2"
            />
          </g>
        )}
        {state.bossVisible && (
          <Boss
            id={boss}
            {...state.bossPosition}
            shield={state.shield !== null}
          />
        )}
        {state.shield !== null && (
          <path
            d={`M${state.bossPosition.x - 40} ${state.bossPosition.y - 66}h${80 * state.shield}`}
            stroke="#bed0ff"
            strokeWidth="5"
          />
        )}
        {visibleActors.map((a) => (
          <g
            key={a.id}
            data-player={a.id}
            data-x={a.x.toFixed(2)}
            data-y={a.y.toFixed(2)}
          >
            {a.venom && (
              <circle
                cx={a.x}
                cy={a.y}
                r="28"
                fill="none"
                stroke="#b1c883"
                strokeDasharray={
                  boss === "zuljan" && time >= 21.65 ? "3 4" : undefined
                }
                strokeWidth="2"
              />
            )}
            <Player
              {...a}
              tank={a.role === "Tank"}
              focus={boss === "ravi" ? a.id === "P1" : a.id === "P5"}
            />
            {a.marked && (
              <path
                d={`M${a.x + 15} ${a.y - 22}l6 6-6 6-6-6Z`}
                fill={boss === "zuljan" ? "#e1abbe" : "#cba6c0"}
              />
            )}
          </g>
        ))}
        {clusters.map((g) => (
          <g key={g.label} transform={`translate(${g.x} ${g.y})`}>
            <circle r="30" fill="#263546" stroke="#b1c883" strokeWidth="2" />
            <Player x={0} y={0} focus={g.focus} />
            <circle
              cx="23"
              cy="-22"
              r="12"
              fill="#a8badb"
              stroke="#111b26"
              strokeWidth="2"
            />
            <text
              x="23"
              y="-18"
              textAnchor="middle"
              fontSize="12"
              fill="#0c1726"
            >
              {g.ids.length}
            </text>
            {g.marked && <path d="M-15 -22l6 6-6 6-6-6Z" fill="#e1abbe" />}
          </g>
        ))}
        {state.projectile && (
          <g
            transform={`translate(${state.projectile.x} ${state.projectile.y}) rotate(35)`}
          >
            <path
              d="M0-15V15M-10-10Q16-20 16 0L0-3"
              stroke="#e3c6a2"
              strokeWidth="4"
              fill="#b6c6d9"
            />
          </g>
        )}
      </svg>
      {visibleActors.map((a) => (
        <span
          key={a.id}
          className={styles.actorId}
          style={{ left: `${a.x / 6}%`, top: `${(a.y + 33) / 4.2}%` }}
        >
          {a.id}
        </span>
      ))}
      {clusters.map((g) => (
        <span
          key={g.label}
          className={styles.stackId}
          style={{ left: `${g.x / 6}%`, top: `${(g.y + 40) / 4.2}%` }}
        >
          {g.label}
          {g.stacked ? " · stacked" : ""}
        </span>
      ))}
    </div>
  );
}
