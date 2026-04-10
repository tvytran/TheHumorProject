import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Humor Project",
  description: "Campus humor from Columbia & Barnard — vote on captions, create your own, and explore humor flavors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load theme before paint to avoid flash — user study feedback:
            some users felt the pink theme was too feminine, so we offer
            a neutral alternative that persists in localStorage. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('crkai-theme');if(t==='neutral'){document.documentElement.setAttribute('data-theme','neutral');}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
