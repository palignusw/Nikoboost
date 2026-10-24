"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  tacticsPreview as defaultLesson,
  type TacticRole,
} from "@/data/tactics";
import CatalogArena from "./CatalogArena";
import {
  tacticsDungeons,
  tacticPath,
  type CatalogLesson,
} from "@/data/tactics-catalog";
import { wowSeason } from "@/data/season";
import styles from "./tactics.module.scss";

const roleKeys: TacticRole[] = ["dps", "healer", "tank"];
const markers = [
  { id: "tank", label: "TANK", symbol: "T", x: 50, y: 37 },
  { id: "healer", label: "HEALER", symbol: "+", x: 33, y: 63 },
  { id: "ally", label: "DPS", symbol: "D", x: 46, y: 70 },
  { id: "melee", label: "DPS", symbol: "D", x: 61, y: 43 },
];

export default function TacticsPreview({
  initialLesson = defaultLesson,
}: {
  initialLesson?: CatalogLesson;
}) {
  const lesson = initialLesson;
  const dungeon = tacticsDungeons.find((d) => d.id === lesson.dungeonId);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<TacticRole>("dps");
  const [playing, setPlaying] = useState(false);
  const [practice, setPractice] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const current = lesson.steps[step];
  const active = playing && step < lesson.steps.length - 1;
  const selected = lesson.choices.find((c) => c.id === answer);
  const target =
    step === 0
      ? { x: 57, y: 65 }
      : step === 1
        ? { x: 77, y: 65 }
        : step === 2
          ? { x: 67, y: 80 }
          : { x: 57, y: 65 };

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setStep(step + 1), 2600);
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [active, step]);

  function goTo(next: number) {
    setPlaying(false);
    setStep(next);
  }
  function switchMode(next: boolean) {
    setPlaying(false);
    setPractice(next);
    setAnswer(null);
    setStep(next ? 0 : step);
  }
  function togglePlay() {
    if (step === lesson.steps.length - 1) {
      setStep(0);
      setPlaying(true);
    } else setPlaying(!playing);
  }
  function choose(id: string) {
    setAnswer(id);
    if (lesson.choices.find((c) => c.id === id)?.correct) setStep(2);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="NikoBoost home">
          <Image
            src="/images/branding/nikoboost-logo-v2.png"
            alt="NikoBoost"
            width={160}
            height={44}
          />
        </Link>
        <div className={styles.labLabel}>
          <span /> TACTICS LAB <b>DESIGN PREVIEW</b>
        </div>
        <Link href="/mythic-plus-rewards" className={styles.back}>
          Rewards & Tools <span>↗</span>
        </Link>
      </header>
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">NikoBoost</Link>
          <span>/</span>
          <Link href="/tactics">Tactics Lab</Link>
          <span>/</span>
          <span>{lesson.dungeon}</span>
        </nav>
        <div
          className={`${styles.heading} ${lesson.scene ? styles.encounterHeading : ""}`}
        >
          <div>
            <p className={styles.eyebrow}>LEARN THE FIGHT. SEE THE ANSWER.</p>
            <h1>
              {lesson.scene ? (
                <>
                  Boss tactics.<span>{lesson.boss}</span>
                </>
              ) : (
                <>
                  Know where <span>to stand.</span>
                </>
              )}
            </h1>
            <p>A mechanic makes more sense when you can see it happen.</p>
          </div>
          <div className={styles.dungeon}>
            <Image
              src={lesson.image}
              alt={lesson.dungeon}
              width={68}
              height={68}
            />
            <div>
              <span>
                {lesson.seasonId === String(wowSeason.id)
                  ? lesson.seasonName
                  : "ARCHIVED LESSON"}{" "}
                · MYTHIC+
              </span>
              <strong>{lesson.dungeon}</strong>
              <small>{lesson.boss}</small>
            </div>
          </div>
        </div>
        {dungeon && (
          <nav className={styles.bossNavigation} aria-label="Boss encounters">
            {dungeon.bosses.map((b) => (
              <Link
                key={b.id}
                href={tacticPath(dungeon, b)}
                aria-current={b.id === lesson.bossId ? "page" : undefined}
              >
                {b.name}
              </Link>
            ))}
          </nav>
        )}
        <div className={styles.workspace}>
          <section
            className={styles.board}
            aria-label="Interactive tactics board"
          >
            <div className={styles.boardTop}>
              <div>
                <span className={styles.liveDot} />
                <strong>{lesson.mechanic}</strong>
                <span className={styles.lessonType}>
                  {lesson.scene
                    ? lesson.scene.kind.toUpperCase()
                    : "POSITIONING"}
                </span>
              </div>
              <span className={styles.sceneCount}>KEY MECHANIC</span>
            </div>
            <div className={styles.toolbar}>
              <div className={styles.segment} aria-label="Lesson mode">
                <button
                  aria-pressed={!practice}
                  onClick={() => switchMode(false)}
                >
                  Walkthrough
                </button>
                <button
                  aria-pressed={practice}
                  onClick={() => switchMode(true)}
                >
                  Try it yourself <span>↗</span>
                </button>
              </div>
              <span className={styles.viewLabel}>TOP-DOWN VIEW</span>
            </div>
            {lesson.scene ? (
              <CatalogArena
                lesson={lesson}
                step={step}
                practice={practice}
                correct={!!selected?.correct}
                answer={answer}
                onChoose={choose}
              />
            ) : (
              <>
                <div className={styles.arena}>
                  <div className={styles.arenaTop}>
                    <span>
                      {practice && !selected?.correct
                        ? "YOUR DECISION"
                        : current.phase}
                    </span>
                    <span>{practice ? "PRACTICE" : `STEP 0${step + 1}`}</span>
                  </div>
                  <svg
                    viewBox="0 0 800 610"
                    role="img"
                    aria-label={`Chillstorm positioning diagram. ${practice ? "Choose a destination using the three buttons on the arena." : current.action}`}
                  >
                    <defs>
                      <radialGradient id="floor">
                        <stop stopColor="#18202e" />
                        <stop offset="1" stopColor="#0c111b" />
                      </radialGradient>
                      <radialGradient id="storm">
                        <stop stopColor="#d75d6b" stopOpacity=".3" />
                        <stop
                          offset=".65"
                          stopColor="#ac4b67"
                          stopOpacity=".13"
                        />
                        <stop
                          offset="1"
                          stopColor="#d75d6b"
                          stopOpacity=".02"
                        />
                      </radialGradient>
                      <pattern
                        id="grid"
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
                        id="arrow"
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
                      fill="url(#floor)"
                      stroke="#293347"
                      strokeWidth="2"
                    />
                    <circle
                      cx="400"
                      cy="305"
                      r="239"
                      fill="url(#grid)"
                      stroke="#8ea5ff"
                      strokeOpacity=".08"
                    />
                    <circle
                      cx="400"
                      cy="305"
                      r="195"
                      fill="none"
                      stroke="#8ea5ff"
                      strokeOpacity=".07"
                      strokeDasharray="3 10"
                    />
                    <path
                      d="M400 57V553M152 305H648"
                      stroke="#8ea5ff"
                      strokeOpacity=".07"
                    />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                      <g key={a} transform={`rotate(${a} 400 305)`}>
                        <path
                          d="M393 70L400 63L407 70L400 77Z"
                          fill="#293347"
                        />
                        <path d="M400 84V96" stroke="#293347" />
                      </g>
                    ))}
                    <text
                      x="400"
                      y="33"
                      textAnchor="middle"
                      className={styles.compass}
                    >
                      N
                    </text>
                    <g transform="translate(400 170)">
                      <circle r="47" fill="#171a27" stroke="#614955" />
                      <circle
                        r="39"
                        fill="none"
                        stroke="#b87877"
                        strokeOpacity=".4"
                      />
                      <path
                        d="M-16 -8L-5 -20L0 -8L5 -20L16 -8L12 13L0 21L-12 13Z"
                        fill="#b68984"
                      />
                      <path
                        d="M-7 1L-2 4M7 1L2 4"
                        stroke="#171a27"
                        strokeWidth="3"
                      />
                      <text
                        y="-63"
                        textAnchor="middle"
                        className={styles.bossLabel}
                      >
                        MELIDRUSSA
                      </text>
                    </g>
                    {!practice && step >= 1 && step < 3 && (
                      <g>
                        <circle
                          cx="616"
                          cy="396"
                          r="76"
                          fill="url(#storm)"
                          stroke="#d75d6b"
                          strokeOpacity=".6"
                          strokeDasharray={step === 1 ? "5 6" : undefined}
                        />
                        <circle
                          cx="616"
                          cy="396"
                          r="58"
                          fill="none"
                          stroke="#d75d6b"
                          strokeOpacity=".3"
                        />
                        <path
                          d="M581 370Q655 360 644 414Q620 447 587 419Q560 392 608 383"
                          fill="none"
                          stroke="#db90a7"
                          strokeOpacity=".5"
                          strokeWidth="2"
                        />
                        <text
                          x="616"
                          y="495"
                          textAnchor="middle"
                          className={styles.dangerLabel}
                        >
                          STORM AREA
                        </text>
                      </g>
                    )}
                    {practice && selected?.correct && (
                      <circle
                        cx="616"
                        cy="396"
                        r="76"
                        fill="url(#storm)"
                        stroke="#d75d6b"
                        strokeOpacity=".6"
                      />
                    )}
                    {!practice && step === 1 && (
                      <path
                        d="M468 405Q530 440 596 406"
                        fill="none"
                        stroke="#8ea5ff"
                        strokeWidth="2"
                        strokeDasharray="6 7"
                        markerEnd="url(#arrow)"
                      />
                    )}
                    {!practice && step === 2 && (
                      <path
                        d="M610 415Q602 486 550 489"
                        fill="none"
                        stroke="#8ea5ff"
                        strokeWidth="2"
                        strokeDasharray="6 7"
                        markerEnd="url(#arrow)"
                      />
                    )}
                    {markers.map((m) => (
                      <g
                        key={m.id}
                        transform={`translate(${m.x * 8} ${m.y * 6.1})`}
                        className={styles.player}
                      >
                        <circle
                          r="17"
                          fill={
                            m.id === "tank"
                              ? "#1f2945"
                              : m.id === "healer"
                                ? "#182f2c"
                                : "#20273b"
                          }
                          stroke={m.id === "healer" ? "#78b887" : "#8ea5ff"}
                        />
                        <text y="5" textAnchor="middle">
                          {m.symbol}
                        </text>
                        <text
                          y="35"
                          textAnchor="middle"
                          className={styles.playerLabel}
                        >
                          {m.label}
                        </text>
                      </g>
                    ))}
                    <g
                      transform={`translate(${target.x * 8} ${target.y * 6.1})`}
                      className={styles.target}
                    >
                      {(step < 2 || (practice && !selected?.correct)) && (
                        <>
                          <circle
                            r="29"
                            fill="#cdb06d"
                            fillOpacity=".07"
                            stroke="#cdb06d"
                            strokeDasharray="3 4"
                          />
                          <path d="M-5 -43L0 -35L5 -43Z" fill="#e4cb8c" />
                        </>
                      )}
                      <circle
                        r="18"
                        fill="#344672"
                        stroke="#b4c2ff"
                        strokeWidth="2"
                      />
                      <text y="5" textAnchor="middle">
                        D
                      </text>
                      <text
                        y="43"
                        textAnchor="middle"
                        className={styles.targetLabel}
                      >
                        {step < 2 ? "MARKED DPS" : "DPS"}
                      </text>
                    </g>
                  </svg>
                  {practice && !selected?.correct && (
                    <div className={styles.destinations}>
                      {lesson.choices.map((choice, i) => (
                        <button
                          key={choice.id}
                          aria-label={choice.label}
                          onClick={() => choose(choice.id)}
                          style={{ left: `${choice.x}%`, top: `${choice.y}%` }}
                          className={
                            answer === choice.id ? styles.wrongChoice : ""
                          }
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className={styles.arenaNote}>
                    <span>⌖</span>{" "}
                    {practice && !selected?.correct
                      ? "Choose where the marked DPS should take the storm."
                      : "Schematic arena · illustrative positions"}
                  </div>
                </div>
              </>
            )}
            <div className={styles.legend}>
              <span>
                <i className={styles.targetDot} />{" "}
                {lesson.scene ? "Focus player" : "Targeted player"}
              </span>
              <span>
                <i className={styles.partyDot} /> Party
              </span>
              <span>
                <i className={styles.dangerDot} /> Danger area
              </span>
              <span className={styles.legendRight}>SCHEMATIC · 5 PLAYERS</span>
            </div>
            {!practice ? (
              <div className={styles.playback}>
                <div className={styles.playerControls}>
                  <button
                    className={styles.playButton}
                    onClick={togglePlay}
                    aria-label={
                      active ? "Pause walkthrough" : "Play walkthrough"
                    }
                  >
                    {active ? "Ⅱ" : "▶"}
                  </button>
                  <div>
                    <strong>
                      {step === 3
                        ? "Walkthrough complete"
                        : "See it step by step"}
                    </strong>
                    <span>Teaching tempo · not in-game timing</span>
                  </div>
                  <button
                    className={styles.restart}
                    aria-label="Restart walkthrough"
                    onClick={() => goTo(0)}
                  >
                    ↺
                  </button>
                  <span className={styles.progressCount}>
                    0{step + 1}
                    <small> / 04</small>
                  </span>
                </div>
                <div className={styles.steps} aria-label="Mechanic steps">
                  {lesson.steps.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => goTo(i)}
                      aria-current={step === i ? "step" : undefined}
                    >
                      <span>
                        <b>{i < step ? "✓" : `0${i + 1}`}</b>
                      </span>
                      <strong>{s.label}</strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.practiceFooter}>
                <strong>
                  {selected?.correct
                    ? lesson.scene?.decision === "action"
                      ? "✓ Response understood"
                      : "✓ Position understood"
                    : lesson.scene?.decision === "action"
                      ? "Which action would you take?"
                      : "Where would you go?"}
                </strong>
                <div>
                  {lesson.choices.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => choose(c.id)}
                      disabled={!!selected?.correct}
                    >
                      {i + 1}. {c.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setAnswer(null);
                    setStep(0);
                  }}
                >
                  Reset practice ↺
                </button>
              </div>
            )}
          </section>
          <aside className={styles.coach} aria-label="Role guidance">
            <div className={styles.coachIntro}>
              <p className={styles.eyebrow}>YOUR PERSPECTIVE</p>
              <h2>
                Same fight.
                <br />
                <span>Your responsibility.</span>
              </h2>
              <p>Choose a role to see what matters to you.</p>
            </div>
            <div className={styles.roles} aria-label="Your role">
              {roleKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  aria-pressed={role === key}
                >
                  <span>{lesson.roles[key].icon}</span>
                  {lesson.roles[key].label}
                </button>
              ))}
            </div>
            <div className={styles.stepText} aria-live="polite">
              <span className={styles.eyebrow}>
                {practice ? "MAKE THE CALL" : `0${step + 1} / THE MECHANIC`}
              </span>
              <h3>
                {practice
                  ? lesson.scene
                    ? "What is the right response?"
                    : "You have the mark. Where next?"
                  : current.title}
              </h3>
              <p>
                {practice
                  ? lesson.scene?.decision === "action"
                    ? "Choose an action from the options below the arena."
                    : "Choose a destination on the arena, or use the numbered options below it."
                  : current.text}
              </p>
              {!practice && (
                <div className={styles.action}>
                  <span>↳</span>
                  {current.action}
                </div>
              )}
            </div>
            {practice && selected && (
              <div
                className={`${styles.feedback} ${selected.correct ? styles.success : styles.error}`}
                role="status"
              >
                <strong>
                  {selected.correct
                    ? "That’s the idea."
                    : lesson.scene?.decision === "action" ? "Try a different action." : "Try a different position."}
                </strong>
                <p>{selected.feedback}</p>
              </div>
            )}
            <div className={styles.roleNote}>
              <span className={styles.eyebrow}>
                {lesson.roles[role].label.toUpperCase()} REMINDER
              </span>
              <h3>{lesson.roles[role].title}</h3>
              <p>{lesson.roles[role].text}</p>
            </div>
            {!practice && (
              <button
                className={styles.tryButton}
                onClick={() => switchMode(true)}
              >
                I get it. Let me try. <span>↗</span>
              </button>
            )}
            {lesson.checks && (
              <div className={styles.encounterNotes}>
                <p className={styles.eyebrow}>ALSO REMEMBER</p>
                <ul>
                  {lesson.checks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
                <Link href="/tactics">All dungeons & bosses →</Link>
              </div>
            )}
            <div className={styles.scope}>
              <span>i</span>
              <p>
                Changing your role changes the advice. The illustrated focus
                player stays the same.
              </p>
            </div>
          </aside>
        </div>
        <footer className={styles.footer}>
          <div>
            <span className={styles.eyebrow}>ONE MECHANIC, CLEARER.</span>
            <p>{lesson.note}</p>
          </div>
          <div>
            <a href={lesson.source.url} target="_blank" rel="noreferrer">
              {lesson.source.label} ↗
            </a>
            <span>
              Reference checked {lesson.checked} · Preview, not a full boss
              guide
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
