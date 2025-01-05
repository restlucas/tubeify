"use client";

import React, { ReactElement } from "react";
import { spotifyService } from "@/services/spotifyServices";
import { youtubeService } from "@/services/youtubeServices";

interface ButtonProps {
  providerName: string;
  providerIcon: ReactElement;
  profile: boolean;
}

export const Button = ({
  providerName,
  providerIcon,
  profile,
}: ButtonProps) => {
  const handleLogin = (provider: string) => {
    if (provider === "spotify") {
      const loginUrl = spotifyService.getAccessTokenUrl();
      window.location.href = loginUrl;
    }
    if (provider === "youtube") {
      const loginUrl = youtubeService.getAccessTokenUrl();
      window.location.href = loginUrl;
    }
  };

  return (
    <button
      onClick={() => handleLogin(providerName)}
      className={`cursor-pointer flex items-center justify-center gap-2 font-semibold rounded-md w-48 px-4 py-2 duration-100 ${
        profile
          ? `disabled pointer-events-none cursor-not-allowed ${
              providerName === "spotify" ? "bg-spotify/50" : "bg-youtube/50"
            }`
          : `${providerName === "spotify" ? "bg-spotify" : "bg-youtube"}`
      }`}
    >
      {providerIcon}
      {profile ? (
        <span className="capitalize">Connected</span>
      ) : (
        <span className="capitalize">{providerName} login</span>
      )}
    </button>
  );
};
