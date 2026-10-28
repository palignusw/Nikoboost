import { changeLabels, classifyWowChange } from "@/lib/wowChangeKind";
import styles from "./updates.module.scss";
export default function ChangeBadge({ text, section }: { text: string; section: string }) {
  const kind = classifyWowChange(text, section);
  if (!kind) return null;
  return <span className={styles.changeBadge} data-change={kind} title="Automatic wording-based label, from the player perspective. Balance includes mixed or unclear tuning."><span aria-hidden="true">{kind === "buff" ? "↑" : kind === "nerf" ? "↓" : kind === "fix" ? "✓" : "↔"}</span>{changeLabels[kind]}</span>;
}
