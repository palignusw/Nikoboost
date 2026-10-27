"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.scss";

const links = [
  { href: "/#mythic", label: "Mythic+", page: "/" },
  { href: "/delves", label: "Delves", page: "/delves" },
  {
    href: "/mythic-plus-rewards",
    label: "Rewards & Tools",
    page: "/mythic-plus-rewards",
  },
  { href: "/tactics", label: "Dungeon Tactics", page: "/tactics" },
  { href: "/gold-prices", label: "Gold Prices", page: "/gold-prices" },
  { href: "/#how", label: "How it works", page: null },
  { href: "/#faq", label: "FAQ", page: null },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const bookingHref =
    pathname === "/delves" ? "/delves#delve-builder" : "/#mythic";
  const bookingLabel = pathname === "/delves" ? "Book Delves" : "Book a Run";
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const elements = Array.from(
          header.current?.querySelectorAll<HTMLElement>("a, button") ?? [],
        ).filter((el) => el.getClientRects().length && !el.closest("[inert]"));
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const desktop = window.matchMedia("(min-width: 1201px)");
    const resize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", resize);
    };
  }, [menuOpen]);

  return (
    <>
      {menuOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Dismiss navigation"
          onClick={closeMenu}
          tabIndex={-1}
        />
      )}
      <header ref={header} className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <Link
            href="/"
            className={styles.logo}
            aria-label="NikoBoost home — reset configurator"
            onClick={closeMenu}
          >
            <Image
              src="/images/branding/nikoboost-logo-v2.png"
              alt="NikoBoost"
              width={260}
              height={72}
              priority
            />
          </Link>
          <nav className={styles.nav} aria-label="Main navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={(pathname === link.page || (link.page === "/tactics" && pathname.startsWith("/tactics/"))) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className={styles.actions}>
            <Link
              href={bookingHref}
              className={styles.book}
              onClick={closeMenu}
            >
              {bookingLabel}
              <span aria-hidden="true">↗</span>
            </Link>
            <button
              ref={menuButton}
              type="button"
              className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="nikoboost-mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <nav
          id="nikoboost-mobile-nav"
          className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
          aria-label="Mobile navigation"
          inert={!menuOpen}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={(pathname === link.page || (link.page === "/tactics" && pathname.startsWith("/tactics/"))) ? "page" : undefined}
              onClick={closeMenu}
            >
              {link.label}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link
            href={bookingHref}
            className={styles.mobileBook}
            onClick={closeMenu}
          >
            {pathname === "/delves"
              ? "Configure your Delves"
              : "Configure Your Run"}
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>
    </>
  );
}
