"use client";

import React, { ReactElement } from "react";
import { spotifyService } from "@/services/spotifyServices";
import { youtubeService } from "@/services/youtubeServices";

interface ButtonProps {
  providerName: string;
  providerIcon: ReactElement;
  profile: {
    name: string | null;
    picture: string | null;
  };
}

export const Button = ({
  providerName,
  providerIcon,
  profile,
}: ButtonProps) => {
  const handleLogin = (provider: string) => {
    if (provider === "spotify") {
      const authUrl = spotifyService.getAccessTokenUrl();
      window.location.href = authUrl;
    }
    if (provider === "youtube") {
      const authUrl = youtubeService.getAccessTokenUrl();
      window.location.href = authUrl;
    }
  };

  return (
    <button
      onClick={() => handleLogin(providerName)}
      className={`cursor-pointer flex items-center justify-center gap-2 font-semibold rounded-md w-48 px-4 py-2 duration-100 ${
        profile.name
          ? `disabled pointer-events-none cursor-not-allowed bg-${providerName}`
          : `bg-${providerName}`
      }`}
    >
      {providerIcon}
      {profile.name ? (
        <span className="capitalize">Connected</span>
      ) : (
        <span className="capitalize">{providerName} login</span>
      )}
    </button>
  );
};
