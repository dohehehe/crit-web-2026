import Image from "next/image";
import styles from "@/components/navigation/Navigation.module.css";
import { NavigationMenuProvider } from "@/components/navigation/NavigationMenuContext";
import { NavigationContainer } from "@/components/navigation/NavigationContainer";
import { SectionNav } from "@/components/navigation/section/SectionNav";

export function Navigation() {
  return (
    <NavigationMenuProvider>
      <header className={styles.header}>
        <Image
          src="/logo-black.svg"
          alt="CRIT"
          width={400}
          height={129}
          priority
        />
        <NavigationContainer>
          <SectionNav />
        </NavigationContainer>
      </header>
    </NavigationMenuProvider>
  );
}
