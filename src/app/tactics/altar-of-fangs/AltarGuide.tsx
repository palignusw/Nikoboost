"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  altarDungeon,
  altarStudies,
  getAltarStudy,
  type AltarBossId,
} from "@/data/altar-study";
import { tacticsPreview } from "@/data/tactics";
import { wowSeason } from "@/data/season";
import AltarScene from "./AltarScene";
import styles from "./altar.module.scss";

export default function AltarGuide({
  bossId = "ravi",
}: {
  bossId?: AltarBossId;
}) {
  const lesson = getAltarStudy(bossId)!;
  const boss = altarDungeon.bosses.find((b) => b.id === bossId)!;
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
        <section className={styles.encounter} aria-labelledby="encounter-name">
          <div className={styles.encounterIntro}>
            <div>
              <p className={styles.eyebrow}>
                ENCOUNTER 0{altarStudies.findIndex((s) => s.id === bossId) + 1}{" "}
                <span> / {lesson.focus.toUpperCase()}</span>
              </p>
              <h2 id="encounter-name">{boss.name}</h2>
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
                    ? "Choose a position on the scene."
                    : mistake
                      ? "See what goes wrong."
                      : frame.action}
                </h3>
              </div>
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
                  answer={answer}
                  onChoose={setAnswer}
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
                        : "Uncovered beam"}
                  </span>
                </div>
              </div>
              <div className={styles.sceneCaption} data-callout>
                <span>{practice ? "?" : `0${step + 1}`}</span>
                <p>
                  {practice
                    ? bossId === "ravi"
                      ? "Look at the piles, then choose A, B or C."
                      : bossId === "writhing-coil"
                        ? "Follow the gold player’s link. Where should you go?"
                        : "Three allies have a beam. Which position covers the missing one?"
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
                  <p>{choice.correct ? lesson.right : lesson.wrong}</p>
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
                    Make the call.
                  </h3>
                  <p className={styles.hint}>
                    Use a letter on the diagram or a response below it. You can
                    change your choice.
                  </p>
                  {choice ? (
                    <div
                      className={`${styles.feedback} ${choice.correct ? styles.correct : styles.incorrect}`}
                      role="status"
                    >
                      <span>
                        {choice.correct ? "✓ GOOD CALL" : "↶ CHECK AGAIN"}
                      </span>
                      <strong>{choice.feedback}</strong>
                      <p>{choice.correct ? lesson.right : lesson.wrong}</p>
                    </div>
                  ) : (
                    <div className={styles.waiting}>
                      <span>01</span>
                      <p>
                        Find the gold player.
                        <br />
                        Choose where to go next.
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
                    STEP 0{step + 1} <span> / {frame.label.toUpperCase()}</span>
                  </p>
                  <h3>{mistake ? "See what goes wrong." : frame.action}</h3>
                  <div className={styles.explainBlock}>
                    <span>WHAT YOU SEE</span>
                    <p>{mistake ? lesson.mistakeCue : frame.cue}</p>
                  </div>
                  <div
                    className={`${styles.explainBlock} ${mistake ? styles.mistakeBlock : styles.reasonBlock}`}
                  >
                    <span>{mistake ? "WHY IT FAILS" : "WHY IT MATTERS"}</span>
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
                      <span>→</span>
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
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
              The visual lesson covers one mechanic. Use the full guide for the
              rest of the encounter.
            </p>
          </details>
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
              DESIGN REVIEW · NOT INDEXED
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
