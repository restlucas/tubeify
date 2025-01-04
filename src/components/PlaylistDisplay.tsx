"use client";

import React from "react";
import { youtubeService } from "../services/youtube";
import { spotifyService } from "../services/spotify";

const PlaylistDisplay = () => {
  const [youtubePlaylists, setYoutubePlaylists] = React.useState([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = React.useState([]);

  const fetchPlaylists = async () => {
    const youtubeData = await youtubeService.getPlaylists();
    setYoutubePlaylists(youtubeData);

    const spotifyData = await spotifyService.getPlaylists();
    setSpotifyPlaylists(spotifyData);
  };

  React.useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div>
      <h2>YouTube Playlists</h2>
      <ul>
        {youtubePlaylists.map((playlist) => (
          <li key={playlist.id}>{playlist.name}</li>
        ))}
      </ul>
      <h2>Spotify Playlists</h2>
      <ul>
        {spotifyPlaylists.map((playlist) => (
          <li key={playlist.id}>{playlist.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistDisplay;
