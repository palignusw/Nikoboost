import Link from "next/link";
import { serviceContent } from "@/data/season";
import styles from "./Breadcrumbs.module.scss";

export default function Breadcrumbs({ page }: { page: Exclude<keyof typeof serviceContent, "home"> }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.trail}>
      <Link href="/">NikoBoost</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{serviceContent[page].label}</span>
    </nav>
  );
}
