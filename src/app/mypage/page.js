import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import styles from "@/app/mypage/page.module.css";

export const metadata = {
  title: "내 정보",
};

export default async function MyPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : null;

  return (
    <main className={styles.main}>
      <h1 className="title-1">내 정보</h1>
      {name ? <p className="p">이름: {name}</p> : null}
      <p className="p">이메일: {user.email}</p>
      <LogoutButton />
    </main>
  );
}
