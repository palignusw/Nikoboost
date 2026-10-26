"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  altarDungeon,
  altarSources,
  altarStudies,
  getAltarStudy,
  type AltarBossId,
} from "@/data/altar-study";
import { tacticsPreview } from "@/data/tactics";
import { wowSeason } from "@/data/season";
import AltarScene from "./AltarScene";
import LiveEncounter from "./LiveEncounter";
import BeginnerGuide, { RolePicker } from "./BeginnerGuide";
import type { LearnerRole } from "@/data/altar-beginner";
import styles from "./altar.module.scss";

export default function AltarGuide({
  bossId = "ravi",
}: {
  bossId?: AltarBossId;
}) {
  const lesson = getAltarStudy(bossId)!;
  const boss = altarDungeon.bosses.find((b) => b.id === bossId)!;
  const [view, setView] = useState<"playback" | "study">("playback");
  const [learnerRole, setLearnerRole] = useState<LearnerRole>("damage");
  const [step, setStep] = useState(0);
  const [mistake, setMistake] = useState(false);
  const [practice, setPractice] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const frame = lesson.frames[step];
  const choice = lesson.options.find((o) => o.id === answer);
  const archived = tacticsPreview.seasonId !== wowSeason.id;
  const visualRef = useRef<HTMLDivElement>(null);
  function revealScene() {
    if (window.matchMedia("(max-width: 850px)").matches)
      visualRef.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  function goTo(n: number) {
    setStep(n);
    setPractice(false);
    setAnswer(null);
    setMistake(false);
    revealScene();
  }
  function changeMode(next: boolean) {
    setPractice(next);
    setAnswer(null);
    setMistake(false);
    revealScene();
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
        <span className={styles.lab}>
          TACTICS LAB <b>FIELD GUIDE</b>
        </span>
        <Link href="/tactics" className={styles.allBosses}>
          All dungeons <span>↗</span>
        </Link>
      </header>
      <main className={styles.main}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/tactics">Tactics Lab</Link>
          <span>/</span>
          <span>Altar of Fangs</span>
        </nav>
        <section className={styles.hero}>
          <Image
            src="/images/dungeons/altar-of-fangs.jpg"
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 1280px"
            className={styles.heroArt}
            priority
          />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              {archived ? "ARCHIVED LESSONS" : tacticsPreview.seasonName}{" "}
              <span> / MYTHIC+</span>
            </p>
            <h1>Altar of Fangs</h1>
            <p>
              Know what to look for.
              <br className={styles.mobileBreak} /> Know your next move.
            </p>
          </div>
          <div className={styles.heroStamp}>
            <span>VISUAL FIELD GUIDE</span>
            <strong>03</strong>
            <small>boss encounters</small>
          </div>
        </section>
        <nav className={styles.bossNav} aria-label="Choose a boss">
          {altarStudies.map((s, i) => (
            <Link
              href={`/tactics/altar-of-fangs/${s.id}`}
              key={s.id}
              aria-current={s.id === bossId ? "page" : undefined}
            >
              <span className={styles.bossNumber}>0{i + 1}</span>
              <div>
                <strong>{altarDungeon.bosses[i].name}</strong>
                <small>{s.focus}</small>
              </div>
              <span className={styles.bossArrow}>↗</span>
            </Link>
          ))}
        </nav>
        <section
          className={styles.encounter}
          aria-labelledby={`encounter-${bossId}`}
        >
          <div className={styles.encounterIntro}>
            <div>
              <p className={styles.eyebrow}>
                ENCOUNTER 0{altarStudies.findIndex((s) => s.id === bossId) + 1}{" "}
                <span> / {lesson.focus.toUpperCase()}</span>
              </p>
              <h2 id={`encounter-${bossId}`}>{boss.name}</h2>
            </div>
            <div className={styles.mechanic}>
              <span>KEY MECHANIC</span>
              <strong>{lesson.mechanic}</strong>
            </div>
          </div>
          <div className={styles.lessonHeader}>
            <div>
              <span className={styles.sectionLabel}>
                {practice ? "CHECK YOUR UNDERSTANDING" : "THE PLAN"}
              </span>
              <h3>{practice ? "Choose the next move." : lesson.objective}</h3>
            </div>
            <button
              className={styles.practiceToggle}
              onClick={() => changeMode(!practice)}
            >
              {practice ? "← Back to lesson" : "Try the situation ↗"}
            </button>
          </div>
          <RolePicker role={learnerRole} onChange={setLearnerRole} />
          <div
            className={styles.viewTabs}
            role="tablist"
            aria-label="Lesson view"
            onKeyDown={(e) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
                return;
              e.preventDefault();
              const current = view === "playback" && !practice ? 0 : 1;
              const next =
                e.key === "Home" ? 0 : e.key === "End" ? 1 : 1 - current;
              setView(next === 0 ? "playback" : "study");
              setPractice(false);
              setMistake(false);
              e.currentTarget
                .querySelectorAll<HTMLButtonElement>('[role="tab"]')
                [next]?.focus();
            }}
          >
            <button
              role="tab"
              id={`playback-tab-${bossId}`}
              aria-controls={`playback-panel-${bossId}`}
              aria-selected={view === "playback" && !practice}
              tabIndex={view === "playback" && !practice ? 0 : -1}
              onClick={() => {
                setView("playback");
                setPractice(false);
                setMistake(false);
              }}
            >
              ▶ Encounter playback
            </button>
            <button
              role="tab"
              id={`study-tab-${bossId}`}
              aria-controls={`study-panel-${bossId}`}
              aria-selected={view === "study" || practice}
              tabIndex={view === "study" || practice ? 0 : -1}
              onClick={() => {
                setView("study");
                setPractice(false);
                setMistake(false);
              }}
            >
              Study steps
            </button>
          </div>
          {view === "playback" && !practice ? (
            <div
              role="tabpanel"
              id={`playback-panel-${bossId}`}
              aria-labelledby={`playback-tab-${bossId}`}
            >
              <LiveEncounter key={bossId} boss={bossId} role={learnerRole} />
            </div>
          ) : (
            <div
              role="tabpanel"
              id={`study-panel-${bossId}`}
              aria-labelledby={`study-tab-${bossId}`}
            >
              <div className={styles.workspace}>
                <div className={styles.visualColumn} ref={visualRef}>
                  <div className={styles.mobileInstruction}>
                    <span>
                      {practice
                        ? "YOUR TURN"
                        : mistake
                          ? "COMMON MISTAKE"
                          : `STEP 0${step + 1} · ${frame.label.toUpperCase()}`}
                    </span>
                    <h3>
                      {practice
                        ? "Choose the next group call."
                        : mistake
                          ? "See what goes wrong."
                          : frame.action}
                    </h3>
                  </div>
                  <div className={styles.eventBar}>
                    <span>TRIGGER</span>
                    <strong>
                      {practice ? lesson.practiceContext : frame.event}
                    </strong>
                  </div>
                  {bossId === "writhing-coil" && step === 0 && !practice && (
                    <div
                      className={styles.kickOrder}
                      aria-label="Suggested interrupt assignments"
                    >
                      <span>1 · FIRST KICK</span>
                      <span>2 · SECOND KICK</span>
                      <span>3 · THIRD KICK</span>
                      <small>
                        Agree a backup · assign actual players before pulling
                      </small>
                    </div>
                  )}
                  <div className={styles.diagram}>
                    <div className={styles.diagramToolbar}>
                      <span className={styles.sceneTag}>
                        <i />
                        {practice
                          ? "YOUR DECISION"
                          : mistake
                            ? "COMMON MISTAKE"
                            : "WORKED EXAMPLE"}
                      </span>
                      <span>TOP VIEW</span>
                    </div>
                    <AltarScene
                      boss={bossId}
                      step={step}
                      mistake={mistake}
                      practice={practice}
                    />
                    <div className={styles.legend} aria-label="Diagram key">
                      <span>
                        <i className={styles.focusKey} />
                        {bossId === "ravi" ? "Your tank" : "You"}
                      </span>
                      <span>
                        <i className={styles.allyKey} />
                        Allies
                      </span>
                      <span>
                        <i className={styles.bossKey} />
                        Boss / adds
                      </span>
                      <span>
                        <i className={styles.dangerKey} />
                        {bossId === "ravi"
                          ? "Wrong pile"
                          : bossId === "writhing-coil"
                            ? "Intact tether"
                            : "Blood pools / danger"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.sceneCaption} data-callout>
                    <span>{practice ? "?" : `0${step + 1}`}</span>
                    <p>
                      {practice
                        ? lesson.practicePrompt
                        : mistake
                          ? lesson.mistakeCue
                          : frame.caption}
                    </p>
                  </div>
                  {practice && choice && (
                    <div
                      className={`${styles.mobileFeedback} ${styles.feedback} ${choice.correct ? styles.correct : styles.incorrect}`}
                      role="status"
                    >
                      <span>
                        {choice.correct ? "✓ GOOD CALL" : "↶ CHECK AGAIN"}
                      </span>
                      <strong>{choice.feedback}</strong>
                      {choice.correct && <p>{lesson.right}</p>}
                    </div>
                  )}
                  {practice && (
                    <div
                      className={styles.choices}
                      aria-label="Choose your response"
                    >
                      {lesson.options.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => setAnswer(o.id)}
                          aria-label={`Choose ${o.id.toUpperCase()}: ${o.label}`}
                          aria-pressed={answer === o.id}
                        >
                          <span>{o.id.toUpperCase()}</span>
                          {o.label}
                          <b>{answer === o.id ? "●" : "↗"}</b>
                        </button>
                      ))}
                    </div>
                  )}
                  {!practice && (
                    <div className={styles.stepNav} aria-label="Lesson steps">
                      {lesson.frames.map((f, i) => (
                        <button
                          key={f.label}
                          aria-current={step === i ? "step" : undefined}
                          onClick={() => goTo(i)}
                        >
                          <span>0{i + 1}</span>
                          <strong>{f.label}</strong>
                          {i < 2 && <b>→</b>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {practice && (
                  <button
                    className={`${styles.reset} ${styles.mobileReset}`}
                    onClick={() => setAnswer(null)}
                  >
                    Reset choice ↺
                  </button>
                )}
                <aside
                  className={`${styles.instructions} ${practice ? styles.practiceAside : ""}`}
                  aria-label="Scene explanation"
                  data-callout
                >
                  {practice ? (
                    <>
                      <p className={styles.eyebrow}>
                        YOUR TURN <span> / NO TIMER</span>
                      </p>
                      <h3>
                        Read the scene.
                        <br />
                        Choose a move.
                      </h3>
                      <p className={styles.hint}>{lesson.practiceContext}</p>
                      {choice ? (
                        <div
                          className={`${styles.feedback} ${choice.correct ? styles.correct : styles.incorrect}`}
                          role="status"
                        >
                          <span>
                            {choice.correct ? "✓ GOOD CALL" : "↶ CHECK AGAIN"}
                          </span>
                          <strong>{choice.feedback}</strong>
                          {choice.correct && <p>{lesson.right}</p>}
                        </div>
                      ) : (
                        <div className={styles.waiting}>
                          <span>01</span>
                          <p>
                            Read the situation.
                            <br />
                            Choose a team response.
                          </p>
                        </div>
                      )}
                      <button
                        className={styles.reset}
                        onClick={() => setAnswer(null)}
                      >
                        Reset choice ↺
                      </button>
                    </>
                  ) : (
                    <>
                      <p className={styles.eyebrow}>
                        STEP 0{step + 1}{" "}
                        <span> / {frame.label.toUpperCase()}</span>
                      </p>
                      <h3>{mistake ? "See what goes wrong." : frame.action}</h3>
                      <div className={styles.explainBlock}>
                        <span>WHAT YOU SEE</span>
                        <p>{mistake ? lesson.mistakeCue : frame.cue}</p>
                      </div>
                      <div
                        className={`${styles.explainBlock} ${mistake ? styles.mistakeBlock : styles.reasonBlock}`}
                      >
                        <span>
                          {mistake ? "WHY IT FAILS" : "WHY IT MATTERS"}
                        </span>
                        <p>{mistake ? lesson.wrong : frame.why}</p>
                      </div>
                      {step > 0 && (
                        <div
                          className={styles.compare}
                          aria-label="Compare the situation"
                        >
                          <button
                            aria-pressed={!mistake}
                            onClick={() => setMistake(false)}
                          >
                            ✓ Correct
                          </button>
                          <button
                            aria-pressed={mistake}
                            onClick={() => setMistake(true)}
                          >
                            × Mistake
                          </button>
                        </div>
                      )}
                      <div className={styles.nextRow}>
                        <button
                          aria-label="Previous step"
                          disabled={step === 0}
                          onClick={() => goTo(step - 1)}
                        >
                          ←
                        </button>
                        <button
                          className={styles.next}
                          onClick={() =>
                            step < 2 ? goTo(step + 1) : changeMode(true)
                          }
                        >
                          {step < 2 ? "Next step" : "Try it yourself"}
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </>
                  )}
                </aside>
              </div>
            </div>
          )}
          <BeginnerGuide key={bossId} boss={bossId} role={learnerRole} />
          <section
            className={styles.executionPlan}
            aria-label="Group execution plan"
          >
            <div>
              <span className={styles.sectionLabel}>
                GROUP PLAN · ADAPT TO YOUR COMPOSITION
              </span>
              <h3>Agree the plan before the pull.</h3>
              <p>
                Published mechanics and route choices, translated into suggested
                team calls.
              </p>
            </div>
            <div className={styles.executionCards}>
              {lesson.calls.map((call, i) => (
                <article key={call.label}>
                  <span>0{i + 1}</span>
                  <h4>{call.label}</h4>
                  <p>{call.text}</p>
                </article>
              ))}
            </div>
          </section>
          <div className={styles.roleSection}>
            <div>
              <span className={styles.sectionLabel}>YOUR JOB</span>
              <h3>Same fight. Different priorities.</h3>
              <p>Role reminders for the encounter.</p>
            </div>
            <div className={styles.roleCards}>
              {(["DPS", "Healer", "Tank"] as const).map((role, i) => (
                <article key={role}>
                  <div>
                    <span>
                      {role === "Tank" ? "◇" : role === "Healer" ? "+" : "↗"}
                    </span>
                    <h4>{role}</h4>
                  </div>
                  <p>{boss.roles[i]}</p>
                </article>
              ))}
            </div>
          </div>
          <details className={styles.notes}>
            <summary>
              Before you pull{" "}
              <span>
                Additional encounter reminders <b>+</b>
              </span>
            </summary>
            <ul>
              {boss.checks.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p>
              This is an execution plan for selected mechanics. Use the linked
              full guides for all abilities and trash.
            </p>
          </details>
        </section>
        <details className={styles.notes}>
          <summary>
            Full-key planning{" "}
            <span>
              Coordinated route choice <b>+</b>
            </span>
          </summary>
          <p>
            Skandar’s published +21–23 route includes bringing a funnel pack
            into a boss pull. That is a route choice, not a requirement of the
            boss mechanic.
          </p>
          <p>
            Our adaptation: use the source pull only with an agreed group plan,
            appropriate damage profile and stop coverage. Do not add a pack just
            because it appears in a title-key route.
          </p>
        </details>
        <section className={styles.evidence} aria-label="Strategy sources">
          <span className={styles.sectionLabel}>
            EVIDENCE · REVIEWED 25 OCT 2026
          </span>
          <h3>Where this plan comes from.</h3>
          <p>
            Player-authored guides establish mechanics. The published high-key
            route supplies a specific group plan; it is not a universal rule for
            every team.
          </p>
          <div>
            {altarSources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                <strong>{s.label} ↗</strong>
                <small>{s.detail}</small>
              </a>
            ))}
          </div>
          <a
            href="https://www.youtube.com/watch?v=z0hO75zq1Vc"
            target="_blank"
            rel="noreferrer"
          >
            Run reference: Method / YoDa · Blood DK +20 ↗
          </a>
          <small>
            The recording is linked for comparison. These lessons are based on
            the cited guides and route notes, not a frame-by-frame analysis of
            that run.
          </small>
        </section>
        <footer className={styles.footer}>
          <div>
            <span className={styles.sectionLabel}>ABOUT THIS GUIDE</span>
            <p>
              Original teaching diagrams. Shapes, positions and movement are
              illustrative; this is not a game map or combat simulator.
            </p>
          </div>
          <div>
            <a
              href="https://www.method.gg/guides/dungeons/altar-of-fangs"
              target="_blank"
              rel="noreferrer"
            >
              Method · Tactyks’ full guide ↗
            </a>
            <p>Guide updated 22 Aug 2026 · Reviewed 25 Oct 2026</p>
            <span className={styles.reviewBadge}>
              INTERACTIVE FIELD GUIDE
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
