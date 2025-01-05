"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCookies } from "@/utils/cookies";
import { spotifyService } from "@/services/spotifyServices";
import axios from "axios";

export default function SpotifyCallback() {
  const router = useRouter();
  const [loading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const code = params.get("code");

        const accessToken = await spotifyService.getAccessToken(String(code));

        const userInfoResponse = await axios.get(
          "https://api.spotify.com/v1/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const userInfo = userInfoResponse.data;

        localStorage.setItem("@spotify:id", userInfo.id);
        localStorage.setItem("@spotify:name", userInfo.display_name);
        localStorage.setItem("@spotify:picture", userInfo.images[1].url);

        await setCookies("spotify-token", accessToken);

        setIsLoading(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push("/");
      } catch (error) {
        console.error("Erro ao obter informações do usuário:", error);
      }
    }

    fetchUserInfo();
  }, [router]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {loading ? (
        <div className="flex flex-col gap-4">
          <span>Processing authentication</span>

          <div className="flex w-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center justify-center">
          <span>Logged successful 😊</span>
          <span className="text-sm">Redirecting...</span>
        </div>
      )}
    </div>
  );
}
