import { notFound } from "next/navigation";
import { PostList } from "@/components/posts/PostList";
import { getSectionMode, sectionUsesIssuePostSortOrder } from "@/lib/admin/section-mode";
import { getPostsBySection } from "@/lib/posts/getPosts";
import { getSectionByPathSlug } from "@/lib/sections/getSections";
import styles from "./page.module.css";

export const revalidate = 60;

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

  const sectionMode = getSectionMode(section);
  const isChannelSection = sectionMode === "channel";

  const posts = await getPostsBySection(section.id, {
    orderBy: sectionUsesIssuePostSortOrder(sectionMode) ? "sort_order" : "date",
  });

  return (
    <main className={styles.main} {...(isChannelSection ? { "data-channel-section": "" } : {})}>
      <PostList posts={posts} />
    </main>
  );
}
