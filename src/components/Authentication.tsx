"use client";

import { SpotifyLogo, YoutubeLogo } from "@phosphor-icons/react";
import { Button } from "./Button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Profile {
  provider_name: string | null;
  user_name: string | null;
  user_picture: string | null;
}

const providers = ["spotify", "youtube"];

export function Authentication() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const hasAllProviders = providers.every((provider) =>
    profiles.some((profile) => profile.provider_name === provider)
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      providers.map((provider) => {
        const name = localStorage.getItem(`@${provider}:name`);
        const picture = localStorage.getItem(`@${provider}:picture`);

        if (name && picture) {
          setProfiles((prevState) => [
            ...prevState,
            {
              provider_name: provider,
              user_name: name,
              user_picture: picture,
            },
          ]);
        }
      });
    }
  }, []);

  return (
    <div className="grid grid-cols-[192px_192px] gap-4 items-center justify-center">
      <Button
        providerName="spotify"
        providerIcon={<SpotifyLogo size={24} weight="bold" color="#ffffff" />}
        profile={
          !!profiles.find((profile) => profile.provider_name === "spotify")
            ?.user_name
        }
      />
      <Button
        providerName="youtube"
        providerIcon={<YoutubeLogo size={24} weight="bold" color="#ffffff" />}
        profile={
          !!profiles.find((profile) => profile.provider_name === "youtube")
            ?.user_name
        }
      />

      <Link
        href="/convert"
        className={`text-center col-span-full  rounded-md flex items-center justify-center p-[3px] ${
          hasAllProviders
            ? "bg-gradient-to-r from-violet-500 to-blue-500"
            : "cursor-not-allowed pointer-events-none disabled bg-gray-400"
        }`}
      >
        <span className="w-full h-full bg-background py-2 font-semibold">
          {"Let's get started"}
        </span>
      </Link>
    </div>
  );
}
