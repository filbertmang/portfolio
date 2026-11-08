"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LiquidTabs, type LiquidTab } from "@/components/ui/liquid-tabs";
import { CompanyLogo, type CompanyId } from "@/components/CompanyLogos";

export interface WorkExperienceTabItem {
  id: CompanyId;
  label: string;
  href: string;
  color: string;
  foreground: string;
}

export const WORK_EXPERIENCE_TABS: WorkExperienceTabItem[] = [
  {
    id: "float",
    label: "Float",
    href: "/work/float",
    color: "#0D1926",
    foreground: "#F9FCFF",
  },
  {
    id: "7shifts",
    label: "7shifts",
    href: "/work/7shifts",
    color: "#FF6808",
    foreground: "#FFFFFF",
  },
  {
    id: "sonnet",
    label: "Sonnet",
    href: "/work/sonnet",
    color: "#2F3737",
    foreground: "#FFFFFF",
  },
  {
    id: "teck",
    label: "Teck",
    href: "/work/teck",
    color: "#0E107C",
    foreground: "#FFFFFF",
  },
  {
    id: "telus-digital",
    label: "TELUS Digital",
    href: "/work/telus-digital",
    color: "#DF0173",
    foreground: "#FFFFFF",
  },
  {
    id: "visier",
    label: "Visier",
    href: "/work/visier",
    color: "#0A7C80",
    foreground: "#FFFFFF",
  },
  {
    id: "gojek",
    label: "Gojek",
    href: "/work/gojek",
    color: "#00880F",
    foreground: "#FFFFFF",
  },
];

export function isHomeExperiencePath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  if (pathname.startsWith("/work/")) return true;
  return false;
}

function OverviewDuckIcon({ className = "size-4 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8.5 19.5C5.46 19.5 3 17.26 3 14.5C3 12.92 3.81 11.52 5.08 10.61C5.42 10.37 5.6 9.95 5.49 9.55C5.29 8.85 5.25 8.08 5.47 7.28C6.06 5.14 8.21 3.79 10.39 4.21C12.22 4.56 13.55 6.08 13.73 7.89C13.77 8.3 14.12 8.6 14.53 8.58C15.55 8.53 16.65 8.75 17.62 9.25C19.68 10.31 20.62 12.56 19.95 14.88C19.16 17.61 16.58 19.5 13.62 19.5H8.5Z"
        fill="currentColor"
      />
      <path
        d="M5.2 7.2L2.65 7.85C2.12 7.98 1.95 8.64 2.34 9.02L4.25 10.85L5.2 7.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HomeExperienceTabs() {
  const pathname = usePathname();

  if (!isHomeExperiencePath(pathname)) {
    return null;
  }

  const isOverview = pathname === "/";

  // Resolve active tab from URL; default to "/" (Overview) when at "/"
  const activeHref =
    pathname === "/"
      ? "/"
      : pathname === "/work/willowtree"
        ? "/work/telus-digital"
        : pathname || "/";

  const tabs: LiquidTab[] = [
    {
      value: "/",
      label: "Overview",
      href: "/",
      icon: <OverviewDuckIcon className="size-4 shrink-0" />,
      color: "#0D1926",
      foreground: "#F9FCFF",
    },
    ...WORK_EXPERIENCE_TABS.map((item) => ({
      value: item.href,
      label: item.label,
      href: item.href,
      icon: <CompanyLogo company={item.id} variant="glyph" className="size-4 shrink-0" />,
      color: item.color,
      foreground: item.foreground,
    })),
  ];

  return (
    <div
      className={`w-full flex justify-center px-4 pt-4 pb-2 z-30 transition-colors duration-220 ${
        isOverview ? "bg-[#f5f1ec] dark:bg-[#070e17]" : ""
      }`}
    >
      <LiquidTabs
        label="Work experiences"
        value={activeHref}
        size="md"
        tabs={tabs}
      />
    </div>
  );
}
