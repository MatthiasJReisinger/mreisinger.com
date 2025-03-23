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
        <h2 className="font-bold text-3xl mb-5">About me</h2>
        <p>
          Hi! I am a Software Engineer based in Vienna, Austria. Over the years
          I&apos;ve had the privilege to work on a wide range of projects
          covering all kinds of technologies.
        </p>
        <p>
          You can find out more about my work history on{" "}
          <a
            href="https://www.linkedin.com/in/matthias-reisinger/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            LinkedIn
          </a>
          , find me on{" "}
          <a
            href="https://github.com/MatthiasJReisinger"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GitHub
          </a>{" "}
          , or contact me via{" "}
          <a href="mailto:mail@mreisinger.com" className="underline">
            mail
          </a>{" "}
          .
        </p>
      </div>
    </div>
  );
}
