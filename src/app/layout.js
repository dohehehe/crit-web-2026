import { Navigation } from "@/components/navigation/Navigation";
import Footer from "@/components/Footter";
import {
  DEFAULT_SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
} from "@/lib/seo/constants";
import { getMetadataBaseUrl } from "@/lib/seo/buildPageMetadata";
import "./globals.css";

export const metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: SITE_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko-KR">
      <body>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
