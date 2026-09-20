"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction } from "@/lib/auth/actions";
import styles from "@/components/auth/AuthForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? "로그인 중…" : "로그인"}
    </button>
  );
}

export function LoginForm({ registered }) {
  const [state, formAction] = useActionState(signInAction, null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="title-1">로그인</h1>
        <p className="p gray-65">CRIT 계정으로 로그인하세요.</p>
      </header>

      {registered ? (
        <p className={`p ${styles.success}`} role="status">
          회원가입이 완료되었습니다. 로그인해 주세요.
        </p>
      ) : null}

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

        <label className={styles.field}>
          <span className="caption">비밀번호</span>
          <input
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
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
            계정이 없으신가요?{" "}
            <Link href="/subscription">회원가입</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
