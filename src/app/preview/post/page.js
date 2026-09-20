import { AdminContentPreview } from "@/components/preview/AdminContentPreview";

export const metadata = {
  title: "게시물 미리보기",
  robots: { index: false, follow: false },
};

export default function AdminPostPreviewPage() {
  return <AdminContentPreview variant="post" />;
}
