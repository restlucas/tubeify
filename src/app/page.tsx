import { Authentication } from "@/components/Authentication";
import { Presentation } from "@/components/Presentation";

export default function Home() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="">
        <Presentation />

        <div className="mt-16 mb-4 text-center">
          Please make sure login in the platforms
        </div>
        <Authentication />
      </div>
    </div>
  );
}
