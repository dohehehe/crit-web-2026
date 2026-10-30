import { EmailConfirmedNotice } from "@/components/auth/EmailConfirmedNotice";

export const metadata = {
  title: "인증 완료",
};

export default function EmailConfirmedPage() {
  return (
    <main>
      <EmailConfirmedNotice />
    </main>
  );
}
