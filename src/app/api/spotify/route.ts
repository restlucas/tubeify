import { NextResponse } from "next/server";

export async function POST(req) {
  const { code } = await req.json();
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: redirectUri ? String(redirectUri) : "",
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      provider: "spotify",
      access_token: data.access_token,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao obter access token" },
      { status: 500 }
    );
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
