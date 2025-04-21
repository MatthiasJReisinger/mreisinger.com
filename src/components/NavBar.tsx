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

        <div className={`${roboto.className} flex flex-row space-x-6 text-xl`}>
          <NavItem href="/" title="About" />
          <NavItem href="/blog" title="Blog" />
        </div>
      </div>
    </nav>
  );
}

function NavItem({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="relative group">
      <span className="transition-colors duration-300">{title}</span>
      <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
