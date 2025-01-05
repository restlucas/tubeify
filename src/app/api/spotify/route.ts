import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
}

interface SpotifyError {
  error: string;
  status: number;
}

// Get access_token function
async function getAccessToken(code: string): Promise<SpotifyTokenResponse> {
  const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code: String(code),
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      scope: scopes.join(" "),
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
    }
  );
  return response.data;
}

// Fetch playlists function
async function fetchPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
  const response = await axios.get(`${SPOTIFY_API_BASE}/me/playlists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.items;
}

// Main route
export async function POST(req: NextRequest) {
  const { code, action } = await req.json();

  try {
    // Action to get access_token
    if (action === "getAccessToken") {
      if (!code) {
        return NextResponse.json(
          { error: "Authorization code is required" },
          { status: 400 }
        );
      }
      const tokenData = await getAccessToken(code);
      return NextResponse.json({ provider: "spotify", ...tokenData });
    }

    // Action to fetch playlists
    if (action === "fetchPlaylists") {
      const authHeader = req.headers.get("Authorization");
      const accessToken = authHeader?.split(" ")[1];

      if (!accessToken) {
        return NextResponse.json(
          { error: "Access token is required" },
          { status: 401 }
        );
      }

      const playlists = await fetchPlaylists(accessToken);
      return NextResponse.json({ playlists });
    }

    // Invalid action
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    const spotifyError: SpotifyError = {
      error: error.response?.data.error || "Unknown error",
      status: error.response?.status || 500,
    };
    console.error("Spotify API Error:", spotifyError);

    return NextResponse.json(spotifyError, { status: spotifyError.status });
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "API funcionando corretamente" },
    {
      status: 405,
    }
  );
}
