"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertDialog } from "@/components/auth/AlertDialog";
import { UNSUBSCRIBE_CONFIRM_ALERT } from "@/lib/auth/constants";
import { deleteAccountAction, signOutAction } from "@/lib/auth/actions";
import styles from "@/app/mypage/page.module.css";

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
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);

  async function handleUnsubscribeConfirm() {
    setShowUnsubscribeConfirm(false);
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
          onClick={() => setShowUnsubscribeConfirm(true)}
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

      <AlertDialog
        open={showUnsubscribeConfirm}
        title={UNSUBSCRIBE_CONFIRM_ALERT.title}
        message={UNSUBSCRIBE_CONFIRM_ALERT.message}
        confirmLabel="구독 취소"
        cancelLabel="닫기"
        onConfirm={handleUnsubscribeConfirm}
        onCancel={() => setShowUnsubscribeConfirm(false)}
      />
    </div>
  );
}
