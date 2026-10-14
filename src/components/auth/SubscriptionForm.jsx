"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertDialog } from "@/components/auth/AlertDialog";
import {
  MIN_PASSWORD_LENGTH,
  SIGNUP_VERIFICATION_ALERT,
} from "@/lib/auth/constants";
import { signUpAction } from "@/lib/auth/actions";
import styles from "@/components/auth/AuthForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`tag-keyword ${styles.submit}`}
      disabled={pending}
    >
      {pending ? "가입 중…" : "가입하기"}
    </button>
  );
}

export function SubscriptionForm({ intro = null }) {
  const router = useRouter();
  const [state, formAction] = useActionState(signUpAction, null);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowVerificationAlert(true);
    }
  }, [state]);

  function handleVerificationConfirm() {
    setShowVerificationAlert(false);
    router.push("/login?registered=1");
  }

  return (
    <div className={styles.page}>
      <header className={`${styles.header} ${styles.subscriptionHeader}`}>
        <h1 className="menu-kr">구독 회원 가입</h1>
        {intro}
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

        <div className={styles.checkboxFields}>
          <label className={styles.checkboxField}>
            <input
              className={styles.checkboxInput}
              type="checkbox"
              name="privacyConsent"
              required
            />
            <span className={`p ${styles.checkboxLabel}`}>
              <Link
                href="/privacy"
                className={styles.checkboxLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보 수집·이용
              </Link>
              에 동의합니다*
            </span>
          </label>

          <label className={styles.checkboxField}>
            <input
              className={styles.checkboxInput}
              type="checkbox"
              name="newsletterConsent"
            />
            <span className={`p ${styles.checkboxLabel}`}>
              뉴스레터 및 이벤트 소식 수신에 동의합니다
            </span>
          </label>
        </div>

        {state?.error ? (
          <p className={`p ${styles.error}`} role="alert">
            {state.error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <SubmitButton />
          <p className={`tag-keyword gray-65 ${styles.footerLink}`}>
            <Link href="/login">로그인하기</Link>
          </p>
        </div>
      </form>

      <AlertDialog
        open={showVerificationAlert}
        title={SIGNUP_VERIFICATION_ALERT.title}
        message={SIGNUP_VERIFICATION_ALERT.message}
        onConfirm={handleVerificationConfirm}
      />
    </div>
  );
}
