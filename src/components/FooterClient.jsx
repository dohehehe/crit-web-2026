"use client";

import { usePathname } from "next/navigation";
import { isJournalCritPath } from "@/lib/routes/journalCrit";
import { isChannelPath } from "@/lib/routes/channel";
import styles from "@/components/Footer.module.css";

export default function FooterClient({ email }) {
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
      </div>
    </footer>
  );
}
