"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { isJournalCritPath } from "@/lib/routes/journalCrit";
import { isChannelPath } from "@/lib/routes/channel";
import styles from "@/components/Footer.module.css";

function isAdminPreviewPath(pathname) {
  return pathname === "/preview" || pathname.startsWith("/preview/");
}

export default function FooterClient({ email, instagramHref, youtubeHref }) {
  const pathname = usePathname();

  if (isAdminPreviewPath(pathname)) {
    return null;
  }

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
    <footer className={`footer ${styles.footer}`}>
      <div className={styles.footerLeft}>
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
        <div className={styles.footerLeftBottom}>
          <span
            className={styles.footerLogo}
            role="img"
            aria-label="한국문화예술위원회"
          />
        </div>

      </div>
      <div className={styles.footerRight}>
        <div className={styles.footerRightCompany}>
          <p>웹사이트 개인정보책임: (주)배포자들</p>
          <p>사업자등록번호: 498-81-04070</p>
          <p>대표이사: 이진실</p>
        </div>

        <div className={styles.footerRightBottom}>
          <div className={styles.footerRightCopyright}>
            <p>개인 정보 처리 방침</p>
            <p>이메일 무단 수집 거부</p>
          </div>
          {(instagramHref || youtubeHref) && (
            <div className={styles.socialLinks}>
              {instagramHref ? (
                <a
                  className={styles.socialLink}
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Image
                    src="/Instagram.svg"
                    alt=""
                    width={23.79}
                    height={22.79}
                    className={styles.socialIcon}
                    aria-hidden
                  />
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
                  <Image
                    src="/Youtube.svg"
                    alt=""
                    width={24.53}
                    height={17.11}
                    className={styles.socialIcon}
                    aria-hidden
                  />
                </a>
              ) : null}
            </div>
          )}
        </div>


      </div>
    </footer>
  );
}
