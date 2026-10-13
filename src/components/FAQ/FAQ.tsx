
import Link from "next/link";
import styles from "./FAQ.module.scss";

const questions = [
  {
    question: "Do I need to create an account?",
    answer:
      "No. You can configure and reserve your Mythic+ run without creating a NikoBoost account. We only ask for the details needed to arrange your order.",
  },
  {
    question: "How do I pay?",
    answer:
      "NikoBoost currently works with in-game gold. The exact payment and run details are confirmed with you before the run starts.",
  },
  {
    question: "Do you need access to my WoW account?",
    answer:
      "No. You keep control of your account and join the run yourself. We never ask for your Battle.net password.",
  },
  {
    question: "Can I play normally during the run?",
    answer:
      "Yes. Choose I Play if you want to participate normally with the group. You can also choose AFK / Minimal Participation, which costs more because the group has to carry more of the run.",
  },
  {
    question: "Can I choose specific dungeons?",
    answer:
      "Yes. You can distribute your purchased runs between multiple dungeons. For example, if you buy 4 runs, you can choose 2 Altar of Fangs and 2 Den of Nalorakk, or leave some runs as Any Dungeon.",
  },
  {
    question: "What are loot traders?",
    answer:
      "Loot traders are group members whose eligible tradable loot matches your armor type. When possible, eligible items they do not need can be offered to you. Loot drops themselves are never guaranteed.",
  },
  {
    question: "Why are some loot trader options unavailable?",
    answer:
      "Group composition limits how many matching armor-type traders can be included. The configurator automatically shows the maximum available option for your class and armor type.",
  },
  {
    question: "Can I choose Tank or Healer?",
    answer:
      "Yes, if your class supports that role. Tank and Healer orders may cost more because the boosting group has fewer composition options.",
  },
  {
    question: "When will my run start?",
    answer:
      "After you submit your reservation, we confirm team availability and arrange a start time with you. Higher keys, specific dungeons and special loot setups may require more time to organize.",
  },
  {
    question: "Is the run guaranteed to be completed in time?",
    answer:
      "The team will aim to complete the run successfully, but Mythic+ runs can be affected by wipes, disconnects and other in-game factors. Any special timing requirement should be confirmed before the run.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.intro}>
            <div className={styles.introContent}>
              <span className={styles.eyebrow}>
                NEED TO KNOW
              </span>

              <h2>
                Frequently asked
                <span> questions.</span>
              </h2>

              <p>
                Everything you need to know before
                reserving your Mythic+ run.
              </p>

              <div className={styles.helpInfo}>
                <span className={styles.helpIcon}>
                  ?
                </span>

                <div>
                  <strong>Ready to get started?</strong>
                  <span>
                    Configure your run in a few
                    simple steps.
                  </span>
                </div>
              </div>

              <Link
                href="#mythic"
                className={styles.configure}
              >
                Configure Your Run
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className={styles.questions}>
            <div className={styles.questionsHeading}>
              <span>COMMON QUESTIONS</span>
              <span>{questions.length} QUESTIONS</span>
            </div>

            {questions.map((item, index) => (
              <details
                className={styles.item}
                key={item.question}
                name="nikoboost-faq"
              >
                <summary>
                  <div className={styles.questionContent}>
                    <span className={styles.number}>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>{item.question}</strong>
                  </div>

                  <span
                    className={styles.plus}
                    aria-hidden="true"
                  />
                </summary>

                <div className={styles.answer}>
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
