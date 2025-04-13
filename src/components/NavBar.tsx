import { roboto } from "@/app/fonts";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full">
      <div className="flex max-w-screen-xl mx-auto h-20 items-center justify-between mb-10">
        <div>
          <Link href="/" className="flex z-40 text-3xl">
            <span>Matthias Reisinger</span>
          </Link>
        </div>

        <div className={`${roboto.className} flex flex-row space-x-4 text-xl`}>
          <Link href="/">About</Link>
          <Link href="/blog">Blog</Link>
        </div>
      </div>
    </nav>
  );
}
