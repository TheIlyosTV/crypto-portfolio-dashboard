import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/providers/redux-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Open Graph meta teglar */}
        <meta property="og:title" content="Crypto Portfolio Dashboard" />
        <meta
          property="og:description"
          content="Track your cryptocurrency portfolio with real-time price updates"
        />
        <meta property="og:image" content="/icons/cryptoo.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://crypto-portfolio-dashboard-tan.vercel.app"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Crypto Portfolio Dashboard" />
        <meta
          name="twitter:description"
          content="Track your cryptocurrency portfolio with real-time price updates"
        />
        <meta
          name="twitter:image"
          content="/icons/cryptoo.jpg"
        />
      </head>
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
