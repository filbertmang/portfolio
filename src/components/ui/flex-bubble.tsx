// Calendly Flex Bubbles & Liquid Tabs Brand System
// Inspired by Calendly's brand overhaul by Smith & Diction
// https://designcompass.org/en/2026/08/20/calendly-flex-bubbles-brand-system/

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidTabs, type LiquidTab } from "./liquid-tabs";

/* ─────────────────────────────────────────────────────────
 * 1. GEOMETRY ENGINE: Mathematical Bridge Path Generation
 * ───────────────────────────────────────────────────────── */

export interface BridgeParams {
  x1: number;
  x2: number;
  yc: number;
  hAttach?: number;
  hWaist?: number;
  curveTension?: number;
}

/**
 * Computes an organic concave fillet bridge connecting two adjacent horizontal
 * bubbles (e.g., [Icon] ~ [Event Type] ~ [Status] in Image 1).
 */
export function computeHorizontalChainBridgePath({
  x1,
  x2,
  yc,
  hAttach = 34,
  hWaist = 18,
  curveTension = 0.32,
}: BridgeParams): string {
  const g = Math.max(2, x2 - x1);
  const yTopAttach = yc - hAttach / 2;
  const yTopWaist = yc - hWaist / 2;
  const yBottomAttach = yc + hAttach / 2;
  const yBottomWaist = yc + hWaist / 2;

  const topC1x = x1 + g * curveTension;
  const topC1y = yTopWaist;
  const topC2x = x2 - g * curveTension;
  const topC2y = yTopWaist;

  const botC1x = x2 - g * curveTension;
  const botC1y = yBottomWaist;
  const botC2x = x1 + g * curveTension;
  const botC2y = yBottomWaist;

  const r = (n: number) => Math.round(n * 100) / 100;

  return (
    `M ${r(x1)} ${r(yTopAttach)} ` +
    `C ${r(topC1x)} ${r(topC1y)}, ${r(topC2x)} ${r(topC2y)}, ${r(x2)} ${r(yTopAttach)} ` +
    `L ${r(x2)} ${r(yBottomAttach)} ` +
    `C ${r(botC1x)} ${r(botC1y)}, ${r(botC2x)} ${r(botC2y)}, ${r(x1)} ${r(yBottomAttach)} ` +
    `Z`
  );
}

/**
 * Computes a vertical bridge flaring down from an active tab bubble into
 * the top edge of a content card (Image 3).
 */
export function computeVerticalTabBridgePath(
  xc: number,
  yTabBottom: number,
  yCardTop: number,
  wNeck = 28,
  wBase = 72,
  tangentTension = 0.55
): string {
  const h = Math.max(4, yCardTop - yTabBottom);
  const xLeftTab = xc - wNeck / 2;
  const xRightTab = xc + wNeck / 2;
  const xLeftCard = xc - wBase / 2;
  const xRightCard = xc + wBase / 2;

  const c1x = xLeftTab;
  const c1y = yTabBottom + h * tangentTension;
  const c2x = xLeftCard + (xLeftTab - xLeftCard) * 0.22;
  const c2y = yCardTop;

  const c3x = xRightCard - (xRightCard - xRightTab) * 0.22;
  const c3y = yCardTop;
  const c4x = xRightTab;
  const c4y = yTabBottom + h * tangentTension;

  const r = (n: number) => Math.round(n * 100) / 100;

  return (
    `M ${r(xLeftTab)} ${r(yTabBottom)} ` +
    `C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(xLeftCard)} ${r(yCardTop)} ` +
    `L ${r(xRightCard)} ${r(yCardTop)} ` +
    `C ${r(c3x)} ${r(c3y)}, ${r(c4x)} ${r(c4y)}, ${r(xRightTab)} ${r(yTabBottom)} ` +
    `Z`
  );
}

/**
 * Computes a horizontal bridge flaring right from an active tab bubble into
 * the left edge of a content card (Image 2).
 */
export function computeHorizontalTabBridgePath(
  yc: number,
  xTabRight: number,
  xCardLeft: number,
  hNeck = 28,
  hBase = 72,
  tangentTension = 0.55
): string {
  const w = Math.max(4, xCardLeft - xTabRight);
  const yTopTab = yc - hNeck / 2;
  const yBottomTab = yc + hNeck / 2;
  const yTopCard = yc - hBase / 2;
  const yBottomCard = yc + hBase / 2;

  const c1x = xTabRight + w * tangentTension;
  const c1y = yTopTab;
  const c2x = xCardLeft;
  const c2y = yTopCard + (yTopTab - yTopCard) * 0.22;

  const c3x = xCardLeft;
  const c3y = yBottomCard - (yBottomCard - yBottomTab) * 0.22;
  const c4x = xTabRight + w * tangentTension;
  const c4y = yBottomTab;

  const r = (n: number) => Math.round(n * 100) / 100;

  return (
    `M ${r(xTabRight)} ${r(yTopTab)} ` +
    `C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(xCardLeft)} ${r(yTopCard)} ` +
    `L ${r(xCardLeft)} ${r(yBottomCard)} ` +
    `C ${r(c3x)} ${r(c3y)}, ${r(c4x)} ${r(c4y)}, ${r(xTabRight)} ${r(yBottomTab)} ` +
    `Z`
  );
}

/* ─────────────────────────────────────────────────────────
 * 2. STANDALONE FLEX BUBBLE COMPONENT
 * ───────────────────────────────────────────────────────── */

export interface FlexBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glass" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  label?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  interactive?: boolean;
  color?: string;
}

export function FlexBubble({
  variant = "solid",
  size = "md",
  icon,
  label,
  badge,
  active = false,
  interactive = false,
  color,
  className = "",
  children,
  ...props
}: FlexBubbleProps) {
  const sizeStyles = {
    sm: "h-9 px-3 text-xs gap-1.5 rounded-[16px]",
    md: "h-12 px-4 text-sm gap-2 rounded-[20px]",
    lg: "h-14 px-5 text-base gap-2.5 rounded-[24px]",
  };

  const variantStyles = {
    solid:
      "bg-white text-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:bg-slate-900 dark:text-white dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]",
    glass:
      "bg-white/70 backdrop-blur-md text-slate-900 border border-white/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:bg-slate-900/70 dark:text-white dark:border-white/10",
    outline:
      "bg-transparent border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100",
    ghost:
      "bg-slate-100/70 text-slate-700 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300",
  };

  return (
    <div
      data-flex-bubble
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 select-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${
        interactive ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
      } ${active ? "ring-2 ring-primary/40" : ""} ${className}`}
      style={color ? { borderColor: color } : undefined}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      {label && <span className="truncate">{label}</span>}
      {children}
      {badge && <span className="ml-1 shrink-0">{badge}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * 3. FLEX BUBBLE CHAIN (Image 1: [Icon] ~ [Event Type] ~ [Status])
 * ───────────────────────────────────────────────────────── */

export interface FlexBubbleSegment {
  id: string;
  type?: "icon" | "event" | "status" | "custom";
  content: React.ReactNode;
  sublabel?: string;
  isSerif?: boolean;
  color?: string;
  bgColor?: string;
  textColor?: string;
  onClick?: () => void;
}

export interface FlexBubbleChainProps {
  segments: FlexBubbleSegment[];
  className?: string;
  gap?: number;
  bridgeWaist?: number;
  bridgeAttach?: number;
  fillColor?: string;
  interactive?: boolean;
}

export function FlexBubbleChain({
  segments,
  className = "",
  gap = 14,
  bridgeWaist = 18,
  bridgeAttach = 34,
  fillColor = "#ffffff",
  interactive = true,
}: FlexBubbleChainProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [bridges, setBridges] = React.useState<string[]>([]);
  const [activeSegment, setActiveSegment] = React.useState<string | null>(null);

  const updateBridges = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const segmentEls = container.querySelectorAll<HTMLElement>("[data-chain-segment]");
    if (segmentEls.length < 2) {
      setBridges([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const newBridges: string[] = [];

    for (let i = 0; i < segmentEls.length - 1; i++) {
      const el1 = segmentEls[i];
      const el2 = segmentEls[i + 1];
      const r1 = el1.getBoundingClientRect();
      const r2 = el2.getBoundingClientRect();

      const x1 = r1.right - containerRect.left;
      const x2 = r2.left - containerRect.left;
      const yc = (r1.top + r1.bottom) / 2 - containerRect.top;

      const path = computeHorizontalChainBridgePath({
        x1: x1 - 1,
        x2: x2 + 1,
        yc,
        hAttach: bridgeAttach,
        hWaist: bridgeWaist,
      });
      newBridges.push(path);
    }

    setBridges(newBridges);
  }, [bridgeAttach, bridgeWaist]);

  React.useEffect(() => {
    updateBridges();
    const observer = new ResizeObserver(() => updateBridges());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [updateBridges, segments]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center select-none ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {/* SVG Bridge Layer connecting adjacent segments */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible z-0"
      >
        {bridges.map((path, idx) => (
          <path
            key={idx}
            d={path}
            fill={segments[idx]?.bgColor || fillColor}
            className="transition-all duration-300"
          />
        ))}
      </svg>

      {/* Segment bubbles */}
      {segments.map((seg) => {
        const isHovered = activeSegment === seg.id;
        return (
          <div
            key={seg.id}
            data-chain-segment
            onClick={() => {
              setActiveSegment(seg.id);
              seg.onClick?.();
            }}
            onMouseEnter={() => setActiveSegment(seg.id)}
            onMouseLeave={() => setActiveSegment(null)}
            className={`relative z-10 flex items-center justify-center rounded-[22px] px-5 py-3 transition-all duration-200 ${
              interactive ? "cursor-pointer active:scale-[0.98]" : ""
            } ${isHovered ? "shadow-xl -translate-y-0.5" : "shadow-md"}`}
            style={{
              backgroundColor: seg.bgColor || "#ffffff",
              color: seg.textColor || "#0f172a",
            }}
          >
            {seg.sublabel && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10.5px] font-mono tracking-wider uppercase opacity-65 pointer-events-none whitespace-nowrap">
                {seg.sublabel}
              </span>
            )}
            <div
              className={`flex items-center gap-2 ${
                seg.isSerif
                  ? "font-serif text-lg tracking-normal font-medium"
                  : "font-sans font-semibold text-base"
              }`}
            >
              {seg.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * 4. CALENDLY PRODUCT DATA & TABS
 * ───────────────────────────────────────────────────────── */

export interface CalendlyProductTab {
  id: string;
  name: string;
  badge?: string;
  headline: string;
  description: string;
  primaryAction: string;
  icon: React.ReactNode;
  accentColor: string;
  accentForeground: string;
  cardBg: string;
  cardText: string;
  pills: string[];
  mockup: React.ReactNode;
}

export interface FlexBubbleTabsProps {
  tabs: CalendlyProductTab[];
  activeId?: string;
  onTabChange?: (id: string) => void;
  orientation?: "horizontal" | "vertical";
  useLiquidMotion?: boolean;
  className?: string;
}

export function FlexBubbleTabs({
  tabs,
  activeId,
  onTabChange,
  orientation = "horizontal",
  useLiquidMotion = true,
  className = "",
}: FlexBubbleTabsProps) {
  const [internalActive, setInternalActive] = React.useState(activeId ?? tabs[0]?.id);
  const current = activeId !== undefined ? activeId : internalActive;
  const activeTab = tabs.find((t) => t.id === current) ?? tabs[0];

  const containerRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [bridgePath, setBridgePath] = React.useState<string>("");

  const updateBridge = React.useCallback(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const activeEl = tabRefs.current.get(current);
    if (!container || !card || !activeEl) {
      setBridgePath("");
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    if (orientation === "horizontal") {
      const xc = (tabRect.left + tabRect.right) / 2 - containerRect.left;
      const yTabBottom = tabRect.bottom - containerRect.top;
      const yCardTop = cardRect.top - containerRect.top;

      const path = computeVerticalTabBridgePath(
        xc,
        yTabBottom,
        yCardTop + 2,
        34,
        80
      );
      setBridgePath(path);
    } else {
      const yc = (tabRect.top + tabRect.bottom) / 2 - containerRect.top;
      const xTabRight = tabRect.right - containerRect.left;
      const xCardLeft = cardRect.left - containerRect.left;

      const path = computeHorizontalTabBridgePath(
        yc,
        xTabRight,
        xCardLeft + 2,
        34,
        82
      );
      setBridgePath(path);
    }
  }, [current, orientation]);

  React.useEffect(() => {
    updateBridge();
    const observer = new ResizeObserver(() => updateBridge());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateBridge]);

  const selectTab = (id: string) => {
    if (activeId === undefined) setInternalActive(id);
    onTabChange?.(id);
  };

  // Build tabs for LiquidTabs integration
  const liquidTabItems: LiquidTab[] = tabs.map((t) => ({
    value: t.id,
    label: (
      <span className="flex items-center gap-2">
        <span className="shrink-0">{t.icon}</span>
        <span className="font-semibold">{t.name}</span>
        {t.badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-black/10 dark:bg-white/20">
            {t.badge}
          </span>
        )}
      </span>
    ),
    ariaLabel: t.name,
    color: t.accentColor,
    foreground: t.accentForeground,
  }));

  return (
    <div
      ref={containerRef}
      className={`relative flex ${
        orientation === "horizontal"
          ? "flex-col items-center gap-3.5"
          : "flex-col md:flex-row items-center md:items-start gap-4"
      } ${className}`}
    >
      {/* Dynamic SVG Bridge connecting Active Bubble Tab to Content Card */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible z-10 hidden md:block"
      >
        {bridgePath && (
          <path
            d={bridgePath}
            fill={activeTab.cardBg}
            className="transition-all duration-300 ease-out"
          />
        )}
      </svg>

      {/* Tabs navigation */}
      <div className="z-20">
        {useLiquidMotion && orientation === "horizontal" ? (
          // LiquidTabs surface-tension springs for horizontal layout
          <div className="p-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md">
            <LiquidTabs
              tabs={liquidTabItems}
              value={current}
              onValueChange={selectTab}
              label="Calendly product navigation"
              size="lg"
            />
          </div>
        ) : (
          // Flex Bubble Pill Tabs (Supports Vertical and Horizontal)
          <div
            className={`flex items-center ${
              orientation === "horizontal"
                ? "flex-row gap-2 p-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md"
                : "flex-row md:flex-col gap-2 p-2 rounded-3xl bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md"
            }`}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === current;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(tab.id, el);
                    else tabRefs.current.delete(tab.id);
                  }}
                  type="button"
                  role="tab"
                  onClick={() => selectTab(tab.id)}
                  aria-selected={isActive}
                  className={`relative flex items-center justify-center transition-all duration-200 rounded-[20px] cursor-pointer select-none ${
                    orientation === "horizontal"
                      ? "h-12 px-4 text-sm font-semibold gap-2"
                      : "size-12 md:size-14 p-2 text-sm"
                  } ${
                    isActive
                      ? "shadow-lg scale-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/60"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: tab.cardBg,
                          color: tab.cardText,
                        }
                      : undefined
                  }
                >
                  <span className="shrink-0 [&_svg]:size-5">{tab.icon}</span>
                  {orientation === "horizontal" && (
                    <span className="truncate">{tab.name}</span>
                  )}
                  {orientation === "horizontal" && tab.badge && (
                    <span
                      className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-full tracking-wider"
                      style={{
                        backgroundColor: isActive
                          ? "rgba(0,0,0,0.12)"
                          : "rgba(0,0,0,0.06)",
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Card with matching background & fluid bridge connection */}
      <div
        ref={cardRef}
        className="relative z-0 w-full max-w-4xl rounded-[32px] p-6 sm:p-8 md:p-10 transition-colors duration-300 shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden"
        style={{
          backgroundColor: activeTab.cardBg,
          color: activeTab.cardText,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
            {/* Left/Main Description Column */}
            <div className="md:col-span-6 flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-semibold uppercase tracking-wider">
                <span className="shrink-0">{activeTab.icon}</span>
                <span>{activeTab.name}</span>
                {activeTab.badge && (
                  <span className="px-1.5 py-0.2 bg-black/10 dark:bg-white/20 rounded-full text-[10px]">
                    {activeTab.badge}
                  </span>
                )}
              </div>

              <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.15]">
                {activeTab.headline}
              </h3>

              <p className="text-base md:text-lg opacity-80 leading-relaxed font-normal">
                {activeTab.description}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                  style={{
                    backgroundColor: activeTab.accentColor,
                    color: activeTab.accentForeground,
                  }}
                >
                  <span>{activeTab.primaryAction}</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </div>

              {/* Feature Pill Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {activeTab.pills.map((pill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 opacity-90"
                  >
                    <span>&bull;</span>
                    <span>{pill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right Interactive Mockup Column */}
            <div className="md:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-2xl border border-black/5 dark:border-white/10">
                {activeTab.mockup}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * 5. DETAIL INSPECTOR (Image 1 "Detail" zoom view)
 * ───────────────────────────────────────────────────────── */

export function FlexBubbleDetailInspector({
  leftText = "sit",
  rightText = "Sc",
  gap = 28,
  bridgeWaist = 20,
  bridgeAttach = 44,
  curveTension = 0.32,
}: {
  leftText?: string;
  rightText?: string;
  gap?: number;
  bridgeWaist?: number;
  bridgeAttach?: number;
  curveTension?: number;
}) {
  const h = 140;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-sky-400/30 via-teal-400/20 to-indigo-500/30 p-8 border border-white/20 backdrop-blur-xl shadow-2xl">
      <div className="absolute top-4 left-6 text-xs font-mono uppercase tracking-widest text-slate-700 dark:text-slate-300">
        Bridge Anatomy &amp; Fillet Geometry
      </div>

      <div className="relative flex items-center justify-center py-10">
        {/* Ruler ticks overlay */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-16 pointer-events-none opacity-20 border-t border-b border-white flex justify-between">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={`w-[1px] bg-white ${i % 5 === 0 ? "h-full" : "h-2"}`}
            />
          ))}
        </div>

        {/* Zoomed Bridge Visualization */}
        <div className="relative flex items-center">
          {/* Left Bubble Half */}
          <div className="relative w-40 h-32 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/20 shadow-xl flex items-center justify-end pr-3">
            <span className="text-6xl font-sans font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {leftText}
            </span>
          </div>

          {/* SVG Fillet Bridge */}
          <div className="relative" style={{ width: `${gap}px`, height: `${h}px` }}>
            <svg
              className="absolute inset-0 size-full overflow-visible"
              viewBox={`0 0 ${gap} ${h}`}
            >
              <path
                d={computeHorizontalChainBridgePath({
                  x1: -1,
                  x2: gap + 1,
                  yc: h / 2,
                  hAttach: bridgeAttach,
                  hWaist: bridgeWaist,
                  curveTension,
                })}
                fill="rgba(255, 255, 255, 0.7)"
                className="dark:fill-slate-900/70"
              />
              {/* Tangent control indicators */}
              <circle cx={gap / 2} cy={(h - bridgeWaist) / 2} r="3" fill="#006BFF" />
              <circle cx={gap / 2} cy={(h + bridgeWaist) / 2} r="3" fill="#006BFF" />
            </svg>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Bridge (waist: {bridgeWaist}px)
            </div>
          </div>

          {/* Right Bubble Half */}
          <div className="relative w-40 h-32 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/20 shadow-xl flex items-center justify-start pl-3">
            <span className="text-6xl font-serif font-medium tracking-normal text-slate-800 dark:text-slate-100">
              {rightText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
