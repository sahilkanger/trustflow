import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustFlow — Wall of Love for Your SaaS Landing Page",
  description:
    "Add a high-converting wall of love to your SaaS landing page in 2 minutes. Import tweets, collect testimonials, embed anywhere.",
  openGraph: {
    title: "TrustFlow — Wall of Love for Your SaaS Landing Page",
    description: "Import tweets, collect testimonials, and embed a wall of love on your landing page in 2 minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
