"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import styles from "@/components/auth/AuthForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? "전송 중…" : "재설정 링크 보내기"}
    </button>
  );
}

export function ForgotPasswordForm({ onBack }) {
  const [state, formAction] = useActionState(requestPasswordResetAction, null);

  return (
    <div className={styles.forgotPanel}>
      <header className={styles.header}>
        <h2 className="title-1">비밀번호 찾기</h2>
        <p className="p gray-65">
          가입한 이메일로 비밀번호 재설정 링크를 보내 드립니다.
        </p>
      </header>

      <form className={styles.form} action={formAction}>
        <label className={styles.field}>
          <span className="caption">이메일</span>
          <input
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>

        {state?.error ? (
          <p className={`p ${styles.error}`} role="alert">
            {state.error}
          </p>
        ) : null}

        {state?.success ? (
          <p className={`p ${styles.success}`} role="status">
            {state.success}
          </p>
        ) : null}

        <div className={styles.actions}>
          <SubmitButton />
          <button type="button" className={styles.textButton} onClick={onBack}>
            로그인으로 돌아가기
          </button>
        </div>
      </form>
    </div>
  );
}
