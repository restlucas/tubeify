import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";

export interface StepConfig {
  id: string;
  title: string;
  component: React.FC;
}

export const stepsConfig: StepConfig[] = [
  {
    id: "step1",
    title: "Step 1",
    component: Step1,
  },
  {
    id: "step2",
    title: "Step 2",
    component: Step2,
  },
];
