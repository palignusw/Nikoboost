import Link from "next/link";
import { serviceContent } from "@/data/season";
import styles from "./ServiceGuide.module.scss";

export default function ServiceGuide() {
  const content = serviceContent.home.overview;
  return (
    <section className={styles.section} aria-labelledby="service-guide-heading">
      <div className={styles.intro}>
        <span>BOOK WITH A CLEAR PLAN</span>
        <h2 id="service-guide-heading">{content.heading}</h2>
        <p>{content.intro}</p>
      </div>
      <div className={styles.grid}>
        {content.cards.map((card) => (
          <article key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
      <nav className={styles.links} aria-label="Related WoW services and tools">
        <Link href="/mythic-plus-rewards">
          Plan your Mythic+ Vault rewards <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/delves">
          Explore Delves runs and gold prices <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/gold-prices">
          Compare Mythic+ and Delves gold prices{" "}
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </section>
  );
}
