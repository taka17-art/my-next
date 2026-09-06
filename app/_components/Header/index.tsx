"use client";

import classes from "@/app/_components/Header/Header.module.css"
import Link from "next/link";
export const Header = () => {
  return (
    <header className={classes.header}>
      <Link href="/" className={classes.headerLink}>
        Blog
      </Link>
      <Link href="/contact" className={classes.headerLink}>
        お問い合せ
      </Link>
    </header>
  );
};