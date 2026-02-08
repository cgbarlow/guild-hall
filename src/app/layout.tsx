import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/providers/theme-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { PendingActionProvider } from "@/providers/pending-action-provider";
import { DynamicFavicon } from "@/components/dynamic-favicon";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://guild-hall.agentics.nz';
const ogImageUrl = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Guild Hall",
    template: "%s | Guild Hall",
  },
  description: "Quest-based engagement platform",
  openGraph: {
    type: 'website',
    siteName: 'Guild Hall',
    title: 'Guild Hall',
    description: 'Quest-based engagement platform',
    url: siteUrl,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Guild Hall - Quest-based engagement platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guild Hall',
    description: 'Quest-based engagement platform',
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <DynamicFavicon />
        <ThemeProvider defaultTheme="warm">
          <QueryProvider>
            <AuthProvider>
              <PendingActionProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </PendingActionProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
