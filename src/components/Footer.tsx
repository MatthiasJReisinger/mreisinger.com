import { SiGithub } from "@icons-pack/react-simple-icons";
import { Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="p-10 space-y-2">
      <div className="flex flex-row justify-center space-x-4">
        <a href="mailto:mail@mreisinger.com">
          <Mail />
        </a>
        <a href="https://github.com/MatthiasJReisinger" target="_blank">
          <SiGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/matthias-reisinger/"
          target="_blank"
        >
          <Linkedin />
        </a>
      </div>
      <div className="flex flex-row justify-center space-x-2">
        <div>Matthias Reisinger</div>
        <div>•</div>
        <div>© {new Date().getFullYear()}</div>
        <div>•</div>
        <div>
          <Link href="/imprint">Imprint</Link>
        </div>
      </div>
    </footer>
  );
}
