import Image from "next/image";
import { SectionsNav } from "@/components/navigation/sections-nav";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Image
          src="/logo-black.svg"
          alt="CRIT"
          width={400}
          height={129}
          priority
        />
      </header>
      <SectionsNav />
    </main>
  );
}
