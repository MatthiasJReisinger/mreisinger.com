import Link from "next/link";
import NavBarItem from "./NavBarItem";

export default function NavBar() {
  return (
    <nav className="w-full">
      <div className="mx-auto w-full max-w-screen-2xl px-2.5 md:px-20 flex h-20 items-center justify-between">
        <div>
          <Link href="/" className="flex z-40 font-bold text-2xl">
            <span>Matthias Reisinger</span>
          </Link>
        </div>

        <div className="flex flex-row">
          <NavBarItem href="/blog" title="Blog" />
          <NavBarItem href="/about" title="About" />
        </div>
      </div>
    </nav>
  );
}
