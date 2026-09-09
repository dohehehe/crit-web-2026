import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


export const metadata = {
  title: "CRIT",
  description: "CRIT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko-KR">
      <body>{children}</body>
    </html>
  );
}
