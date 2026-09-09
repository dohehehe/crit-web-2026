import { notFound } from "next/navigation";
import { getSectionByPathSlug } from "@/lib/sections/getSections";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const section = await getSectionByPathSlug(slug);

  if (!section) {
    return {};
  }

  return {
    title: section.name ?? section.slug,
  };
}

export default async function SectionPage({ params }) {
  const { slug } = await params;
  const section = await getSectionByPathSlug(slug);

  if (!section) {
    notFound();
  }

  return (
    <main>
      <h1 className="title-1">{section.name ?? section.slug}</h1>
    </main>
  );
}
