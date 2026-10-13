
import Link from "next/link";
import styles from "./Hero.module.scss";

const benefits = [
  {
    number: "01",
    title: "Pay with gold",
    text: "In-game currency",
  },
  {
    number: "02",
    title: "EU & NA",
    text: "Choose your region",
  },
  {
    number: "03",
    title: "No registration",
    text: "Book in minutes",
  },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Cinematic background */}

      <div className={styles.artwork} aria-hidden="true">
        <video
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero/midnight-hero.jpg"
          disablePictureInPicture
        >
          <source
            src="/videos/midnight-hero.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.ambient} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <div className={styles.season}>
            <span className={styles.seasonDot} />
            WORLD OF WARCRAFT
            <span className={styles.seasonDivider} />
            MIDNIGHT SEASON 2
          </div>

          <div className={styles.headline}>
            <span className={styles.headlineTop}>
              YOUR NEXT
            </span>

            <h1 className={styles.title}>
              MYTHIC+
              <span> ADVENTURE.</span>
            </h1>
          </div>

          <p className={styles.description}>
            Conquer the toughest keys with experienced
            players. Customize your Mythic+ runs,
            choose your dungeons and reserve your spot
            in just a few clicks.
          </p>

          <div className={styles.actions}>
            <Link
              href="#mythic"
              className={styles.primary}
            >
              <span>Build Your Run</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <Link
              href="#how"
              className={styles.secondary}
            >
              How It Works
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className={styles.trustLine}>
            <span className={styles.trustDot} />
            <span>
              MYTHIC+ BOOSTING • IN-GAME GOLD
            </span>
          </div>
        </div>

        <div
          className={styles.artCaption}
          aria-hidden="true"
        >
          <span className={styles.captionLine} />
          <div>
            <strong>AZEROTH AWAITS</strong>
            <span>MIDNIGHT • SEASON 02</span>
          </div>
        </div>
      </div>

      <div className={styles.benefitWrap}>
        <div className={`container ${styles.benefitInner}`}>
          {benefits.map((benefit) => (
            <div
              className={styles.benefit}
              key={benefit.number}
            >
              <span className={styles.benefitNumber}>
                {benefit.number}
              </span>

              <div>
                <strong>{benefit.title}</strong>
                <span>{benefit.text}</span>
              </div>
            </div>
          ))}

          <Link
            href="#mythic"
            className={styles.benefitLink}
          >
            Configure Now
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className={styles.bottomFade} aria-hidden="true" />
    </section>
  );
}
