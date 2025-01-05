"use client";

import { PlaylistContextProvider } from "@/contexts/PlaylistContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PlaylistContextProvider>{children}</PlaylistContextProvider>;
}
