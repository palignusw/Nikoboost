import Link from "next/link";
import styles from "./service-link.module.scss";

export default function ServiceLink() {
  return (
    <aside className={styles.wrap} aria-label="Mythic+ runs">
      <div className={styles.card}>
        <div>
          <span className={styles.label}>READY FOR YOUR NEXT KEY?</span>
          <h2>Play Mythic+ with NikoBoost</h2>
          <p>Choose your key level and runs, see the price in gold, and reserve a time that works for you.</p>
        </div>
        <Link href="/#mythic">Explore Mythic+ runs <span aria-hidden="true">↗</span></Link>
      </div>
    </aside>
  );
}
