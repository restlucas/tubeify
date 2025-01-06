"use client";

import { SpotifyLogo, YoutubeLogo } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import successSvg from "../../../../public/success.svg";
import { useContext, useState } from "react";
import { PlaylistContext } from "@/contexts/PlaylistContext";
import { youtubeService } from "@/services/youtubeServices";
import { spotifyService } from "@/services/spotifyServices";

export function Step2() {
  const { destination, selectedPlaylists } = useContext(PlaylistContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    { message: string; playlistName: string; statusCode: number }[] | []
  >([]);

  const convertPlaylists = async () => {
    setLoading(true);
    let response;

    if (destination == "spotify") {
      const userId = localStorage.getItem("@spotify:id");
      response = await spotifyService.createPlaylist(userId, selectedPlaylists);
    } else if (destination === "youtube") {
      response = await youtubeService.createPlaylist(selectedPlaylists);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    setMessages(response);
    setLoading(false);
  };

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
        ) : messages.length > 0 ? (
          <>
            <Image alt="Success" src={successSvg} width={100} height={100} />

            <span className="font-semibold text-xl">All set! 😊</span>

            <div className="w-full flex flex-col items-center justify-start gap-2">
              {messages &&
                messages.map((message, index) => {
                  return (
                    <div key={index} className="text-sm text-slate-500">
                      {message.message}
                    </div>
                  );
                })}
            </div>

            <Link
              href="https://open.spotify.com/collection/tracks"
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
        ) : (
          <button
            type="button"
            onClick={convertPlaylists}
            className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-violet-500 to-blue-500 font-semibold"
          >
            Start conversion
          </button>
        )}
      </div>
    </div>
  );
}
