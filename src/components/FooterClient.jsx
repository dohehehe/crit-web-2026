"use client";

import { usePathname } from "next/navigation";
import { isJournalCritPath } from "@/lib/routes/journalCrit";
import { isChannelPath } from "@/lib/routes/channel";
import styles from "@/components/Footer.module.css";

function InstagramIcon({ className }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28.57 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M27.97,3.12c-.33-1.23-1.3-2.2-2.53-2.53-2.23-.6-11.16-.6-11.16-.6,0,0-8.93,0-11.16.6C1.89.93.93,1.89.6,3.12c-.6,2.23-.6,6.88-.6,6.88,0,0,0,4.65.6,6.88.33,1.23,1.3,2.2,2.53,2.53,2.23.6,11.16.6,11.16.6,0,0,8.93,0,11.16-.6,1.23-.33,2.2-1.3,2.53-2.53.6-2.23.6-6.88.6-6.88,0,0,0-4.65-.6-6.88ZM11.43,14.29V5.72l7.42,4.29-7.42,4.28Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function FooterClient({
  email,
  instagramHref,
  youtubeHref,
}) {
  const pathname = usePathname();
  const isJournalCrit = isJournalCritPath(pathname);
  const isChannel = isChannelPath(pathname);

  const footerClassName = [
    styles.footer,
    isJournalCrit ? styles.footerJournal : "",
    isChannel ? styles.footerChannel : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={footerClassName}>
      <div className={styles.footerTop}>
        <div className={`${styles.footerLeft} footer`}>
          <div>
            <p className={styles.footerTitle}>Journal Crit.</p>
            <p>
              크릿은 다양한 비평의 목소리를 끌어모으며 현실과 예술을 잇는 시각예술
              비평플랫폼입니다.
            </p>
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p>©Crit and the authors All rights reserved.</p>
          </div>
        </div>
        <div className={`${styles.footerRight} footer`}>
          <div className={`${styles.footerRightItem} footer`}>
            <p>웹사이트 개인정보책임: (주)배포자들</p>
            <p>사업자등록번호: 498-81-04070</p>
            <p>대표이사: 이진실</p>
          </div>
          <div className={`${styles.footerRightItem} footer`}>
            <p>개인 정보 처리 방침</p>
            <p>이메일 무단 수집 거부</p>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span
          className={styles.footerLogo}
          role="img"
          aria-label="한국문화예술위원회"
        />
        {(instagramHref || youtubeHref) && (
          <div
            className={`${styles.footerRightItem} ${styles.footerSocial} footer`}
          >
            {instagramHref ? (
              <a
                className={styles.socialLink}
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon className={styles.socialIcon} />
              </a>
            ) : null}
            {youtubeHref ? (
              <a
                className={styles.socialLink}
                href={youtubeHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <YoutubeIcon className={styles.socialIcon} />
              </a>
            ) : null}
          </div>
        )}
      </div>
    </footer>
  );
}
