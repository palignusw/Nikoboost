
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.scss";

const links = [
  { href: "#mythic", label: "Mythic+" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>

        <a
          href="/"
          className={styles.logo}
          aria-label="NikoBoost home — reset configurator"
        >
          <Image
            src="/images/branding/nikoboost-logo-v2.png"
            alt="NikoBoost"
            width={260}
            height={72}
            priority
          />
        </a>


        <nav
          className={styles.nav}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            href="#mythic"
            className={styles.book}
            onClick={closeMenu}
          >
            Book a Run
            <span aria-hidden="true">↗</span>
          </Link>

          <button
            type="button"
            className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""
              }`}
            aria-label={
              menuOpen ? "Close menu" : "Open menu"
            }
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
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""
          }`}
        aria-label="Mobile navigation"
        inert={!menuOpen}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
          >
            {link.label}
            <span aria-hidden="true">↗</span>
          </Link>
        ))}

        <Link
          href="#mythic"
          className={styles.mobileBook}
          onClick={closeMenu}
        >
          Configure Your Run
          <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </header>
  );
}
