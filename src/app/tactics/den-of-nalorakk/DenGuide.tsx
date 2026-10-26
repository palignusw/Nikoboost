"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  denLessons,
  denSources,
  getDenLesson,
  type DenBossId,
  type DenRole,
} from "@/data/den-guide";
import { getDenState } from "@/data/den-playback";
import { useScenePlayback } from "../components/useScenePlayback";
import DenArena from "./DenArena";
import styles from "./den.module.scss";
const roleNames: Record<DenRole, string> = {
  tank: "Tank",
  healer: "Healer",
  damage: "DPS",
};
const clock = (n: number) => `00:${Math.floor(n).toString().padStart(2, "0")}`;
const failureTime: Record<DenBossId, number> = {
  hoardmonger: 18.5,
  "sentinel-of-winter": 22.5,
  nalorakk: 22.5,
};
const missed: Record<DenBossId, string> = {
  hoardmonger: "Mushroom left to burst",
  "sentinel-of-winter": "Rimeshatter A left empty",
  nalorakk: "One charge lane uncovered",
};
export default function DenGuide({
  bossId = "hoardmonger",
}: {
  bossId?: DenBossId;
}) {
  const lesson = getDenLesson(bossId)!;
  const playback = useScenePlayback(lesson.duration);
  const [role, setRole] = useState<DenRole>("damage"),
    [mistake, setMistake] = useState(false),
    [answer, setAnswer] = useState<number | null>(null);
  const world = getDenState(bossId, playback.time, mistake),
    cue = world.cue;
  const cueIndex = lesson.cues.findIndex((c) => c.id === cue.id);
  function compare(value: boolean) {
    setMistake(value);
    playback.jump(failureTime[bossId]);
  }
  const event = world.failure
    ? missed[bossId]
    : bossId === "hoardmonger" && cue.id === "mushroom" && world.mushroomCaught
      ? "Mushroom collected · poison needs support"
      : cue.title;
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" aria-label="NikoBoost home">
          <Image
            src="/images/branding/nikoboost-logo-v2.png"
            width={143}
            height={39}
            alt="NikoBoost"
          />
        </Link>
        <span>TACTICS LAB · FIELD GUIDE</span>
        <Link href="/tactics">All dungeons ↗</Link>
      </header>
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/tactics">Tactics Lab</Link>
          <span>/</span>
          <span>Den of Nalorakk</span>
        </nav>
        <section className={styles.hero}>
          <Image
            src="/images/dungeons/den-of-nalorakk.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 800px) 100vw, 1280px"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <span>MIDNIGHT SEASON 2 · MYTHIC+</span>
            <h1>Den of Nalorakk</h1>
            <p>Read the cue. Make the move. Know when you are safe.</p>
          </div>
        </section>
        <nav className={styles.bossNav} aria-label="Den encounters">
          {denLessons.map((b, i) => (
            <Link
              key={b.id}
              href={`/tactics/den-of-nalorakk/${b.id}`}
              aria-current={b.id === bossId ? "page" : undefined}
            >
              <span>0{i + 1}</span>
              <strong>{b.name}</strong>
              <small>
                {i === 0
                  ? "Resources / mushrooms"
                  : i === 1
                    ? "Squalls / shards / snowdrifts"
                    : "Marks / shield / interceptions"}
              </small>
            </Link>
          ))}
        </nav>
        <section
          className={styles.encounter}
          aria-labelledby="den-boss-heading"
        >
          <div className={styles.heading}>
            <div>
              <span>
                ENCOUNTER 0{denLessons.findIndex((d) => d.id === bossId) + 1}
              </span>
              <h2 id="den-boss-heading">{lesson.name}</h2>
              <p>{lesson.subtitle}</p>
            </div>
            <span className={styles.paused}>
              {playback.playing
                ? "PLAYING"
                : playback.time === lesson.duration
                  ? "SCENE ENDED"
                  : "PAUSED"}
            </span>
          </div>
          <div className={styles.roles}>
            <span>Your role</span>
            <div role="group" aria-label="Den learning role">
              {(Object.keys(roleNames) as DenRole[]).map((r) => (
                <button
                  key={r}
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                >
                  {roleNames[r]}
                </button>
              ))}
            </div>
            <small>
              Advice changes with your role. Diagram IDs stay fixed: P1 tank ·
              P2 healer · P3–P5 DPS.
            </small>
          </div>
          <div className={styles.workspace} data-den-playback>
            <div className={styles.visual}>
              <div
                className={`${styles.cueBar} ${world.failure ? styles.failure : ""}`}
              >
                <div>
                  <span>
                    {world.failure
                      ? "MISSED COVERAGE"
                      : world.remaining !== null
                        ? "SOURCED REACTION WINDOW"
                        : "TEACHING SCENE · FOLLOW THE GAME CUE"}
                  </span>
                  <strong>{event}</strong>
                </div>
                <div className={styles.timer}>
                  {world.remaining !== null ? (
                    <>
                      <b>{world.remaining.toFixed(1)}s</b>
                      <small>
                        {cue.id === "maul"
                          ? "until marks resolve"
                          : cue.id === "mushroom"
                            ? "until this mushroom bursts"
                            : "until shard impact"}
                      </small>
                    </>
                  ) : (
                    <small>
                      {world.failure
                        ? "Consequence shown"
                        : cue.id === "mushroom" && world.mushroomCaught
                          ? "Collected"
                          : "No fixed timer shown"}
                    </small>
                  )}
                </div>
              </div>
              <div className={styles.nextMove} aria-label="Den next action">
                <span>
                  {roleNames[role].toUpperCase()} · {cue.response}
                </span>
                <p>
                  {world.failure
                    ? bossId === "hoardmonger"
                      ? "An uncovered mushroom bursts and applies poison to the group. Cover it before the deadline."
                      : bossId === "sentinel-of-winter"
                        ? "An empty Rimeshatter triggers group damage and a root. A player must hold it through impact."
                        : "The uncovered echo reaches Zul’jarra and triggers Demoralizing Scream. Cover every actual lane."
                    : cue.role[role]}
                </p>
              </div>
              <div className={styles.diagram}>
                <p className={styles.focus}>{lesson.focus}</p>
                <DenArena boss={bossId} world={world} />
                <div className={styles.legend}>
                  <span>
                    <i />
                    Party
                  </span>
                  <span>
                    <i className={styles.focusDot} />
                    P3 / focus
                  </span>
                  <span>
                    <i className={styles.dangerDot} />
                    Dodge / danger
                  </span>
                  <span>
                    <i className={styles.goalDot} />
                    Intentional soak / useful ground
                  </span>
                </div>
              </div>
              <div className={styles.controls}>
                <button
                  className={styles.play}
                  onClick={playback.toggle}
                  aria-label={
                    playback.playing
                      ? "Pause Den playback"
                      : playback.time >= lesson.duration
                        ? "Replay Den scene"
                        : "Play Den playback"
                  }
                >
                  {playback.playing
                    ? "Ⅱ Pause"
                    : playback.time >= lesson.duration
                      ? "↺ Replay"
                      : "▶ Play"}
                </button>
                <button
                  onClick={() => playback.jump(0)}
                  aria-label="Reset Den playback"
                >
                  ↺ Reset
                </button>
                <label>
                  Speed
                  <select
                    aria-label="Den playback speed"
                    value={playback.speed}
                    onChange={(e) => playback.setSpeed(Number(e.target.value))}
                  >
                    <option value={0.25}>0.25×</option>
                    <option value={0.5}>0.5×</option>
                    <option value={1}>1×</option>
                    <option value={1.5}>1.5×</option>
                  </select>
                </label>
                <output aria-live="off">
                  Scene {clock(playback.time)} / {clock(lesson.duration)}
                </output>
                <label className={styles.seek}>
                  <span>
                    Scene position · authored sequence, not a pull timer
                  </span>
                  <input
                    aria-label="Den scene position"
                    type="range"
                    min={0}
                    max={lesson.duration}
                    step={0.1}
                    value={playback.time}
                    onChange={(e) => playback.jump(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className={styles.jumpRow}>
                <button
                  aria-label="Previous Den scene"
                  disabled={cueIndex === 0}
                  onClick={() => playback.jump(lesson.cues[cueIndex - 1].start)}
                >
                  ←
                </button>
                <label>
                  <span>Jump to mechanic</span>
                  <select
                    aria-label="Den mechanic chapter"
                    value={cue.id}
                    onChange={(e) =>
                      playback.jump(
                        lesson.cues.find((c) => c.id === e.target.value)!.start,
                      )
                    }
                  >
                    {lesson.cues.map((c, i) => (
                      <option key={c.id} value={c.id}>
                        {i + 1}. {c.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  aria-label="Next Den scene"
                  disabled={cueIndex === lesson.cues.length - 1}
                  onClick={() => playback.jump(lesson.cues[cueIndex + 1].start)}
                >
                  →
                </button>
              </div>
            </div>
            <aside
              className={styles.instructions}
              aria-label="Den scene explanation"
            >
              <span>RIGHT NOW</span>
              <h3>{cue.title}</h3>
              <dl>
                <div>
                  <dt>Do this</dt>
                  <dd>{cue.action}</dd>
                </div>
                <div>
                  <dt>Continue until</dt>
                  <dd>{cue.done}</dd>
                </div>
              </dl>
              {cue.window && (
                <p className={styles.timing}>
                  {cue.window}s is the sourced{" "}
                  {cue.id === "maul"
                    ? "mark/cast window"
                    : cue.id === "mushroom"
                      ? "growth lifetime of each mushroom"
                      : "post-death shard delay"}
                  .{" "}
                  <a href={cue.source} target="_blank" rel="noreferrer">
                    Timing reference ↗
                  </a>
                </p>
              )}
              <p className={styles.scope}>
                Movement, damage, upgrade/death outcomes and gaps between
                mechanics use teaching time. This is a selected example, not a
                complete boss rotation.
              </p>
            </aside>
          </div>
          <div className={styles.party} aria-label="Den party status">
            {world.actors.map((a) => (
              <article
                key={a.id}
                className={
                  a.marked ? styles.marked : a.poison ? styles.poison : ""
                }
              >
                <div>
                  <strong>{a.id}</strong>
                  <span>{a.role}</span>
                  {a.marked && <b>◆ MARK</b>}
                  {a.poison && <b>POISON</b>}
                </div>
                <p>{a.status}</p>
              </article>
            ))}
          </div>
          <div className={styles.compare}>
            <span>Compare the outcome</span>
            <div role="group" aria-label="Den outcome comparison">
              <button aria-pressed={!mistake} onClick={() => compare(false)}>
                ✓ Covered
              </button>
              <button aria-pressed={mistake} onClick={() => compare(true)}>
                × Missed coverage
              </button>
            </div>
            <p>
              {mistake
                ? missed[bossId]
                : "The group covers the illustrated mechanic."}{" "}
              · Replay from the start or use the scene menu to inspect the
              setup.
            </p>
          </div>
          <section
            className={styles.reference}
            aria-label="Den beginner reference"
          >
            <span>FIRST RUN · REACTION CARDS</span>
            <h3>Recognise the spell. Choose the right response.</h3>
            <p>
              These are cues to react to, not a guaranteed cast order. “Soak”
              means take the specified hit intentionally; “dodge” means leave
              its area. Never swap the two.
            </p>
            <div className={styles.cards}>
              {lesson.mechanics.map((m) => (
                <details key={m.name}>
                  <summary>
                    {m.name}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <dl>
                    <div>
                      <dt>When you see</dt>
                      <dd>{m.trigger}</dd>
                    </div>
                    <div>
                      <dt>Do this</dt>
                      <dd>{m.action}</dd>
                    </div>
                    <div>
                      <dt>Continue until</dt>
                      <dd>{m.done}</dd>
                    </div>
                  </dl>
                  <a href={m.source} target="_blank" rel="noreferrer">
                    Mechanic reference ↗
                  </a>
                </details>
              ))}
            </div>
          </section>
          <section
            className={styles.practice}
            aria-label="Den practice decision"
          >
            <span>CHECK YOUR UNDERSTANDING</span>
            <h3>{lesson.practice.question}</h3>
            <div>
              {lesson.practice.choices.map((c, i) => (
                <button
                  key={c}
                  aria-pressed={answer === i}
                  onClick={() => setAnswer(i)}
                >
                  {String.fromCharCode(65 + i)} · {c}
                </button>
              ))}
            </div>
            {answer !== null && (
              <p role="status" aria-label="Den practice feedback">
                <strong>
                  {answer === lesson.practice.correct
                    ? "✓ Good call."
                    : "↶ Try again."}
                </strong>{" "}
                {answer === lesson.practice.correct
                  ? lesson.practice.feedback
                  : "Check what this mechanic requires: position, dodge, intentional coverage or protection. You can choose again."}
              </p>
            )}
          </section>
          <details className={styles.sources}>
            <summary>Sources, review & scene limits</summary>
            <p>Reviewed 26 Oct 2026. {lesson.limits}</p>
            <p>
              Source spell windows are shown separately from teaching time. No
              exact map scale, damage prediction, full combat log or fixed
              mushroom/tornado count is claimed.
            </p>
            <div>
              {[
                { label: "Tactyks · Method · 14 Oct", url: denSources.method },
                { label: "Petko · Icy Veins · 12 Oct", url: denSources.petko },
                { label: "Encounter journal", url: denSources.journal },
                {
                  label: "Sentinel coordinated plan",
                  url: denSources.winterPlan,
                },
                { label: "Blizzard · 23 Oct hotfix", url: denSources.hotfix },
              ].map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </details>
        </section>
        <footer className={styles.footer}>
          <Link href="/tactics">← All dungeons</Link>
          <span>
            Interactive field guide · gold-only services are separate from this
            lesson
          </span>
          <Link href="/tactics/altar-of-fangs">Altar of Fangs ↗</Link>
        </footer>
      </main>
    </div>
  );
}
