"use client";

import { useContext, useState } from "react";
import { StepCard } from "./StepCard";
import { stepsConfig } from "./stepConfig";
import { PlaylistContext } from "@/contexts/PlaylistContext";
import { useRouter } from "next/navigation";

export default function Convert() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const { updateSelectedPlaylists } = useContext(PlaylistContext);

  const convertPlaylists = () => {
    setCurrentStep((prev) => Math.min(prev + 1, stepsConfig.length - 1));
  };

  const handleFinish = () => {
    updateSelectedPlaylists();
    router.push("/");
  };

  const CurrentStepComponent = stepsConfig[currentStep].component;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <StepCard
        step={currentStep}
        totalSteps={stepsConfig.length}
        onConvert={convertPlaylists}
        onFinish={handleFinish}
      >
        <CurrentStepComponent />
      </StepCard>
    </div>
  );
}
