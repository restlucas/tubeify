import { getCookies } from "@/utils/cookies";
import axios from "axios";

const SPOTIFY_AUTH_BASE = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

export const spotifyService = {
  /**
   * Generate authentication URL to redirect user
   */
  getAccessTokenUrl: () => {
    const scopes = [
      "playlist-read-private",
      "playlist-modify-private",
      "playlist-modify-public",
    ].join(" ");
    const authUrl = `${SPOTIFY_AUTH_BASE}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(scopes)}`;
    return authUrl;
  },

  /**
   * Get access token code returned from spotify
   * @param code Authorization code obtained after login
   */
  getAccessToken: async (code: string): Promise<string> => {
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    const { access_token } = response.data;
    return access_token;
  },

  /**
   * Searches the playlists of the logged in user.
   * @param accessToken Spotify access token
   */
  getPlaylists: async () => {
    const accessTokenInCookies = await getCookies("spotify");

    const response = await axios.get(`${SPOTIFY_API_BASE}/me/playlists`, {
      headers: {
        Authorization: `Bearer ${accessTokenInCookies}`,
      },
    });

    return response.data.items;
  },

  /**
   * Create a new playlist.
   * @param userId Logged in user ID
   * @param playlists New playlist data
   */
  createPlaylist: async (
    userId: string | null,
    playlists: { id: string; name: string }[]
  ) => {
    const youtubeAccessToken = await getCookies("youtube");
    const spotifyAccessToken = await getCookies("spotify");

    // Função para obter informações das playlists do YouTube
    const getYouTubePlaylistTracks = async (playlistId: string) => {
      const response = await axios.get(
        `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${youtubeAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const videoIds = response.data.items.map(
        (item: any) => item.contentDetails.videoId
      );

      return { videoIds };
    };

    const allPlaylists = [];
    for (const playlist of playlists) {
      const { videoIds } = await getYouTubePlaylistTracks(playlist.id);

      const tracks = await Promise.all(
        videoIds.map(async (videoId) => {
          const youtubeTrackInfo = await axios.get(
            `${YOUTUBE_API_BASE}/videos?part=snippet&id=${videoId}`,
            {
              headers: {
                Authorization: `Bearer ${youtubeAccessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const { title: trackTitle } = youtubeTrackInfo.data.items[0].snippet;

          const spotifyTrackInfo = await axios.get(
            `${SPOTIFY_API_BASE}/search`,
            {
              params: {
                q: encodeURIComponent(`track:${trackTitle}`),
                type: "track",
                limit: 1,
              },
              headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
              },
            }
          );

          return true;
          // return {
          //   id: videoResponse.data.items[0].id,
          //   title: videoResponse.data.items[0].snippet.title,
          //   artist: videoResponse.data.items[0].snippet.channelTitle,
          // };
        })
      );

      const tracksByPlaylist = {
        playlistName: playlist.name,
        tracks: [...tracks],
      };

      allPlaylists.push(tracksByPlaylist);
    }

    return true;

    for (const playlist of allPlaylists) {
      const createPlaylistResponse = await axios.post(
        `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
        {
          name:
            playlist.tracks.length > 0 ? playlist.playlistName : "New playlist",
          description: `Created using Tubeify`,
        },
        {
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const spotifyPlaylistId = createPlaylistResponse.data.id;

      console.log(spotifyPlaylistId);
      return true;
      // Adicionar todas as músicas à playlist no Spotify
      for (const track of playlist.tracks) {
        await axios.post(
          `${SPOTIFY_API_BASE}/playlists/${spotifyPlaylistId}/tracks`,
          {
            uris: [`spotify:track:${track.id}`], // Aqui precisamos dos IDs do Spotify para cada música
          },
          {
            headers: {
              Authorization: `Bearer ${spotifyAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return true;
  },
};
