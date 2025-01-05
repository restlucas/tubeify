"use client";

import { SpotifyLogo, YoutubeLogo } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import successSvg from "../../../../public/success.svg";
import { useContext, useEffect, useState } from "react";
import { PlaylistContext } from "@/contexts/PlaylistContext";
import { youtubeService } from "@/services/youtubeServices";
import { spotifyService } from "@/services/spotifyServices";

export function Step2() {
  const { destination, selectedPlaylists } = useContext(PlaylistContext);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const convertPlaylists = async () => {
      if (destination == "spotify") {
        const userId = localStorage.getItem("@spotify:id");
        await spotifyService.createPlaylist(userId, selectedPlaylists);
      } else if (destination === "youtube") {
        await youtubeService.createPlaylist(selectedPlaylists);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
    };

    convertPlaylists();
  }, []);

  return (
    <div className="animate-fadeInRightToLeft h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        {loading ? (
          <>
            <span className="font-semibold text-xl">
              Converting playlists to {destination}
            </span>

            <div className="flex w-full items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          </>
        ) : (
          <>
            <Image alt="Success" src={successSvg} width={100} height={100} />

            <span className="font-semibold text-xl">
              Playlists created successfully, thank you! 😊
            </span>

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2"
            >
              <span className="font-bold hover:underline cursor-pointer">
                Go to my playlists
              </span>
              {destination === "spotify" ? (
                <SpotifyLogo size={24} weight="fill" color="#1db954" />
              ) : (
                <YoutubeLogo size={24} weight="fill" color="#ff4444" />
              )}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
