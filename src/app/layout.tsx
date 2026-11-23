import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "글 게시판",
  description: "스프링부트, Next.js 연동",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-full flex flex-col">
        <header>
          <nav className="flex gap-4">
            <Link href="/">홈</Link>
            <Link href="/posts">글 목록</Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer>푸터</footer>
      </body>
    </html>
  );
}