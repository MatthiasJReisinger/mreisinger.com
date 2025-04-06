import { Roboto, Wittgenstein } from "next/font/google";

export const wittgenstein = Wittgenstein({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-wittgenstein",
});

export const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300"],
});
