import { getCookies } from "@/utils/cookies";
import axios from "axios";

const YOUTUBE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI!;

export const youtubeService = {
  /**
   * Fetches user info after authentication.
   * @param accessToken YouTube API access token
   */
  getUserInfo: async (accessToken: string) => {
    const response = await axios.get(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  },

  /**
   * Generates the authorization URL to redirect the user to YouTube login.
   */
  getAccessTokenUrl: () => {
    const scopes = [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/youtube.upload",
    ].join(" ");
    const authUrl = `${YOUTUBE_AUTH_BASE}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
    return authUrl;
  },

  /**
   * Exchanges the authorization code for an access token.
   * @param code Authorization code returned by YouTube after login
   */
  getAccessToken: async (code: string): Promise<string> => {
    const response = await axios.post(
      YOUTUBE_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = response.data;
    return access_token;
  },

  /**
   * Fetches the playlists of the authenticated user.
   * @param accessToken YouTube API access token
   */
  getPlaylists: async () => {
    const accessTokenInCookies = await getCookies("youtube");
    let allPlaylists: any = [];
    let nextPageToken = "";

    do {
      const response = await axios.get(
        `${YOUTUBE_API_BASE}/playlists?part=snippet,contentDetails&mine=true&pageToken=${nextPageToken}`,
        {
          headers: {
            Authorization: `Bearer ${accessTokenInCookies}`,
          },
        }
      );

      allPlaylists = allPlaylists.concat(response.data.items);
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken); // Continue até não haver mais páginas

    return allPlaylists;
  },

  /**
   * Creates a new playlist for the authenticated user.
   * @param playlistData Data for the new playlist
   */
  createPlaylist: async (playlists: { id: string; name: string }[]) => {
    const youtubeAccessToken = await getCookies("youtube");
    const spotifyAccessToken = await getCookies("spotify");

    const getSpotifyPlaylistTracks = async (playlistId: string) => {
      let tracksItems: { id: string; name?: string; artist?: string }[] = [];
      let offset = 0;
      const limit = 50;
      let hasNextPage = true;

      do {
        const response = await axios.get(
          `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
          {
            params: {
              limit,
              offset,
            },
            headers: {
              Authorization: `Bearer ${spotifyAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        tracksItems = tracksItems.concat(
          response.data.items.map((item: any) => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists
              .map((artist: any) => artist.name)
              .join(", "),
          }))
        );

        hasNextPage = response.data.next !== null;
        offset += limit;
      } while (hasNextPage);

      return { tracksItems };
    };

    const results: [] = [];

    for (const playlist of playlists) {
      const batchSize = 20;
      const tracks: string[] = [];
      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const { tracksItems } = await getSpotifyPlaylistTracks(playlist.id);

      for (let i = 0; i < tracksItems.length; i += batchSize) {
        const batchTracks = tracksItems.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batchTracks.map(
            async ({ name: trackName, artist: trackArtist }): Promise<any> => {
              const youtubeTrackInfo = await axios.get(
                `${YOUTUBE_API_BASE}/search`,
                {
                  params: {
                    q: `${trackName} ${trackArtist}`,
                    type: "video",
                    part: "snippet",
                    maxResults: batchSize,
                  },
                  headers: {
                    Authorization: `Bearer ${youtubeAccessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              return youtubeTrackInfo.data.items[0].id.videoId || null;
            }
          )
        );

        tracks.push(...batchResults.filter((trackId) => trackId !== null));
        await sleep(2000);
      }

      console.log(tracks);
      return true;
    }

    return results;

    // Obter o nome da playlist do Spotify
    const getSpotifyPlaylistName = async (playlistId: string) => {
      const spotifyAccessToken = await getCookies("spotify");

      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.name; // Nome da playlist
    };

    // Criar a playlist no YouTube com o mesmo nome da playlist do Spotify
    const playlistName = await getSpotifyPlaylistName(playlistIds[0].id);

    const response = await axios.post(
      `${YOUTUBE_API_BASE}/playlists?part=snippet,status`,
      {
        snippet: {
          title: playlistName,
          description: `Created by Tubeify`,
        },
        status: {
          privacyStatus: "public",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const playlistId = response.data.id;

    // Adicionar músicas à playlist do YouTube
    for (const track of allTracks) {
      await axios.post(
        `${YOUTUBE_API_BASE}/playlistItems?part=snippet`,
        {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: track.videoId,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return response.data;
  },
};
