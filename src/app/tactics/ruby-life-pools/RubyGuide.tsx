"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  rubyLessons,
  rubySources,
  getRubyLesson,
  type RubyBossId,
  type RubyRole,
} from "@/data/ruby-guide";
import { getRubyState } from "@/data/ruby-playback";
import { useScenePlayback } from "../components/useScenePlayback";
import RubyArena from "./RubyArena";
import styles from "./ruby.module.scss";
const names: Record<RubyRole, string> = {
  tank: "Tank",
  healer: "Healer",
  damage: "DPS",
};
export default function RubyGuide({
  bossId = "melidrussa-chillworn",
}: {
  bossId?: RubyBossId;
}) {
  const lesson = getRubyLesson(bossId)!;
  const playback = useScenePlayback(lesson.duration);
  const [role, setRole] = useState<RubyRole>("damage"),
    [mistake, setMistake] = useState(false),
    [answer, setAnswer] = useState<number | null>(null);
  const world = getRubyState(bossId, playback.time, mistake),
    cue = world.cue;
  const chapter = lesson.cues.findIndex((c) => c.id === cue.id);
  function compare(value: boolean) {
    setMistake(value);
    playback.jump(lesson.failureTime);
  }
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
        <span>DUNGEON TACTICS · FIELD GUIDE</span>
        <Link href="/tactics">All dungeons ↗</Link>
      </header>
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/tactics">Dungeon tactics</Link>
          <span>/</span>
          <span>Ruby Life Pools</span>
        </nav>
        <section className={styles.hero}>
          <Image
            src="/images/dungeons/ruby-life-pools.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 800px) 100vw, 1280px"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <span>MIDNIGHT SEASON 2 · MYTHIC+</span>
            <h1>Ruby Life Pools</h1>
            <p>See the danger. Follow your role. Learn the response.</p>
          </div>
        </section>
        <nav className={styles.bossNav} aria-label="Ruby Life Pools encounters">
          {rubyLessons.map((b, i) => (
            <Link
              key={b.id}
              href={`/tactics/ruby-life-pools/${b.id}`}
              aria-current={bossId === b.id ? "page" : undefined}
            >
              <span>0{i + 1}</span>
              <strong>{b.name}</strong>
              <small>
                {
                  [
                    "Hail / storm / shield",
                    "Add / interrupts / boulder",
                    "Fire / wind / cloudburst",
                  ][i]
                }
              </small>
            </Link>
          ))}
        </nav>
        <section
          className={styles.encounter}
          aria-labelledby="ruby-boss-heading"
        >
          <div className={styles.heading}>
            <div>
              <h2 id="ruby-boss-heading">{lesson.name}</h2>
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
            <div role="group" aria-label="Ruby learning role">
              {(Object.keys(names) as RubyRole[]).map((r) => (
                <button
                  key={r}
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                >
                  {names[r]}
                </button>
              ))}
            </div>
            <small>
              P1 tank · P2 healer · P3–P5 DPS. Gold highlights P3, independently
              of your selected advice.
            </small>
          </div>
          <div className={styles.workspace} data-ruby-playback>
            <div className={styles.visual}>
              <div
                className={`${styles.cueBar} ${world.failure ? styles.failure : ""}`}
              >
                <div>
                  <span>
                    {world.failure
                      ? "CONSEQUENCE"
                      : world.remaining !== null
                        ? "SOURCED EFFECT WINDOW"
                        : "TEACHING SCENE · FOLLOW THE GAME CUE"}
                  </span>
                  <strong>{world.failure ? lesson.mistake : cue.title}</strong>
                </div>
                <div className={styles.timer}>
                  {world.remaining !== null ? (
                    <>
                      <b>{world.remaining.toFixed(1)}s</b>
                      <small>{cue.timerLabel}</small>
                    </>
                  ) : (
                    <small>No fixed timer shown</small>
                  )}
                </div>
              </div>
              <div className={styles.nextMove} aria-label="Ruby next action">
                <span>{names[role].toUpperCase()} · YOUR NEXT MOVE</span>
                <p>{world.failure ? lesson.mistake : cue.role[role]}</p>
              </div>
              <div className={styles.diagram}>
                <p className={styles.focus}>{lesson.focus}</p>
                <RubyArena boss={bossId} world={world} />
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
                    Danger / marked impact
                  </span>
                  <span>
                    <i className={styles.goalDot} />
                    Hazard / objective
                  </span>
                </div>
              </div>
              <div className={styles.controls}>
                <button
                  className={styles.play}
                  onClick={playback.toggle}
                  aria-label={
                    playback.playing
                      ? "Pause Ruby playback"
                      : playback.time >= lesson.duration
                        ? "Replay Ruby scene"
                        : "Play Ruby playback"
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
                  aria-label="Reset Ruby playback"
                >
                  ↺ Reset
                </button>
                <label>
                  Speed
                  <select
                    aria-label="Ruby playback speed"
                    value={playback.speed}
                    onChange={(e) => playback.setSpeed(Number(e.target.value))}
                  >
                    {[0.25, 0.5, 1, 1.5].map((n) => (
                      <option key={n} value={n}>
                        {n}×
                      </option>
                    ))}
                  </select>
                </label>
                <output aria-live="off">
                  Scene {playback.time.toFixed(1)} / {lesson.duration}s
                </output>
                <label className={styles.seek}>
                  <span>
                    Scene position · illustrative sequence, not a pull timer
                  </span>
                  <input
                    aria-label="Ruby scene position"
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
                  aria-label="Previous Ruby scene"
                  disabled={chapter === 0}
                  onClick={() => playback.jump(lesson.cues[chapter - 1].start)}
                >
                  ←
                </button>
                <label>
                  <span>Jump to mechanic</span>
                  <select
                    aria-label="Ruby mechanic chapter"
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
                  aria-label="Next Ruby scene"
                  disabled={chapter === lesson.cues.length - 1}
                  onClick={() => playback.jump(lesson.cues[chapter + 1].start)}
                >
                  →
                </button>
              </div>
            </div>
            <aside
              className={styles.instructions}
              aria-label="Ruby scene explanation"
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
              {cue.source && (
                <p className={styles.timing}>
                  <a href={cue.source} target="_blank" rel="noreferrer">
                    Effect timing reference ↗
                  </a>
                </p>
              )}
              <p className={styles.scope}>
                Positions, movement speed, damage outcomes and gaps between
                mechanics are illustrative. This is a teaching sequence, not a
                full combat replay.
              </p>
            </aside>
          </div>
          <div className={styles.party} aria-label="Ruby party status">
            {world.actors.map((a) => (
              <article key={a.id} className={a.hurt ? styles.marked : ""}>
                <div>
                  <strong>{a.id}</strong>
                  <span>{a.role}</span>
                  {a.marked && <b>◆ MARK</b>}
                  {a.hurt && <b>DAMAGE</b>}
                </div>
                <p>{a.status}</p>
              </article>
            ))}
          </div>
          <div className={styles.compare}>
            <span>Compare the outcome</span>
            <div role="group" aria-label="Ruby outcome comparison">
              <button aria-pressed={!mistake} onClick={() => compare(false)}>
                ✓ Correct response
              </button>
              <button aria-pressed={mistake} onClick={() => compare(true)}>
                × Common mistake
              </button>
            </div>
            <p>
              {mistake
                ? lesson.mistake
                : "The group handles the highlighted mechanic."}{" "}
              Replay or use the chapter menu to inspect the setup.
            </p>
          </div>
          {bossId === "melidrussa-chillworn" && (
            <p className={styles.scope}>
              <Link href="/tactics/ruby-life-pools/chillstorm-practice">
                Practise Chillstorm placement on the interactive floor ↗
              </Link>
            </p>
          )}
          <section
            className={styles.reference}
            aria-label="Ruby reaction cards"
          >
            <span>FIRST RUN · REACTION CARDS</span>
            <h3>Recognise the cue. Know what to do.</h3>
            <div className={styles.cards}>
              {lesson.cues.map((c) => (
                <details key={c.id}>
                  <summary>
                    {c.title}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <dl>
                    <div>
                      <dt>Action</dt>
                      <dd>{c.action}</dd>
                    </div>
                    <div>
                      <dt>Finish when</dt>
                      <dd>{c.done}</dd>
                    </div>
                    <div>
                      <dt>{names[role]}</dt>
                      <dd>{c.role[role]}</dd>
                    </div>
                  </dl>
                </details>
              ))}
            </div>
          </section>
          <section
            className={styles.practice}
            aria-label="Ruby practice decision"
          >
            <span>CHECK YOUR UNDERSTANDING</span>
            <h3>{lesson.question}</h3>
            <div>
              {lesson.choices.map((c, i) => (
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
              <p role="status" aria-label="Ruby practice feedback">
                <strong>
                  {answer === lesson.correct ? "✓ Good call." : "↶ Try again."}
                </strong>{" "}
                {answer === lesson.correct
                  ? lesson.choices[lesson.correct]
                  : "Look at the mechanic cue and the required position, then choose again."}
              </p>
            )}
          </section>
          <details className={styles.sources}>
            <summary>Sources, review & scene limits</summary>
            <p>
              Reviewed 27 October 2026 against Tactyks, Petko and the encounter
              journal. Scenes illustrate responses rather than exact timing,
              scale or a complete combat replay.
            </p>
            <p>
              Chillstorm pulls players inward and explodes outward. Wind can
              move both players and fire puddles. Follow the live game cues and
              leave room to react.
            </p>
            <div>
              {Object.entries(rubySources).map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer">
                  {
                    {
                      method: "Tactyks · Method",
                      petko: "Petko · Icy Veins",
                      journal: "Encounter journal · Wowhead",
                    }[name as keyof typeof rubySources]
                  }{" "}
                  ↗
                </a>
              ))}
            </div>
          </details>
        </section>
        <footer className={styles.footer}>
          <Link href="/tactics">← All dungeons</Link>
          <span>Interactive field guide · follow live encounter cues</span>
          <Link href="/tactics/temple-of-sethraliss">
            Temple of Sethraliss ↗
          </Link>
        </footer>
      </main>
    </div>
  );
}
