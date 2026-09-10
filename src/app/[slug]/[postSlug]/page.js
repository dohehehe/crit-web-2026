import { notFound } from "next/navigation";
import { PostView } from "@/components/posts/PostView";
import { getSectionMode } from "@/lib/admin/section-mode";
import { getPostDetail } from "@/lib/posts/getPosts";
import { getSectionByPathSlug } from "@/lib/sections/getSections";
import styles from "../page.module.css";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug, postSlug } = await params;
  const section = await getSectionByPathSlug(slug);

  if (!section || getSectionMode(section) === "journal") {
    return {};
  }

  const post = await getPostDetail({ sectionId: section.id, postSlug });

  if (!post) {
    return {};
  }

  const titleParts = [];

  if (section.name ?? section.slug) {
    titleParts.push(section.name ?? section.slug);
  }

  if (post.title) {
    titleParts.push(post.title);
  }

  return {
    title: titleParts.length ? titleParts.join(" — ") : undefined,
  };
}

export default async function SectionPostPage({ params }) {
  const { slug, postSlug } = await params;
  const section = await getSectionByPathSlug(slug);

  if (!section || getSectionMode(section) === "journal") {
    notFound();
  }

  const post = await getPostDetail({ sectionId: section.id, postSlug });

  if (!post) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <PostView post={post} />
    </main>
  );
}
