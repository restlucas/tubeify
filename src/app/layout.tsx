import type { Metadata } from "next";
import { Bree_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Providers from "@/components/Providers";

const breefSerif = Bree_Serif({
  variable: "--bree-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tubeify",
  description: "Simple way to convert playlists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${breefSerif.variable} antialiased mx-auto flex h-screen w-full flex-col overflow-x-hidden md:relative`}
      >
        <Header />

        <Providers>
          <main className="mx-4 flex-1">{children}</main>
        </Providers>

        <Footer />
      </body>
    </html>
  );
}
