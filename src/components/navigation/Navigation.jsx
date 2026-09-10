import { NavigationMenuProvider } from "@/components/navigation/NavigationMenuContext";
import { NavigationContainer } from "@/components/navigation/NavigationContainer";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { NavigationLogo } from "@/components/navigation/NavigationLogo";
import { SectionNav } from "@/components/navigation/section/SectionNav";

export function Navigation() {
  return (
    <NavigationMenuProvider>
      <NavigationHeader>
        <NavigationLogo />
        <NavigationContainer>
          <SectionNav />
        </NavigationContainer>
      </NavigationHeader>
    </NavigationMenuProvider>
  );
}
