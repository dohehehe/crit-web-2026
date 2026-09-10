import { notFound } from "next/navigation";
import { JournalCritView } from "@/components/journal/JournalCritView";
import { getIssueByNumber, getPreviousIssues } from "@/lib/issues/getIssues";
import { getPostsBySection } from "@/lib/posts/getPosts";
import { getSectionByPathSlug } from "@/lib/sections/getSections";
import styles from "@/components/journal/JournalCritView.module.css";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { issueNumber } = await params;
  const issue = await getIssueByNumber(issueNumber);

  if (!issue) {
    return {};
  }

  const titleParts = [];

  if (issue.issueNumber) {
    titleParts.push(`Issue ${issue.issueNumber}`);
  }

  if (issue.title) {
    titleParts.push(issue.title);
  }

  return {
    title: titleParts.length ? titleParts.join(" — ") : "Journal Crit",
  };
}

export default async function JournalCritIssuePage({ params }) {
  const { issueNumber } = await params;
  const issue = await getIssueByNumber(issueNumber);

  if (!issue) {
    notFound();
  }

  const [section, previousIssues] = await Promise.all([
    getSectionByPathSlug("journal-crit"),
    getPreviousIssues(issue.issueNumber),
  ]);
  const posts = section
    ? await getPostsBySection(section.id, {
      issueId: issue.id,
      orderBy: "sort_order",
    })
    : [];

  return (
    <main className={styles.main}>
      <JournalCritView issue={issue} posts={posts} previousIssues={previousIssues} />
    </main>
  );
}
