import { ScrollToTop } from "@/components/ScrollToTop";
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

const EDITOR_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Serif+KR:wght@400;500;600;700&display=swap";

export default function RootLayout({ children }) {
  return (
    <html lang="ko-KR" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={EDITOR_FONT_STYLESHEET} />
      </head>
      <body>
        <ScrollToTop />
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
