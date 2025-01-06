import { getCookies } from "@/utils/cookies";
import axios from "axios";

const SPOTIFY_AUTH_BASE = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

type Playlist = {
  id: string;
  name: string;
};

type TrackInfo = {
  artist: string;
  track: string;
};

type YouTubeVideoItem = {
  contentDetails: {
    videoId: string;
  };
};

type YouTubePlaylistResponse = {
  data: {
    nextPageToken: string;
    items: YouTubeVideoItem[];
  };
};

type YouTubeVideoSnippet = {
  title: string;
};

type YouTubeVideoResponse = {
  items: { snippet: YouTubeVideoSnippet }[];
};

type SpotifyTrack = {
  id: string;
};

type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
  };
};

type CreatePlaylistResult = {
  playlistName: string;
  statusCode: number;
  message: string;
};

export const spotifyService = {
  /**
   * Generate authentication URL to redirect user
   */
  getAccessTokenUrl: (): string => {
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

    const { access_token }: { access_token: string } = response.data;
    return access_token;
  },

  /**
   * Searches the playlists of the logged in user.
   */
  getPlaylists: async (): Promise<Playlist[]> => {
    const accessTokenInCookies = await getCookies("spotify");

    const response = await axios.get<{ items: Playlist[] }>(
      `${SPOTIFY_API_BASE}/me/playlists`,
      {
        headers: {
          Authorization: `Bearer ${accessTokenInCookies}`,
        },
      }
    );

    return response.data.items;
  },

  /**
   * Create a new playlist.
   * * @param userId    Spotify user id
   * * @param playlists Selected playlists from user's youtube
   */
  createPlaylist: async (
    userId: string | null,
    playlists: Playlist[]
  ): Promise<CreatePlaylistResult[]> => {
    const youtubeAccessToken = await getCookies("youtube");
    const spotifyAccessToken = await getCookies("spotify");

    const getYouTubePlaylistTracks = async (playlistId: string) => {
      let trackIds: string[] = [];
      let nextPageToken: string | undefined = undefined;

      do {
        const response = (await axios.get(
          `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}${
            nextPageToken ? `&pageToken=${nextPageToken}` : ""
          }`,
          {
            headers: {
              Authorization: `Bearer ${youtubeAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        )) as YouTubePlaylistResponse;

        trackIds = trackIds.concat(
          response.data.items.map(
            (item: YouTubeVideoItem) => item.contentDetails.videoId
          )
        );

        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);

      return { trackIds };
    };

    const extractArtistAndTrack = (trackName: string): TrackInfo => {
      const separator = trackName.includes(" - ")
        ? " - "
        : trackName.includes(" – ")
        ? " – "
        : null;

      if (!separator) {
        return { artist: "", track: trackName.trim() };
      }

      const [artist, ...trackParts] = trackName.split(separator);
      const track = trackParts.join(separator).trim();

      return {
        artist: artist.trim(),
        track: track,
      };
    };

    const results: CreatePlaylistResult[] = [];

    for (const playlist of playlists) {
      const batchSize = 20;
      const tracks: string[] = [];

      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const { trackIds } = await getYouTubePlaylistTracks(playlist.id);

      for (let i = 0; i < trackIds.length; i += batchSize) {
        const batchTrackIds = trackIds.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batchTrackIds.map(async (videoId: string): Promise<string | null> => {
            const youtubeTrackInfo = await axios.get<YouTubeVideoResponse>(
              `${YOUTUBE_API_BASE}/videos?part=snippet&id=${videoId}`,
              {
                headers: {
                  Authorization: `Bearer ${youtubeAccessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const { title: trackTitle } =
              youtubeTrackInfo.data.items[0].snippet;

            const cleanedTrackName = trackTitle
              .replace(/\(.*?\)/g, "")
              .replace(/\[.*?\]/g, "")
              .replace(
                /official audio|official video|official music video|audio|explicit - official video|music video|visualizer|explicit video|lyric video/gi,
                ""
              )
              .trim();

            const { artist, track } = extractArtistAndTrack(cleanedTrackName);

            const spotifyTrackInfo = await axios.get<SpotifySearchResponse>(
              `${SPOTIFY_API_BASE}/search`,
              {
                params: {
                  q:
                    track !== ""
                      ? `track:${track} artist:${artist}`
                      : `track:${track}`,
                  type: "track",
                  limit: 1,
                },
                headers: {
                  Authorization: `Bearer ${spotifyAccessToken}`,
                },
              }
            );

            return spotifyTrackInfo.data.tracks.items[0]?.id || null;
          })
        );

        tracks.push(...batchResults.filter((trackId) => trackId !== null));
        await sleep(2000);
      }

      if (tracks.length > 0) {
        const createPlaylistResponse = await axios.post<{
          id: string;
        }>(
          `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
          {
            name: playlist.name,
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

        await axios.post(
          `${SPOTIFY_API_BASE}/playlists/${spotifyPlaylistId}/tracks`,
          {
            uris: tracks.map((trackId) => `spotify:track:${trackId}`),
          },
          {
            headers: {
              Authorization: `Bearer ${spotifyAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        results.push({
          playlistName: playlist.name,
          statusCode: 201,
          message: `Playlist "${playlist.name}" created with ${tracks.length} tracks.`,
        });
      } else {
        results.push({
          playlistName: playlist.name,
          statusCode: 204,
          message: `Playlist "${playlist.name}" created, but no tracks were found or added.`,
        });
      }
    }

    return results;
  },
};
