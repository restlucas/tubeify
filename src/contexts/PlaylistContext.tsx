import React, { createContext, ReactNode, useState } from "react";

interface PlaylistsContextType {
  destination: string;
  selectedPlaylists: {
    id: string;
    name: string;
  }[];
  updateDestination: (provider: string) => void;
  updateSelectedPlaylists: (
    playlist?: { id: string; name: string } | null
  ) => void;
}

interface PlaylistContextProviderProps {
  children: ReactNode;
}

export const PlaylistContext = createContext({} as PlaylistsContextType);

export function PlaylistContextProvider({
  children,
}: PlaylistContextProviderProps) {
  const [selectedPlaylists, setSelectedPlaylists] = useState<
    { id: string; name: string }[]
  >([]);
  const [destination, setDestination] = useState<string>("youtube");

  const updateSelectedPlaylists = (
    playlist: { id: string; name: string } | null = null
  ) => {
    if (playlist) {
      const playlistToSave = playlist;

      setSelectedPlaylists((prevPlaylists) => {
        if (prevPlaylists.some((p) => p.id === playlistToSave.id)) {
          return prevPlaylists.filter((p) => p.id !== playlistToSave.id);
        } else {
          return [...prevPlaylists, playlistToSave];
        }
      });
    } else {
      setSelectedPlaylists([]);
    }
  };

  const updateDestination = (provider: string) => {
    setDestination(provider);
  };

  return (
    <PlaylistContext.Provider
      value={{
        destination,
        selectedPlaylists,
        updateDestination,
        updateSelectedPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}
