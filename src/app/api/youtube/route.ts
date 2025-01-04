import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const redirectUri = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI;

  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        client_id: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID as string,
        client_secret: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_SECRET as string,
        redirect_uri: redirectUri ? String(redirectUri) : "",
        scope: scopes.join(" "),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error getting access token");
    }

    return NextResponse.json({
      provider: "youtube",
      access_token: data.access_token,
    });
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Error getting access token" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "API funcionando corretamente" },
    { status: 405 }
  );
}
