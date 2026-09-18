import { getSiteInfo } from "@/lib/info/getSiteInfo";
import FooterClient from "@/components/FooterClient";

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
    <FooterClient
      email={email}
      instagramHref={instagramHref}
      youtubeHref={youtubeHref}
    />
  );
}
