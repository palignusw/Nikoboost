
import Link from "next/link";
import styles from "./HowItWorks.module.scss";

type StepIcon = "settings" | "send" | "shield" | "swords";

const steps: {
  number: string;
  icon: StepIcon;
  title: string;
  text: string;
}[] = [
    {
      number: "01",
      icon: "settings",
      title: "Configure your run",
      text: "Choose your key level, number of runs, participation mode, dungeons and loot options.",
    },
    {
      number: "02",
      icon: "send",
      title: "Send your details",
      text: "Enter your BattleTag, realm and preferred contact method. No account registration required.",
    },
    {
      number: "03",
      icon: "shield",
      title: "We confirm the run",
      text: "We check team availability, confirm the final details and arrange a start time with you.",
    },
    {
      number: "04",
      icon: "swords",
      title: "Join & complete",
      text: "Join the group, complete your Mythic+ runs and receive eligible tradable loot from your selected traders.",
    },
  ];

function StepIconGraphic({ name }: { name: StepIcon }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "settings":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 17h16" />
          <circle cx="9" cy="7" r="2.5" fill="#202d51" />
          <circle cx="16" cy="17" r="2.5" fill="#202d51" />
        </svg>
      );

    case "send":
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "swords":
      return (
        <svg {...common}>
          <path d="m14.5 17.5 3-3L6.5 3.5 3 3l.5 3.5 11 11Z" />
          <path d="m13 19 6-6" />
          <path d="m16 16 4 4" />
          <path d="M19 5 5 19" />
          <path d="M3 21 7 17" />
        </svg>
      );
  }
}

export default function HowItWorks() {
  return (
    <section id="how" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              SIMPLE PROCESS
            </span>

            <h2>
              How it
              <span> works.</span>
            </h2>
          </div>

          <p>
            From configuration to your run in four
            simple steps. No unnecessary registration.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => (

            <a
              href="#mythic"
              className={styles.card}
              key={step.number}
              aria-label={`${step.title} — Go to Mythic+ configurator`}
            >
              <div className={styles.top}>
                <span className={styles.number}>
                  {step.number}
                </span>

                {index < steps.length - 1 && (
                  <span
                    className={styles.arrow}
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </div>

              <div className={styles.iconBox}>
                <StepIconGraphic name={step.icon} />
              </div>

              <div className={styles.cardContent}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>

              <div className={styles.cardGlow} />
            </a>

          ))}
        </div>

        <div className={styles.bottom}>
          <div>
            <span className={styles.statusDot} />
            <p>Ready when you are.</p>
          </div>

          <Link href="#mythic">
            Configure Mythic+
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
