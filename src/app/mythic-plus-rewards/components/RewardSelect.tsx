"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "../page.module.scss";

type Option = { value: number; label: string; detail?: string };
type Props = {
  label: string;
  value: number;
  options: Option[];
  onChange: (value: number) => void;
};

export default function RewardSelect({
  label,
  value,
  options,
  onChange,
}: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [above, setAbove] = useState(false);
  const [menuHeight, setMenuHeight] = useState(270);
  const menu = useRef<HTMLDivElement>(null);
  const search = useRef({ text: "", at: 0 });
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  useEffect(() => {
    const option = document.getElementById(`${id}-${active}`);
    const list = menu.current;
    if (!open || !option || !list) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (
      option.offsetTop + option.offsetHeight >
      list.scrollTop + list.clientHeight
    ) {
      list.scrollTop =
        option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [active, id, open]);

  function openMenu() {
    const bounds = root.current?.getBoundingClientRect();
    if (bounds) {
      const belowSpace = window.innerHeight - bounds.bottom - 12;
      const aboveSpace = bounds.top - 98;
      const opensAbove = belowSpace < 270 && aboveSpace > belowSpace;
      setAbove(opensAbove);
      setMenuHeight(
        Math.max(
          100,
          Math.min(
            window.innerWidth < 600 ? 235 : 270,
            opensAbove ? aboveSpace : belowSpace,
          ),
        ),
      );
    }
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div
      className={styles.rewardSelect}
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span id={`${id}-label`} className={styles.fieldLabel}>
        {label}
      </span>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        className={styles.selectTrigger}
        data-open={open}
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
          } else if (event.key === "Tab") setOpen(false);
          else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              openMenu();
            } else
              setActive(
                (index) =>
                  (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    options.length) %
                  options.length,
              );
          } else if (open && (event.key === "Home" || event.key === "End")) {
            event.preventDefault();
            setActive(event.key === "Home" ? 0 : options.length - 1);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) choose(active);
            else openMenu();
          } else if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            search.current.text =
              Date.now() - search.current.at > 700
                ? event.key
                : search.current.text + event.key;
            search.current.at = Date.now();
            const index = options.findIndex((option) =>
              option.label
                .toLowerCase()
                .replace(/^\+/, "")
                .startsWith(search.current.text.toLowerCase()),
            );
            if (index >= 0) {
              event.preventDefault();
              if (!open) openMenu();
              setActive(index);
            }
          }
        }}
      >
        <span id={`${id}-value`}>
          <strong>{selected.label}</strong>
          {selected.detail && <small>{selected.detail}</small>}
        </span>
        <span aria-hidden="true" className={styles.selectChevron}></span>
      </button>
      {open && (
        <div
          id={`${id}-list`}
          ref={menu}
          data-side={above ? "above" : "below"}
          style={{ maxHeight: menuHeight }}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className={styles.selectMenu}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${id}-${index}`}
              role="option"
              aria-selected={option.value === value}
              data-active={index === active}
              onPointerMove={() => setActive(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>
                <strong>{option.label}</strong>
                {option.detail && <small>{option.detail}</small>}
              </span>
              {option.value === value && <b aria-hidden="true">✓</b>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
