import type { Metadata } from "next";
import { roboto, wittgenstein } from "@/app/fonts";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "mreisinger.com",
  description: "Matthias Reisinger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${wittgenstein.variable} ${roboto.variable} antialiased text-lg`}
      >
        <div className="flex flex-col min-h-screen mx-auto w-full max-w-screen-lg px-5 md:px-0">
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
