"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "@/lib/auth/actions";
import styles from "@/app/mypage/page.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.logout} disabled={pending}>
      {pending ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <SubmitButton />
    </form>
  );
}
