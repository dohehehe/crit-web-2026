import { AdminContentPreview } from "@/components/preview/AdminContentPreview";

export const metadata = {
  title: "Journal Crit 이슈 미리보기",
  robots: { index: false, follow: false },
};

export default function AdminIssuePreviewPage() {
  return <AdminContentPreview variant="issue" />;
}
