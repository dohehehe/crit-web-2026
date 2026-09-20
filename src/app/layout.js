import { Navigation } from '@/components/navigation/Navigation';
import "./globals.css";
import Footer from '@/components/Footter';

export const metadata = {
  title: "CRIT",
  description: "CRIT",
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
