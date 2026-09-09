import Image from "next/image";
import { SectionsNav } from "@/components/sections-nav";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Image
          src="/logo-black.svg"
          alt="CRIT"
          width={80}
          height={24}
          priority
        />
      </header>
      <SectionsNav />
    </main>
  );
}
