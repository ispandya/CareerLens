import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";
import { AuthProvider } from "../lib/auth/auth-context";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerLens",
  description: "Track your internship search, understand what's working.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
