import { SectionNavList } from "@/components/navigation/SectionNavList";
import { getSections } from "@/lib/sections/getSections";

export async function SectionNav() {
  let sections = [];

  try {
    sections = await getSections();
  } catch {
    return null;
  }

  if (sections.length === 0) {
    return null;
  }

  return <SectionNavList sections={sections} />;
}
