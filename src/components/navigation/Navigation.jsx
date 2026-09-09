import Image from "next/image";
import styles from "@/components/navigation/Navigation.module.css";
import { SectionNav } from "@/components/navigation/SectionNav";
import { InfoNav } from "@/components/navigation/InfoNav";

export function Navigation() {
  return (
    <header className={styles.header}>
      <Image
        src="/logo-black.svg"
        alt="CRIT"
        width={400}
        height={129}
        priority
      />
      <nav className={styles.nav}>
        <SectionNav />
        <InfoNav />
      </nav>
    </header>
  );
}