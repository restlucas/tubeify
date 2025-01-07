"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCookies } from "@/utils/cookies";
import { youtubeService } from "@/services/youtubeServices";
import { setSessionStorageWithExpiry } from "@/utils/sessionStorage";

export default function YouTubeCallback() {
  const router = useRouter();
  const [loading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const code = params.get("code");

        const accessToken = await youtubeService.getAccessToken(String(code));

        const userInfo = await youtubeService.getUserInfo(accessToken);

        // const userInfoResponse = await axios.get(
        //   "https://www.googleapis.com/oauth2/v3/userinfo",
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //     },
        //   }
        // );

        setSessionStorageWithExpiry("@youtube:id", userInfo.sub, 1);
        setSessionStorageWithExpiry("@youtube:name", userInfo.name, 1);
        setSessionStorageWithExpiry("@youtube:picture", userInfo.picture, 1);

        await setCookies("youtube-token", accessToken);

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
          <span>Logged successfully 😊</span>
          <span className="text-sm">Redirecting...</span>
        </div>
      )}
    </div>
  );
}
