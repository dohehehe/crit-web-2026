import Image from "next/image";
import { getSiteInfo } from "@/lib/info/getSiteInfo";
import styles from "@/components/Footer.module.css";

const DEFAULT_EMAIL = "journal.crit@gmail.com";

export default async function Footer() {
  let info = null;

  try {
    info = await getSiteInfo();
  } catch {
    info = null;
  }

  const email = info?.email ?? DEFAULT_EMAIL;
  const instagramHref = info?.instagramHref;
  const youtubeHref = info?.youtubeHref;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={`${styles.footerLeft} footer`}>
          <div>
            <p className={styles.footerTitle}>Journal Crit.</p>
            <p>크릿은 다양한 비평의 목소리를 끌어모으며 현실과 예술을 잇는 시각예술
              비평플랫폼입니다.</p>
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
        <Image
          src="/arko-logo.svg"
          alt="한국문화예술위원회"
          width={60}
          height={32}
          className={styles.footerLogo}
        />
        {(instagramHref || youtubeHref) && (
          <div className={`${styles.footerRightItem} ${styles.footerSocial} footer`}>
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
                  width={28}
                  height={28}
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
                  width={28}
                  height={28}
                  className={styles.socialIcon}
                  aria-hidden
                />
              </a>
            ) : null}
          </div>
        )}
      </div>
    </footer>
  );
}
