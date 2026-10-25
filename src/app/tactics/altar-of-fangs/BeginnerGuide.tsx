"use client";
import type { AltarBossId } from "@/data/altar-study";
import { beginnerMechanics, type LearnerRole } from "@/data/altar-beginner";
import styles from "./beginner.module.scss";
export const roleNames: Record<LearnerRole, string> = {
  damage: "DPS",
  tank: "Tank",
  healer: "Healer",
};
export function RolePicker({
  role,
  onChange,
}: {
  role: LearnerRole;
  onChange: (role: LearnerRole) => void;
}) {
  return (
    <div className={styles.rolePicker}>
      <span>Your role</span>
      <div role="group" aria-label="Your learning role">
        {(Object.keys(roleNames) as LearnerRole[]).map((value) => (
          <button
            key={value}
            aria-pressed={role === value}
            onClick={() => onChange(value)}
          >
            {roleNames[value]}
          </button>
        ))}
      </div>
      <small>
        Advice follows your role. Diagram IDs stay fixed: P1 tank, P2 healer,
        P3–P5 DPS.
      </small>
    </div>
  );
}
export default function BeginnerGuide({
  boss,
  role,
}: {
  boss: AltarBossId;
  role: LearnerRole;
}) {
  return (
    <section className={styles.guide} aria-label="Beginner mechanic guide">
      <header>
        <span>FIRST RUN · {roleNames[role].toUpperCase()}</span>
        <h3>Know what to do when it happens.</h3>
        <p>
          Match the spell or effect you see in game. These cards are reactions,
          not a fixed cast order.
        </p>
      </header>
      <details className={styles.glossary}>
        <summary>New to these terms?</summary>
        <dl>
          <div>
            <dt>Soak</dt>
            <dd>
              Stand inside the specified impact or beam to intercept it. It is
              an intentional hit.
            </dd>
          </div>
          <div>
            <dt>Dodge</dt>
            <dd>Leave the indicated danger area before the attack hits.</dd>
          </div>
          <div>
            <dt>Interrupt / kick</dt>
            <dd>Use your interrupt ability to stop an interruptible cast.</dd>
          </div>
          <div>
            <dt>Defensive</dt>
            <dd>Use an ability that reduces incoming damage.</dd>
          </div>
          <div>
            <dt>Debuff / stacks</dt>
            <dd>
              A harmful effect on your character. Its number shows applications;
              its timer shows time remaining.
            </dd>
          </div>
          <div>
            <dt>Fixate / control</dt>
            <dd>
              An add follows a chosen player. Slow, stun or otherwise control it
              with abilities it is susceptible to.
            </dd>
          </div>
        </dl>
      </details>
      <div className={styles.cards}>
        {beginnerMechanics[boss].map((m, i) => (
          <details
            key={m.id}
            className={styles.card}
            open={i === 0 ? true : undefined}
          >
            <summary>
              <span className={styles.response}>{m.response}</span>
              <strong>{m.name}</strong>
              <span className={styles.expand} aria-hidden="true">
                +
              </span>
            </summary>
            <div className={styles.body}>
              <dl>
                <div>
                  <dt>When you see</dt>
                  <dd>{m.see}</dd>
                </div>
                <div className={styles.action}>
                  <dt>Do this</dt>
                  <dd>{m.action}</dd>
                </div>
                <div>
                  <dt>Continue until</dt>
                  <dd>{m.done}</dd>
                </div>
              </dl>
              <p className={styles.roleNote}>
                <b>{roleNames[role]}:</b> {m.role[role]}
              </p>
              <p className={styles.mistake}>
                <b>Avoid:</b> {m.avoid}
              </p>
              <a href={m.source} target="_blank" rel="noreferrer">
                Spell / journal reference ↗
              </a>
            </div>
          </details>
        ))}
      </div>
      <p className={styles.review}>
        Reviewed 25 Oct 2026 · Spell effects checked against encounter data;
        positioning advice cross-checked with Tactyks and Petko. Blizzard
        hotfixes take priority over older tooltips. The exact Ravi soak count
        remains unverified.
      </p>
    </section>
  );
}
