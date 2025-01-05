"use client";

import { PlaylistContext } from "@/contexts/PlaylistContext";
import { spotifyService } from "@/services/spotifyServices";
import { youtubeService } from "@/services/youtubeServices";
import { SpotifyPlaylist, YoutubePlaylist } from "@/types/playlists";
import {
  ArrowCircleRight,
  ArrowsClockwise,
  Download,
  SpotifyLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import { useContext, useState } from "react";

interface OriginProps {
  name: string;
  icon: React.ReactNode;
}

const destinations = [
  {
    name: "spotify",
    icon: <SpotifyLogo size={28} weight="fill" className="fill-spotify" />,
  },
  {
    name: "youtube",
    icon: <YoutubeLogo size={28} weight="fill" className="fill-youtube" />,
  },
];

export function Step1() {
  const { selectedPlaylists, updateDestination, updateSelectedPlaylists } =
    useContext(PlaylistContext);

  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [origin, setOrigin] = useState<OriginProps>(destinations[0]);
  const [playlists, setPlaylists] = useState<
    SpotifyPlaylist[] | YoutubePlaylist[] | []
  >([]);

  const handleDestination = () => {
    updateDestination(origin.name);

    const newOrigin = destinations.find(
      (to) => to.name !== origin.name
    ) as OriginProps;

    setPlaylists([]);
    updateSelectedPlaylists();
    setOrigin(newOrigin);
  };

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    let playlists;

    if (origin.name === "spotify") {
      playlists = await spotifyService.getPlaylists();
    }

    if (origin.name === "youtube") {
      playlists = await youtubeService.getPlaylists();
    }

    setPlaylists(playlists);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoadingPlaylists(false);
  };

  return (
    <div className="animate-fadeInRightToLeft h-full">
      <div>
        <p className="mb-2">Destination</p>
        <div className="flex items-center justify-start gap-2">
          <div className="flex items-center justify-center gap-4 bg-background px-4 h-12 rounded-md">
            {origin?.icon}
            <ArrowCircleRight weight="bold" size={22} />
            {destinations.find((from) => from.name !== origin?.name)?.icon}
          </div>
          <button
            title="Change destination"
            onClick={handleDestination}
            className="h-12 px-4 flex items-center justify-center bg-background rounded-md"
          >
            <ArrowsClockwise weight="bold" size={22} />
          </button>
          <button
            onClick={fetchPlaylists}
            title="Fetch playlists"
            className="px-4 h-12 bg-background rounded-md"
          >
            <Download weight="bold" size={22} />
          </button>
        </div>
      </div>

      {/* Playlists */}
      {loadingPlaylists ? (
        <div className="pt-4 h-[524px] flex items-center justify-center">
          <div className="flex w-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        </div>
      ) : playlists.length > 0 ? (
        <div className="pt-4 h-[524px]">
          <div>
            <p className="text-2xl">
              Your{" "}
              <span className="capitalize font-semibold">{origin.name}</span>{" "}
              playlists
            </p>
            <p className="text-sm text-gray-300 mb-6">
              Select the ones you want to convert
            </p>
          </div>

          <div className="w-full h-[400px] overflow-y-scroll pr-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-r from-violet-500 to-blue-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar]:w-1">
            <div className="w-full flex flex-col gap-3">
              {playlists.map((playlist) => {
                return (
                  <label
                    htmlFor={playlist.id}
                    key={playlist.id}
                    className="w-full rounded-md bg-background h-16 flex items-center cursor-pointer justify-start duration-100 hover:bg-black/80"
                  >
                    <div
                      className="h-full min-w-16 rounded-md bg-cyan-700 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${
                          (playlist.images && playlist.images[0].url) ||
                          (playlist.snippet &&
                            playlist.snippet.thumbnails.default.url)
                        })`,
                      }}
                    />
                    <div className="px-4 w-full flex items-center justify-between">
                      <div className="">
                        <p className="text-sm font-semibold line-clamp-1">
                          {playlist.name || playlist.snippet.title}
                        </p>
                        <span className="text-xs">
                          {(playlist.tracks && playlist.tracks.total) ||
                            (playlist.contentDetails &&
                              playlist.contentDetails.itemCount)}{" "}
                          tracks
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        name="selectedPlaylist"
                        id={playlist.id}
                        onChange={() =>
                          updateSelectedPlaylists({
                            id: playlist.id,
                            name: playlist.name || playlist.snippet.title,
                          })
                        }
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex h-8 items-center justify-start">
            <span className="text-sm font-semibold">
              {selectedPlaylists.length} playlists selected
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-4 h-[524px] flex items-center justify-center">
          <span className="font-semibold text-2xl">
            Please load your playlists 😊
          </span>
        </div>
      )}
    </div>
  );
}
