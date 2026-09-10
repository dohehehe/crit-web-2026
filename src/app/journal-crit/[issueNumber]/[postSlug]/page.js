import { notFound } from "next/navigation";
import { PostView } from "@/components/posts/PostView";
import { getIssueByNumber } from "@/lib/issues/getIssues";
import { getPostDetail } from "@/lib/posts/getPosts";
import { getSectionByPathSlug } from "@/lib/sections/getSections";
import styles from "@/components/journal/JournalCritView.module.css";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { issueNumber, postSlug } = await params;
  const issue = await getIssueByNumber(issueNumber);

  if (!issue) {
    return {};
  }

  const section = await getSectionByPathSlug("journal-crit");
  const post = section
    ? await getPostDetail({ sectionId: section.id, postSlug, issueId: issue.id })
    : null;

  if (!post) {
    return {};
  }

  const titleParts = [];

  if (issue.issueNumber) {
    titleParts.push(`Issue ${issue.issueNumber}`);
  }

  if (post.title) {
    titleParts.push(post.title);
  }

  return {
    title: titleParts.length ? titleParts.join(" — ") : "Journal Crit",
  };
}

export default async function JournalCritPostPage({ params }) {
  const { issueNumber, postSlug } = await params;
  const issue = await getIssueByNumber(issueNumber);

  if (!issue) {
    notFound();
  }

  const section = await getSectionByPathSlug("journal-crit");

  if (!section) {
    notFound();
  }

  const post = await getPostDetail({ sectionId: section.id, postSlug, issueId: issue.id });

  if (!post) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <PostView post={post} />
    </main>
  );
}
