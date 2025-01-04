"use client";

import { SpotifyLogo, YoutubeLogo } from "@phosphor-icons/react";
import { Button } from "./Button";
import Link from "next/link";

export function Authentication() {
  const spotifyProfile = {
    name:
      typeof window !== "undefined"
        ? localStorage.getItem("@spotify:name")
        : null,
    picture:
      typeof window !== "undefined"
        ? localStorage.getItem("@spotify:picture")
        : null,
  };

  const youtubeProfile = {
    name:
      typeof window !== "undefined"
        ? localStorage.getItem("@youtube:name")
        : null,
    picture:
      typeof window !== "undefined"
        ? localStorage.getItem("@youtube:picture")
        : null,
  };

  return (
    <div className="grid grid-cols-[192px_192px] gap-4 items-center justify-center">
      <Button
        providerName="spotify"
        providerIcon={<SpotifyLogo size={24} weight="bold" color="#ffffff" />}
        profile={spotifyProfile}
      />
      <Button
        providerName="youtube"
        providerIcon={<YoutubeLogo size={24} weight="bold" color="#ffffff" />}
        profile={youtubeProfile}
      />

      <Link
        href="/convert"
        className={`text-center col-span-full  rounded-md flex items-center justify-center p-[3px] ${
          spotifyProfile.name && youtubeProfile.name
            ? "bg-gradient-to-r from-violet-500 to-blue-500"
            : "cursor-not-allowed pointer-events-none disabled bg-gray-400"
        }`}
      >
        <span className="w-full h-full bg-background py-2 font-semibold">
          Let's get started
        </span>
      </Link>
    </div>
  );
}
