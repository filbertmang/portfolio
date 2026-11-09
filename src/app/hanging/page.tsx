import { Metadata } from "next";
import { HangingSection } from "@/components/hanging/HangingSection";

export const metadata: Metadata = {
  title: "Hanging — Filbert Mangundap",
  description:
    "Meet the people behind the work. Interactive hanging team profile cards with organic pendulum physics, holographic foil shimmer, and 3D card flipping.",
};

export default function HangingPage() {
  return (
    <main className="min-h-screen w-full bg-white dark:bg-[#0d1017] transition-colors duration-200 flex flex-col justify-start">
      <HangingSection />
    </main>
  );
}
