import { redirect } from "next/navigation";
import { JournalCritView } from "@/components/journal/JournalCritView";
import { getLatestIssue } from "@/lib/issues/getIssues";
import styles from "@/app/journal-crit/page.module.css";

export const revalidate = 60;

export const metadata = {
  title: "Journal Crit",
};

export default async function JournalCritIndexPage() {
  const issue = await getLatestIssue();

  if (issue?.issueNumber) {
    redirect(`/journal-crit/${issue.issueNumber}`);
  }

  return (
    <></>
  );
}
