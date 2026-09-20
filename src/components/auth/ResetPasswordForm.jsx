"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { updatePasswordAction } from "@/lib/auth/actions";
import styles from "@/components/auth/AuthForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? "변경 중…" : "비밀번호 변경"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="title-1">새 비밀번호</h1>
        <p className="p gray-65">새 비밀번호를 입력해 주세요.</p>
      </header>

      <form className={styles.form} action={formAction}>
        <label className={styles.field}>
          <span className="caption">새 비밀번호</span>
          <input
            className={styles.input}
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="caption">새 비밀번호 확인</span>
          <input
            className={styles.input}
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>

        {state?.error ? (
          <p className={`p ${styles.error}`} role="alert">
            {state.error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <SubmitButton />
          <p className={`caption ${styles.footerLink}`}>
            <Link href="/login">로그인</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
