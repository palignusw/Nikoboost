"use client";
import { useEffect, useRef, useState } from "react";
import type { AltarBossId } from "@/data/altar-study";
import { altarPlayback, getPlaybackState } from "@/data/altar-playback";
import LiveArena from "./LiveArena";
import { altarMechanics } from "@/data/altar-mechanics";
import styles from "./playback.module.scss";
const clock = (s: number) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;

export default function LiveEncounter({ boss }: { boss: AltarBossId }) {
  const timeline = altarPlayback[boss];
  const [position, setPosition] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1);
  const positionRef = useRef(0);
  const state = getPlaybackState(boss, position),
    cue = state.current;
  function seek(next: number) {
    const p = Math.max(0, Math.min(timeline.duration, next));
    positionRef.current = p;
    setPosition(p);
  }
  function pauseAt(next: number) {
    setPlaying(false);
    seek(next);
  }
  function toggle() {
    if (positionRef.current >= timeline.duration) seek(0);
    setPlaying((p) => !p);
  }
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      last = performance.now(),
      lastRender = last;
    const tick = (now: number) => {
      if (now - lastRender >= 16) {
        const next = Math.min(
          timeline.duration,
          positionRef.current + ((now - last) / 1000) * speed,
        );
        positionRef.current = next;
        setPosition(next);
        last = now;
        lastRender = now;
        if (next >= timeline.duration) {
          setPlaying(false);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const hide = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", hide);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [playing, speed, timeline.duration]);
  const phaseTitles =
    boss === "ravi"
      ? ["Stomp / piles", "Pre-position", "Shield / chunks"]
      : boss === "writhing-coil"
        ? ["Three interrupts", "Break all links", "Uncoil / reform"]
        : ["Cast / beams", "Edge / Boneslicer", "Blood / reset"];
  const milestones = phaseTitles.map((title, phase) => ({
    title,
    time: timeline.cues.find((c) => c.phase === phase)!.start,
  }));
  return (
    <section className={styles.player} aria-label="Encounter playback">
      <div className={styles.playbackHeader}>
        <div>
          <span>ENCOUNTER PLAYBACK</span>
          <h3>Watch the call become movement.</h3>
        </div>
        <span className={styles.state}>
          {playing
            ? "PLAYING"
            : position === timeline.duration
              ? "SCENE ENDED"
              : "PAUSED"}
        </span>
      </div>
      <div className={styles.workspace}>
        <div className={styles.visual}>
          <div
            className={`${styles.cast} ${cue.kind === "event" ? styles.event : ""}`}
          >
            <div>
              <span>
                {cue.kind === "cast"
                  ? "BOSS CAST"
                  : cue.kind === "channel"
                    ? "CHANNEL"
                    : cue.kind === "condition"
                      ? "CONDITION-BASED"
                      : cue.kind === "movement"
                        ? "MOVEMENT EXAMPLE"
                        : "EVENT"}
              </span>
              <strong>{cue.title}</strong>
            </div>
            <div className={styles.castValue}>
              {state.remaining === null ? (
                <span>
                  {cue.kind === "condition"
                    ? "No fixed deadline"
                    : "Teaching transition"}
                </span>
              ) : (
                <>
                  <b>{state.remaining.toFixed(1)}s</b>
                  <small>
                    {cue.kind === "channel"
                      ? "channel remaining"
                      : "cast remaining"}
                  </small>
                </>
              )}
            </div>
            <div
              className={styles.castTrack}
              role={state.castProgress === null ? undefined : "progressbar"}
              aria-label={
                state.castProgress === null
                  ? undefined
                  : `${cue.title} progress`
              }
              aria-valuemin={state.castProgress === null ? undefined : 0}
              aria-valuemax={state.castProgress === null ? undefined : 100}
              aria-valuenow={
                state.castProgress === null
                  ? undefined
                  : Math.round(state.castProgress * 100)
              }
            >
              <i
                style={{
                  width: `${state.castProgress === null ? 100 : state.castProgress * 100}%`,
                }}
              />
            </div>
          </div>
          <div className={styles.diagram}>
            <LiveArena boss={boss} time={position} />
            <div className={styles.legend}>
              <span>
                <i className={styles.gold} />
                Focus player
              </span>
              <span>
                <i />
                Party
              </span>
              <span>
                <i className={styles.venom} />
                Venom / check stacks
              </span>
              <span>
                <i className={styles.mark} />
                Cast target / fixate
              </span>
            </div>
          </div>
          <div className={styles.controls}>
            <button
              onClick={toggle}
              className={styles.play}
              aria-label={
                playing
                  ? "Pause encounter playback"
                  : position === timeline.duration
                    ? "Replay encounter"
                    : "Play encounter playback"
              }
            >
              {playing
                ? "Ⅱ Pause"
                : position === timeline.duration
                  ? "↺ Replay"
                  : "▶ Play"}
            </button>
            <button
              onClick={() => pauseAt(0)}
              aria-label="Reset encounter playback"
            >
              ↺ Reset
            </button>
            <label>
              Speed
              <select
                aria-label="Playback speed"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={0.25}>0.25×</option>
                <option value={0.5}>0.5×</option>
                <option value={1}>1×</option>
                <option value={1.5}>1.5×</option>
              </select>
            </label>
            <output aria-live="off">
              Scene {clock(position)} / {clock(timeline.duration)}
            </output>
            <label className={styles.seek}>
              <span>Scene position</span>
              <input
                type="range"
                aria-label="Scene position"
                aria-valuetext={`${position.toFixed(1)} scene seconds. ${cue.title}`}
                min={0}
                max={timeline.duration}
                step={0.1}
                value={position}
                onChange={(e) => pauseAt(Number(e.target.value))}
              />
            </label>
          </div>
          <nav className={styles.chapters} aria-label="Playback chapters">
            {milestones.map((m, i) => (
              <button
                key={m.title}
                aria-current={cue.phase === i ? "step" : undefined}
                onClick={() => pauseAt(m.time)}
              >
                <span>0{i + 1}</span>
                {m.title}
              </button>
            ))}
          </nav>
        </div>
        <aside className={styles.callout}>
          <span className={styles.kicker}>RIGHT NOW</span>
          <div role="status" aria-label="Playback event" aria-atomic="true">
            <h3>{cue.title}</h3>
            <p>{cue.instruction}</p>
          </div>
          <div className={styles.target}>
            <span>WHO ACTS / WHO IS TARGETED</span>
            <strong>{cue.target}</strong>
          </div>
          <div className={styles.timing}>
            <span>
              {cue.verifiedDuration
                ? "SOURCED SPELL VALUE"
                : "TEACHING TIME / CONDITIONAL EVENT"}
            </span>
            <p>
              {cue.verifiedDuration
                ? `${cue.verifiedDuration}s ${cue.kind === "channel" ? "channel" : "cast"}${cue.interrupted ? " · interrupted early in this example" : ""}. Movement and the gaps between abilities are illustrative.`
                : cue.kind === "condition"
                  ? "The game mechanic ends on its condition. The scene’s clock is not a fixed reaction deadline."
                  : "This transition is shortened or spaced for clarity; it does not define the boss’s actual timer."}
            </p>
            {cue.source && (
              <a href={cue.source} target="_blank" rel="noreferrer">
                Timing source ↗
              </a>
            )}
          </div>
          <p className={styles.scope}>
            One authored sequence, not live game data or a complete boss
            rotation. Example targets and group assignments can differ in your
            run.
          </p>
        </aside>
      </div>
      <div className={styles.party} aria-label="Party status">
        {state.actors.map((a) => (
          <article
            key={a.id}
            className={
              a.marked ? styles.targeted : a.venom ? styles.hasVenom : ""
            }
          >
            <div>
              <strong>{a.id}</strong>
              <span>{a.role}</span>
              {boss === "zuljan" && a.venom && (
                <b className={styles.venomBadge}>
                  {position < 21.65 ? "VENOM" : "CHECK STACKS"}
                </b>
              )}
              {a.marked && <b>{boss === "zuljan" ? "◆ TARGET" : "◆ FIXATE"}</b>}
            </div>
            <p>{a.status}</p>
          </article>
        ))}
      </div>
      <details className={styles.mechanicsAudit}>
        <summary>Mechanic checks & scene limits · 25 Oct 2026</summary>
        <ul>
          {altarMechanics[boss].checked.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{altarMechanics[boss].limits}</p>
        <div>
          {altarMechanics[boss].sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              {source.label} ↗
            </a>
          ))}
        </div>
      </details>
      <p className={styles.footnote}>
        At 1×, sourced cast/channel seconds match playback seconds. Other
        movement, gaps and damage outcomes use teaching time. Slow down or pause
        to inspect a moment.
      </p>
    </section>
  );
}
