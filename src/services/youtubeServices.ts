const YOUTUBE_BASE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI!;

export const youtubeService = {
  getAccessTokenUrl: () => {
    const authUrl = `${YOUTUBE_BASE_AUTH}?client_id=${YOUTUBE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(
      "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile"
    )}&access_type=online&prompt=consent`;
    return authUrl;
  },
};
