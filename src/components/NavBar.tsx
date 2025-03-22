import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full max-w-screen-2xl mx-auto flex h-20 items-center justify-between mb-10">
      <div>
        <Link href="/" className="flex z-40 font-bold text-2xl">
          <span>Matthias Reisinger</span>
        </Link>
      </div>

      <div className="flex flex-row space-x-4">
        <Link href="/">About</Link>
        <Link href="/blog">Blog</Link>
      </div>
    </nav>
  );
}
