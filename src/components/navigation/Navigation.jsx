import { NavigationMenuProvider } from "@/components/navigation/NavigationMenuContext";
import { NavigationContainer } from "@/components/navigation/NavigationContainer";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { NavigationLogo } from "@/components/navigation/NavigationLogo";
import { NavigationSub } from "@/components/navigation/NavigationSub";
import { SectionNav } from "@/components/navigation/section/SectionNav";
import { getSections } from "@/lib/sections/getSections";

export async function Navigation() {
  let sections = [];

  try {
    sections = await getSections();
  } catch {
    sections = [];
  }

  return (
    <NavigationMenuProvider>
      <NavigationHeader>
        <NavigationLogo />
        <NavigationContainer>
          <SectionNav />
        </NavigationContainer>
        <NavigationSub sections={sections} />
      </NavigationHeader>
    </NavigationMenuProvider>
  );
}
