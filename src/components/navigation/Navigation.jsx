import Image from "next/image";
import Link from "next/link";
import styles from "@/components/navigation/Navigation.module.css";
import { NavigationMenuProvider } from "@/components/navigation/NavigationMenuContext";
import { NavigationContainer } from "@/components/navigation/NavigationContainer";
import { SectionNav } from "@/components/navigation/section/SectionNav";

export function Navigation() {
  return (
    <NavigationMenuProvider>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="CRIT 홈">
          <Image
            src="/logo-black.svg"
            alt=""
            width={400}
            height={129}
            className={styles.logo}
            priority
          />
        </Link>
        <NavigationContainer>
          <SectionNav />
        </NavigationContainer>
      </header>
    </NavigationMenuProvider>
  );
}
