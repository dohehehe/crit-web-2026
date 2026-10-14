"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAccountAction, signOutAction } from "@/lib/auth/actions";
import styles from "@/app/mypage/page.module.css";

const UNSUBSCRIBE_CONFIRM_MESSAGE =
  "구독을 취소하면 회원 탈퇴로 처리됩니다. 계정과 회원 정보가 삭제되며 되돌릴 수 없습니다. 계속할까요?";

function LogoutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.logout} disabled={pending}>
      {pending ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}

export function MyPageActions() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleUnsubscribe() {
    if (!window.confirm(UNSUBSCRIBE_CONFIRM_MESSAGE)) {
      return;
    }

    setPending(true);
    setError("");

    const result = await deleteAccountAction();

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className={styles.accountActions}>
      <div className={styles.actionRow}>
        <form action={signOutAction}>
          <LogoutSubmit />
        </form>
        <button
          type="button"
          className={`caption gray-65 ${styles.unsubscribe}`}
          onClick={handleUnsubscribe}
          disabled={pending}
        >
          {pending ? "취소 중…" : "구독 취소"}
        </button>
      </div>
      {error ? (
        <p className={`caption ${styles.actionError}`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
