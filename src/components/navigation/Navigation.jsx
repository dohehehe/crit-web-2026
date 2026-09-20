import { NavigationMenuProvider } from "@/components/navigation/NavigationMenuContext";
import { NavigationContainer } from "@/components/navigation/NavigationContainer";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { NavigationLogo } from "@/components/navigation/NavigationLogo";
import { NavigationSub } from "@/components/navigation/NavigationSub";
import { SectionNav } from "@/components/navigation/section/SectionNav";
import { getSiteInfo } from "@/lib/info/getSiteInfo";
import { getSections } from "@/lib/sections/getSections";

export async function Navigation() {
  let sections = [];
  let instagramHref;
  let youtubeHref;

  try {
    sections = await getSections();
  } catch {
    sections = [];
  }

  try {
    const info = await getSiteInfo();
    instagramHref = info?.instagramHref;
    youtubeHref = info?.youtubeHref;
  } catch {
    instagramHref = undefined;
    youtubeHref = undefined;
  }

  return (
    <NavigationMenuProvider>
      <NavigationHeader>
        <NavigationLogo />
        <NavigationContainer
          instagramHref={instagramHref}
          youtubeHref={youtubeHref}
        >
          <SectionNav />
        </NavigationContainer>
        <NavigationSub sections={sections} />
      </NavigationHeader>
    </NavigationMenuProvider>
  );
}
