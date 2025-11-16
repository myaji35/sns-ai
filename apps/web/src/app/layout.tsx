import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContentFlow AI',
  description: '올인원 콘텐츠 마케팅 자동화 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
