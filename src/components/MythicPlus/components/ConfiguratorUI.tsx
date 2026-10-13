import type {
  ReactNode,
} from "react";

import styles from "../MythicPlus.module.scss";

export function Divider() {
  return (
    <div
      className={
        styles.divider
      }
    />
  );
}

export function OptionSection({
  number,
  title,
  value,
  children,
}: {
  number: string;
  title: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <section
      className={
        styles.optionSection
      }
    >
      <header
        className={
          styles.optionHeader
        }
      >
        <div>
          <span>
            {number}
          </span>

          <h3>
            {title}
          </h3>
        </div>

        <strong>
          {value}
        </strong>
      </header>

      {children}
    </section>
  );
}

export function ChoiceCard({
  active,
  title,
  description,
  badge,
  price,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  badge?: string;
  price?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={
        active
          ? styles.activeChoice
          : styles.choice
      }
    >
      <div>
        <strong>
          {title}
        </strong>

        {badge && (
          <em>
            {badge}
          </em>
        )}

        {price && (
          <span
            className={
              styles.extraPrice
            }
          >
            {price}
          </span>
        )}
      </div>

      <p>
        {description}
      </p>
    </button>
  );
}

export function SummaryRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div
      className={
        styles.summaryRow
      }
    >
      <span>
        {label}
      </span>

      <strong
        className={
          positive
            ? styles.positive
            : undefined
        }
      >
        {value}
      </strong>
    </div>
  );
}