"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import logoImg from "@/assets/logo.png";
import classes from "./header-main.module.css";

export default function HeaderMain() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  return (
    <header className={classes.header}>
      <Link href="/" className={classes.logo}>
        <Image src={logoImg} alt="NextLevel Food logo" priority />
        NextLevel Food
      </Link>

      <button
        className={classes.mobileMenuBtn}
        onClick={toggleMenu}
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span
          className={`${classes.hamburger} ${menuOpen ? classes.open : ""}`}
        ></span>
      </button>

      <nav className={`${classes.nav} ${menuOpen ? classes.navOpen : ""}`}>
        <ul>
          <li>
            <Link href="/meals" onClick={() => setMenuOpen(false)}>
              Parcourir les Repas
            </Link>
          </li>
          <li>
            <Link href="/community" onClick={() => setMenuOpen(false)}>
              La Communauté
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
