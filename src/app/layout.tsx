import type { Metadata } from "next";
import { Public_Sans, Domine } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Domine({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "RentManager - Property Management System",
  description: "Advanced Rent and Property Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
