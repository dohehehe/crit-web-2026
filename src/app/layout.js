import { Navigation } from '@/components/navigation/Navigation';
import "./globals.css";

export const metadata = {
  title: "CRIT",
  description: "CRIT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko-KR">
      <body>
        <Navigation />
        {children}</body>
    </html>
  );
}
