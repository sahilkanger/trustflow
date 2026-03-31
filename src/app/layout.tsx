import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustFlow — Social Proof That Grows Itself",
  description:
    "Collect, manage, and display testimonials that convert. The social proof ecosystem that grows with your business.",
  openGraph: {
    title: "TrustFlow — Social Proof That Grows Itself",
    description: "Collect, manage, and display testimonials that convert.",
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
