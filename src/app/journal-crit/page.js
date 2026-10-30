import { redirect } from "next/navigation";
import { PreparingMessage } from "@/components/status/StatusMessage";
import { getLatestIssue } from "@/lib/issues/getIssues";

export const revalidate = 60;

export const metadata = {
  title: "Journal Crit",
};

export default async function JournalCritIndexPage() {
  const issue = await getLatestIssue();

  if (issue?.issueNumber) {
    redirect(`/journal-crit/${issue.issueNumber}`);
  }

  return <PreparingMessage />;
}
