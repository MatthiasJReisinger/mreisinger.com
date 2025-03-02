import Link from "next/link";

interface NavBarItemProps {
  href: string;
  title: string;
}

export default function NavBarItem({ href, title }: NavBarItemProps) {
  return (
    <Link href={href} className="px-2">
      {title}
    </Link>
  );
}
