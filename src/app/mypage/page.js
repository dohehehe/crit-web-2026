import { redirect } from "next/navigation";
import { MyPageActions } from "@/components/auth/MyPageActions";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "@/app/mypage/page.module.css";

export const metadata = {
  title: "내 정보",
};

function formatSubscriptionDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

async function getSubscriptionStartedAt(user) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("users")
      .select("created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data?.created_at) {
      return data.created_at;
    }
  } catch {
    // Fall back to the auth account creation time.
  }

  return user.created_at ?? null;
}

export default async function MyPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : null;
  const startedAt = formatSubscriptionDate(
    await getSubscriptionStartedAt(user)
  );

  return (
    <main className={styles.main}>
      <h1 className="title-1">내 정보</h1>
      {name ? <p className="p">이름: {name}</p> : null}
      <p className="p">이메일: {user.email}</p>
      <p className="p">구독 시작 일자: {startedAt ?? "—"}</p>
      <MyPageActions />
    </main>
  );
}
