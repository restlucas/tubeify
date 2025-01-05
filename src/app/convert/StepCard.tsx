import { PlaylistContext } from "@/contexts/PlaylistContext";
import { useContext } from "react";

interface CardProps {
  step: number;
  totalSteps: number;
  onConvert: () => void;
  onFinish: () => void;
  children: React.ReactNode;
}

export function StepCard({
  step,
  totalSteps,
  onConvert,
  onFinish,
  children,
}: CardProps) {
  const { selectedPlaylists } = useContext(PlaylistContext);

  return (
    <div className="flex flex-col items-center justify-center w-[500px] h-[700px] bg-cyan-600 rounded-md bg-gradient-to-r from-violet-500 to-blue-500 p-1">
      <div className="w-full h-full p-4 flex flex-col bg-[#141414]">
        <div className="flex-1">{children}</div>

        <div className="flex items-start justify-end gap-4">
          {step < totalSteps - 1 ? (
            <button
              onClick={onConvert}
              className={`font-semibold text-white px-4 py-2 rounded ${
                selectedPlaylists.length < 1
                  ? "disabled pointer-events-none bg-gray-500"
                  : "bg-gradient-to-r from-violet-500 to-blue-500 "
              }`}
            >
              Convert
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
