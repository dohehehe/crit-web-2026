import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export const metadata = {
  title: "비밀번호 재설정",
};

export default async function ResetPasswordPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main>
      <ResetPasswordForm />
    </main>
  );
}
