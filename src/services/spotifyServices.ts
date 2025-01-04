const SPOTIFY_AUTH_BASE = "https://accounts.spotify.com/authorize";
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

export const spotifyService = {
  getAccessTokenUrl: () => {
    const authUrl = `${SPOTIFY_AUTH_BASE}?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=playlist-read-private playlist-modify-private`;
    return authUrl;
  },
};
