import Image from "next/image";
import profilePic from "../../public/images/profile-pic.jpg";

export default function Home() {
  return (
    <div className="mt-12 flex">
      {/* Profile Column */}
      <div className="w-1/3">
        <Image
          src={profilePic}
          alt="Me @ EuroRust 2024"
          className="rounded-full shadow-lg shadow-gray-300"
        />
      </div>
      {/* Biography Column */}
      <div className="w-2/3 pl-10 my-auto space-y-2">
        <h2 className="mb-5">About me</h2>
        <p>
          Hi! I&apos;m Matthias, a software engineer based in Vienna, Austria.
          Over the years, I&apos;ve had the privilege to join exceptional teams
          to work on a wide range of projects covering all kinds of
          technologies. I&apos;m dedicated to developing products that solve
          real problems, and enjoy collaborating with talented people who share
          a passion for technology. If you&apos;d like to learn more about my
          work, feel free to visit my{" "}
          <a
            href="https://www.linkedin.com/in/matthias-reisinger/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            LinkedIn profile
          </a>
          , check out my projects on{" "}
          <a
            href="https://github.com/MatthiasJReisinger"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GitHub
          </a>
          , or drop me an{" "}
          <a href="mailto:mail@mreisinger.com" className="underline">
            email
          </a>{" "}
          if you want to connect.
        </p>
      </div>
    </div>
  );
}
