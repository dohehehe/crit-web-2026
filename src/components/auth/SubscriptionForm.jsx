"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { signUpAction } from "@/lib/auth/actions";
import styles from "@/components/auth/AuthForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? "가입 중…" : "회원가입"}
    </button>
  );
}

export function SubscriptionForm() {
  const [state, formAction] = useActionState(signUpAction, null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="title-1">회원가입</h1>
        <p className="p gray-65">이름, 이메일, 비밀번호를 입력해 주세요.</p>
      </header>

      <form className={styles.form} action={formAction}>
        <label className={styles.field}>
          <span className="caption">이름</span>
          <input
            className={styles.input}
            type="text"
            name="name"
            autoComplete="name"
            required
          />
        </label>

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
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="caption">비밀번호 확인</span>
          <input
            className={styles.input}
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>

        <label className={styles.checkboxField}>
          <input type="checkbox" name="privacyConsent" required />
          <span className={`p ${styles.checkboxLabel}`}>
            개인정보 수집·이용에 동의합니다. (필수)
          </span>
        </label>

        <label className={styles.checkboxField}>
          <input type="checkbox" name="newsletterConsent" />
          <span className={`p ${styles.checkboxLabel}`}>
            뉴스레터 및 소식 수신에 동의합니다. (선택)
          </span>
        </label>

        {state?.error ? (
          <p className={`p ${styles.error}`} role="alert">
            {state.error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <SubmitButton />
          <p className={`caption ${styles.footerLink}`}>
            이미 계정이 있으신가요? <Link href="/login">로그인</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
