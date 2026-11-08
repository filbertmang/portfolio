"use client";

import React, { useEffect, useState } from "react";
import { DuckPond } from "./DuckPond";
import type { DuckVisualStyle } from "./DuckSvg";
import { usePrototypeControl } from "@/components/prototype-control";

export function OverviewLandingPage({
  duckStyle = "rubber",
}: {
  duckStyle?: DuckVisualStyle;
}) {
  const [isDark, setIsDark] = useState(false);
  const { activeApproach } = usePrototypeControl();

  useEffect(() => {
    const syncDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    syncDark();
    const observer = new MutationObserver(syncDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const resolvedDuckStyle: DuckVisualStyle =
    activeApproach === "approach-b" ? "classic" : duckStyle;

  return (
    <main className="flex-1 w-full bg-[#f5f1ec] dark:bg-[#070e17] flex flex-col items-center justify-center overflow-x-hidden transition-colors duration-220 py-4 sm:py-6">
      <div className="flex-1 flex items-center justify-center w-full">
        <DuckPond duckStyle={resolvedDuckStyle} isDark={isDark} />
      </div>
    </main>
  );
}
