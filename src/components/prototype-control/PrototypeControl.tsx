"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  Layers,
  MessageSquarePlus,
  Palette,
  Search,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Circle,
  Folder,
  FolderOpen,
  Type,
} from "lucide-react";
import { usePrototypeControl } from "./PrototypeControlContext";
import {
  colorScales,
  semanticTokens,
  projectColors,
  portfolioTypefaces,
  portfolioFontStyles,
  type FontStyleToken,
} from "@/design-system/tokens";

type ColorFilter = "all" | "global" | "project" | "scales";
type FontFilter = "all" | "typefaces" | "headings" | "body" | "labels";

interface GlobalColorTokenItem {
  id: string;
  group: "Surface" | "Content" | "Stroke";
  name: string;
  cssVar: string;
  tailwindClass: string;
  lightHex: string;
  darkHex: string;
  description: string;
}

const GLOBAL_COLOR_TOKENS: GlobalColorTokenItem[] = [
  // Surface
  {
    id: "surface-canvas",
    group: "Surface",
    name: "surface.canvas",
    cssVar: "--ds-surface-canvas",
    tailwindClass: "bg-surface-canvas",
    lightHex: semanticTokens.light.surface.canvas,
    darkHex: semanticTokens.dark.surface.canvas,
    description: "Signature cool ice canvas",
  },
  {
    id: "surface-elevated",
    group: "Surface",
    name: "surface.elevated",
    cssVar: "--ds-surface-elevated",
    tailwindClass: "bg-surface-elevated",
    lightHex: semanticTokens.light.surface.elevated,
    darkHex: semanticTokens.dark.surface.elevated,
    description: "Cards, panels & floating modals",
  },
  {
    id: "surface-muted",
    group: "Surface",
    name: "surface.muted",
    cssVar: "--ds-surface-muted",
    tailwindClass: "bg-surface-muted",
    lightHex: semanticTokens.light.surface.muted,
    darkHex: semanticTokens.dark.surface.muted,
    description: "Hover & subtle container fill",
  },
  {
    id: "surface-active",
    group: "Surface",
    name: "surface.active",
    cssVar: "--ds-surface-active",
    tailwindClass: "bg-surface-active",
    lightHex: semanticTokens.light.surface.active,
    darkHex: semanticTokens.dark.surface.active,
    description: "Pressed & selected state fill",
  },

  // Content
  {
    id: "content-primary",
    group: "Content",
    name: "content.primary",
    cssVar: "--ds-content-primary",
    tailwindClass: "text-content-primary",
    lightHex: semanticTokens.light.content.primary,
    darkHex: semanticTokens.dark.content.primary,
    description: "Midnight navy headlines & primary text",
  },
  {
    id: "content-secondary",
    group: "Content",
    name: "content.secondary",
    cssVar: "--ds-content-secondary",
    tailwindClass: "text-content-secondary",
    lightHex: semanticTokens.light.content.secondary,
    darkHex: semanticTokens.dark.content.secondary,
    description: "Charcoal body copy & descriptions",
  },
  {
    id: "content-tertiary",
    group: "Content",
    name: "content.tertiary",
    cssVar: "--ds-content-tertiary",
    tailwindClass: "text-content-tertiary",
    lightHex: semanticTokens.light.content.tertiary,
    darkHex: semanticTokens.dark.content.tertiary,
    description: "Graphite supporting labels & links",
  },
  {
    id: "content-subtle",
    group: "Content",
    name: "content.subtle",
    cssVar: "--ds-content-subtle",
    tailwindClass: "text-content-subtle",
    lightHex: semanticTokens.light.content.subtle,
    darkHex: semanticTokens.dark.content.subtle,
    description: "Steel blue section headers & metadata",
  },

  // Stroke
  {
    id: "stroke-default",
    group: "Stroke",
    name: "stroke.default",
    cssVar: "--ds-stroke-default",
    tailwindClass: "border-stroke-default",
    lightHex: semanticTokens.light.stroke.default,
    darkHex: "#b0becc59",
    description: "Signature steel blue card border",
  },
  {
    id: "stroke-subtle",
    group: "Stroke",
    name: "stroke.subtle",
    cssVar: "--ds-stroke-subtle",
    tailwindClass: "border-stroke-subtle",
    lightHex: "#b0becc40",
    darkHex: "#b0becc26",
    description: "Hairline dividers & inner borders",
  },
  {
    id: "stroke-strong",
    group: "Stroke",
    name: "stroke.strong",
    cssVar: "--ds-stroke-strong",
    tailwindClass: "border-stroke-strong",
    lightHex: semanticTokens.light.stroke.strong,
    darkHex: semanticTokens.dark.stroke.strong,
    description: "High-contrast active outline",
  },
];

const COLOR_SCALE_RAMPS: {
  id: string;
  label: string;
  subtitle: string;
  scale: Record<string, string>;
}[] = [
  {
    id: "slate",
    label: "scale.slate",
    subtitle: "Ice Canvas → Steel Blue → Midnight Navy",
    scale: colorScales.slate,
  },
  {
    id: "amber",
    label: "scale.amber",
    subtitle: "7shifts · Apricot & Terracotta Scale",
    scale: colorScales.amber,
  },
  {
    id: "royal",
    label: "scale.royal",
    subtitle: "Teck · Periwinkle & Deep Indigo Scale",
    scale: colorScales.royal,
  },
  {
    id: "berry",
    label: "scale.berry",
    subtitle: "WillowTree · Rose & Magenta Scale",
    scale: colorScales.berry,
  },
  {
    id: "cyan",
    label: "scale.cyan",
    subtitle: "Visier · Mint & Turquoise Scale",
    scale: colorScales.cyan,
  },
  {
    id: "forest",
    label: "scale.forest",
    subtitle: "Gojek · Emerald Green Scale",
    scale: colorScales.forest,
  },
];

export function PrototypeControl() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return <PrototypeControlInner />;
}

function PrototypeControlInner() {
  const {
    isOpen,
    setIsOpen,
    options,
    activeApproach,
    setActiveApproach,
    notes,
    addNote,
    toggleNoteResolved,
    deleteNote,
    shadeProgress,
    setShadeProgress,
    cloudSpeed,
    setCloudSpeed,
  } = usePrototypeControl();

  const [colorFilter, setColorFilter] = useState<ColorFilter>("all");
  const [fontFilter, setFontFilter] = useState<FontFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Card & Folder hierarchy states
  const [designSystemExpanded, setDesignSystemExpanded] = useState(true);
  const [portfolioFolderOpen, setPortfolioFolderOpen] = useState(true);
  const [colorFolderOpen, setColorFolderOpen] = useState(true);
  const [fontFolderOpen, setFontFolderOpen] = useState(true);
  // Scales hidden by default under progressive disclosure
  const [scalesDisclosed, setScalesDisclosed] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(true);

  useEffect(() => {
    const checkDark = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggleSiteTheme = () => {
    const next = !isDarkTheme;
    setIsDarkTheme(next);
    setShadeProgress(next ? 1 : 0);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1400);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addNote(noteInput);
    setNoteInput("");
  };

  const q = searchQuery.trim().toLowerCase();

  const filteredGlobalColors = GLOBAL_COLOR_TOKENS.filter(
    (t) =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.group.toLowerCase().includes(q) ||
      t.lightHex.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.cssVar.toLowerCase().includes(q)
  );

  const filteredProjectColors = projectColors.filter(
    (p) =>
      !q ||
      p.project.toLowerCase().includes(q) ||
      p.tokenName.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      p.bg.toLowerCase().includes(q) ||
      p.text.toLowerCase().includes(q) ||
      p.border.toLowerCase().includes(q) ||
      p.accent.toLowerCase().includes(q)
  );

  const filteredScales = COLOR_SCALE_RAMPS.filter(
    (s) =>
      !q ||
      s.label.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      Object.values(s.scale).some((hex) => hex.toLowerCase().includes(q))
  );

  const filteredTypefaces = portfolioTypefaces.filter(
    (tf) =>
      !q ||
      tf.name.toLowerCase().includes(q) ||
      tf.token.toLowerCase().includes(q) ||
      tf.usage.toLowerCase().includes(q)
  );

  const filteredFontStyles = portfolioFontStyles.filter((fs) => {
    const matchesSearch =
      !q ||
      fs.name.toLowerCase().includes(q) ||
      fs.token.toLowerCase().includes(q) ||
      fs.fontFamily.toLowerCase().includes(q) ||
      fs.size.toLowerCase().includes(q) ||
      String(fs.weight).includes(q) ||
      fs.weightLabel.toLowerCase().includes(q) ||
      fs.usage.toLowerCase().includes(q) ||
      fs.sample.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (fontFilter === "headings") return fs.category === "Display & Headings";
    if (fontFilter === "body") return fs.category === "Body & Navigation";
    if (fontFilter === "labels") return fs.category === "Labels & Badges";
    return true;
  });

  const currentOption =
    options.find((o) => o.id === activeApproach) || options[0];

  const formatFontCss = (fs: FontStyleToken) =>
    `font-family: "${fs.fontFamily}", sans-serif; font-size: ${fs.size}; font-weight: ${fs.weight}; line-height: ${fs.lineHeight}; letter-spacing: ${fs.letterSpacing};${
      fs.textTransform && fs.textTransform !== "none"
        ? ` text-transform: ${fs.textTransform};`
        : ""
    }`;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Minimized Floating Trigger Pill */
          <motion.button
            key="prototype-control-pill"
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#0a0a0c] text-zinc-100 border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.45)] hover:border-white/20 transition-all cursor-pointer"
            aria-label="Open Prototype Control (Cmd+K)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            <span className="text-xs font-medium tracking-tight text-zinc-200">
              Prototype Control
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-zinc-400 font-mono border border-white/[0.06]">
              ⌘K
            </span>
          </motion.button>
        ) : (
          /* Inflight-Style Matte Black Floating Box */
          <motion.aside
            key="prototype-control-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            aria-label="Prototype Control Toolkit"
            className="w-[400px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4.5rem)] flex flex-col rounded-[22px] bg-[#0a0a0c] text-zinc-100 p-2.5 border border-white/[0.09] shadow-[0_28px_70px_-10px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
          >
            {/* Top Chrome Bar: Leading Lucide Icon + "Prototype Control" */}
            <div className="flex items-center justify-between px-2.5 pt-1 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  className="w-3.5 h-3.5 text-zinc-400"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-medium text-zinc-300 tracking-tight">
                  Prototype Control
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSiteTheme}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#161618] hover:bg-[#1f1f23] text-[11px] text-zinc-300 border border-white/[0.06] transition-colors cursor-pointer"
                  title="Toggle Canvas Theme"
                >
                  {isDarkTheme ? (
                    <>
                      <Moon className="w-3 h-3 text-cyan-400" />
                      <span>Dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>Light</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#161618] hover:bg-[#1f1f23] text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-white/[0.06] transition-colors cursor-pointer"
                  title="Close (Cmd+K)"
                >
                  <span>⌘K</span>
                </button>
              </div>
            </div>

            {/* Scrollable Stacked Inner Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
              {/* ================================================================
                  CARD 1: DESIGN SYSTEM (Portfolio > Color & Font)
                  ================================================================ */}
              <div className="rounded-[15px] bg-[#161618] border border-white/[0.06] overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setDesignSystemExpanded((prev) => !prev)}
                    className="flex items-center gap-2 text-left cursor-pointer group"
                  >
                    <Layers className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    <span className="text-xs font-semibold tracking-tight text-zinc-100">
                      Design System
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    {copiedId && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        Copied!
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setDesignSystemExpanded((prev) => !prev)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      aria-label="Toggle Design System section"
                    >
                      {designSystemExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {designSystemExpanded && (
                  <div className="p-3 space-y-2.5">
                    {/* Global Search Input */}
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Portfolio colors, projects, fonts..."
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-[#0e0e10] text-zinc-200 placeholder:text-zinc-600 border border-white/[0.06] focus:border-white/20 outline-none transition-colors"
                      />
                    </div>

                    {/* FOLDER LEVEL 1: Portfolio */}
                    <div className="rounded-xl bg-[#111114] border border-white/[0.05] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setPortfolioFolderOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {portfolioFolderOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                          {portfolioFolderOpen ? (
                            <FolderOpen className="w-3.5 h-3.5 text-amber-400/90" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-amber-400/80" />
                          )}
                          <span className="text-xs font-medium text-zinc-100">
                            Portfolio
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                          2 folders
                        </span>
                      </button>

                      {portfolioFolderOpen && (
                        <div className="px-2 pb-2 pt-0.5 space-y-2 border-t border-white/[0.04]">
                          {/* ====================================================
                              FOLDER 1: Design System > Portfolio > Color
                              ==================================================== */}
                          <div className="ml-2 pl-2 border-l border-white/[0.07] space-y-2 pt-1.5">
                            <div className="rounded-lg bg-[#151519] border border-white/[0.05] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setColorFolderOpen((prev) => !prev)}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  {colorFolderOpen ? (
                                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-zinc-500" />
                                  )}
                                  {colorFolderOpen ? (
                                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                                  ) : (
                                    <Folder className="w-3.5 h-3.5 text-cyan-400/80" />
                                  )}
                                  <span className="text-[11px] font-medium text-zinc-200">
                                    Color
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Palette className="w-3 h-3 text-zinc-500" />
                                  <span className="text-[10px] font-mono text-zinc-500">
                                    Global · Project · Scales
                                  </span>
                                </div>
                              </button>

                              {colorFolderOpen && (
                                <div className="p-2.5 pt-2 space-y-2.5 border-t border-white/[0.04]">
                                  {/* Color Type Filter Pills */}
                                  <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#0e0e10] border border-white/[0.05]">
                                    {(
                                      [
                                        { id: "all", label: "All" },
                                        { id: "global", label: "Global" },
                                        { id: "project", label: "Project" },
                                        { id: "scales", label: "Scales" },
                                      ] as const
                                    ).map((tab) => (
                                      <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setColorFilter(tab.id)}
                                        className={`py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                                          colorFilter === tab.id
                                            ? "bg-[#232327] text-white shadow-xs"
                                            : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                      >
                                        {tab.label}
                                      </button>
                                    ))}
                                  </div>

                                  <div className="max-h-[270px] overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
                                    {/* 1. GLOBAL: Surface > Content > Stroke */}
                                    {(colorFilter === "all" ||
                                      colorFilter === "global") &&
                                      filteredGlobalColors.length > 0 && (
                                        <div className="space-y-2.5">
                                          <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                              Global · Surface &gt; Content &gt; Stroke
                                            </span>
                                            <span className="text-[9px] text-zinc-600 font-mono">
                                              {isDarkTheme ? "Dark" : "Light"}
                                            </span>
                                          </div>

                                          {(
                                            ["Surface", "Content", "Stroke"] as const
                                          ).map((groupName) => {
                                            const groupItems =
                                              filteredGlobalColors.filter(
                                                (item) => item.group === groupName
                                              );
                                            if (groupItems.length === 0) return null;

                                            return (
                                              <div
                                                key={groupName}
                                                className="space-y-1"
                                              >
                                                <div className="flex items-center justify-between px-1">
                                                  <span className="text-[10px] font-mono text-zinc-500">
                                                    {groupName}
                                                  </span>
                                                </div>

                                                <div className="space-y-1">
                                                  {groupItems.map((token) => {
                                                    const activeHex = isDarkTheme
                                                      ? token.darkHex
                                                      : token.lightHex;
                                                    return (
                                                      <div
                                                        key={token.id}
                                                        onClick={() =>
                                                          handleCopy(
                                                            `var(${token.cssVar})`,
                                                            token.id
                                                          )
                                                        }
                                                        className="group flex items-center justify-between p-1.5 rounded-lg bg-[#101013] hover:bg-[#1c1c20] border border-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer"
                                                        title={`Click to copy var(${token.cssVar})`}
                                                      >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                          <div className="relative size-5 rounded-md shrink-0 border border-white/20 shadow-inner overflow-hidden bg-[#0a0a0c]">
                                                            <div
                                                              className="w-full h-full"
                                                              style={{
                                                                backgroundColor:
                                                                  activeHex,
                                                              }}
                                                            />
                                                          </div>
                                                          <div className="min-w-0">
                                                            <div className="text-[11px] font-mono font-medium text-zinc-200 truncate">
                                                              {token.name}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-500 truncate">
                                                              {token.description}
                                                            </div>
                                                          </div>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleCopy(
                                                                activeHex.toUpperCase(),
                                                                `${token.id}-hex`
                                                              );
                                                            }}
                                                            className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.12] text-[10px] font-mono text-zinc-300 border border-white/[0.05] cursor-pointer"
                                                            title="Copy Hex"
                                                          >
                                                            {copiedId ===
                                                            `${token.id}-hex`
                                                              ? "Copied"
                                                              : activeHex.toUpperCase()}
                                                          </button>
                                                          {copiedId ===
                                                          token.id ? (
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                          ) : (
                                                            <Copy className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                                          )}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                    {/* 2. PROJECT: Float > 7shifts > Sonnet > Teck > WillowTree > Visier > Gojek */}
                                    {(colorFilter === "all" ||
                                      colorFilter === "project") &&
                                      filteredProjectColors.length > 0 && (
                                        <div className="space-y-1.5">
                                          <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                              Project · Float &gt; 7shifts &gt; Sonnet &gt; Teck &gt; WillowTree &gt; Visier &gt; Gojek
                                            </span>
                                          </div>

                                          <div className="space-y-1.5">
                                            {filteredProjectColors.map(
                                              (proj) => (
                                                <div
                                                  key={proj.id}
                                                  className="p-2 rounded-lg bg-[#101013] border border-white/[0.04] space-y-2"
                                                >
                                                  <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                      <div className="flex items-center gap-1.5">
                                                        <span className="text-[11px] font-semibold text-zinc-100">
                                                          {proj.project}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-zinc-500">
                                                          {proj.tokenName}
                                                        </span>
                                                      </div>
                                                      <div className="text-[10px] text-zinc-500 truncate">
                                                        {proj.role}
                                                      </div>
                                                    </div>

                                                    {/* Live Project Badge Preview */}
                                                    <span
                                                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold shrink-0"
                                                      style={{
                                                        backgroundColor: proj.bg,
                                                        color: proj.text,
                                                        border: `1px solid ${proj.border}`,
                                                        fontFamily:
                                                          "var(--font-jakarta), sans-serif",
                                                      }}
                                                    >
                                                      {proj.badgeLabel}
                                                    </span>
                                                  </div>

                                                  {/* Swatch Triplets (BG, Text, Border) */}
                                                  <div className="grid grid-cols-3 gap-1.5">
                                                    {(
                                                      [
                                                        {
                                                          role: "bg",
                                                          hex: proj.bg,
                                                        },
                                                        {
                                                          role: "text",
                                                          hex: proj.text,
                                                        },
                                                        {
                                                          role: "border",
                                                          hex: proj.border,
                                                        },
                                                      ] as const
                                                    ).map((part) => {
                                                      const partId = `${proj.id}-${part.role}`;
                                                      return (
                                                        <button
                                                          key={part.role}
                                                          type="button"
                                                          onClick={() =>
                                                            handleCopy(
                                                              part.hex.toUpperCase(),
                                                              partId
                                                            )
                                                          }
                                                          className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-[#18181c] hover:bg-[#222228] border border-white/[0.05] text-left transition-colors cursor-pointer"
                                                          title={`Copy ${proj.tokenName}.${part.role} (${part.hex})`}
                                                        >
                                                          <span
                                                            className="size-3 rounded-xs shrink-0 border border-white/20"
                                                            style={{
                                                              backgroundColor:
                                                                part.hex,
                                                            }}
                                                          />
                                                          <div className="min-w-0 flex-1">
                                                            <div className="text-[9px] text-zinc-500 uppercase font-mono leading-none">
                                                              {part.role}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-300 font-mono truncate mt-0.5">
                                                              {copiedId === partId
                                                                ? "Copied!"
                                                                : part.hex.toUpperCase()}
                                                            </div>
                                                          </div>
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* 3. SCALES (Hidden by default under progressive disclosure) */}
                                    {(colorFilter === "all" ||
                                      colorFilter === "scales") &&
                                      filteredScales.length > 0 && (
                                        <div className="space-y-1.5 pt-0.5">
                                          {colorFilter === "all" && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setScalesDisclosed(
                                                  (prev) => !prev
                                                )
                                              }
                                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#101013] hover:bg-[#19191e] border border-white/[0.05] text-left transition-colors cursor-pointer"
                                            >
                                              <div className="flex items-center gap-1.5">
                                                {scalesDisclosed ? (
                                                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                                                ) : (
                                                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                                                )}
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                                                  Scales
                                                </span>
                                              </div>
                                              <span className="text-[10px] font-mono text-zinc-500">
                                                {scalesDisclosed
                                                  ? "Hide scales"
                                                  : `${filteredScales.length} ramps · Show`}
                                              </span>
                                            </button>
                                          )}

                                          {(colorFilter === "scales" ||
                                            scalesDisclosed ||
                                            Boolean(q)) && (
                                            <div className="space-y-2 pt-1">
                                              {filteredScales.map((palette) => (
                                                <div
                                                  key={palette.id}
                                                  className="p-2 rounded-lg bg-[#101013] border border-white/[0.04] space-y-1.5"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-mono font-medium text-zinc-200">
                                                      {palette.label}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 truncate ml-2">
                                                      {palette.subtitle}
                                                    </span>
                                                  </div>

                                                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1">
                                                    {Object.entries(
                                                      palette.scale
                                                    ).map(([step, hex]) => {
                                                      const swatchId = `${palette.id}-${step}`;
                                                      return (
                                                        <button
                                                          key={step}
                                                          type="button"
                                                          onClick={() =>
                                                            handleCopy(
                                                              hex.toUpperCase(),
                                                              swatchId
                                                            )
                                                          }
                                                          className="group flex flex-col rounded-md overflow-hidden border border-white/[0.08] hover:border-white/30 bg-[#0a0a0c] transition-all cursor-pointer"
                                                          title={`${palette.label}.${step}: ${hex.toUpperCase()}`}
                                                        >
                                                          <div
                                                            className="h-4 w-full"
                                                            style={{
                                                              backgroundColor:
                                                                hex,
                                                            }}
                                                          />
                                                          <div className="px-1 py-0.5 text-left bg-[#141417] w-full">
                                                            <div className="text-[9px] font-mono text-zinc-400 leading-tight">
                                                              {step}
                                                            </div>
                                                            <div className="text-[8px] font-mono text-zinc-500 group-hover:text-zinc-300 truncate leading-tight">
                                                              {copiedId ===
                                                              swatchId
                                                                ? "Copied"
                                                                : hex.toUpperCase()}
                                                            </div>
                                                          </div>
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ====================================================
                                FOLDER 2: Design System > Portfolio > Font
                                ==================================================== */}
                            <div className="rounded-lg bg-[#151519] border border-white/[0.05] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setFontFolderOpen((prev) => !prev)}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  {fontFolderOpen ? (
                                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-zinc-500" />
                                  )}
                                  {fontFolderOpen ? (
                                    <FolderOpen className="w-3.5 h-3.5 text-violet-400" />
                                  ) : (
                                    <Folder className="w-3.5 h-3.5 text-violet-400/80" />
                                  )}
                                  <span className="text-[11px] font-medium text-zinc-200">
                                    Font
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Type className="w-3 h-3 text-zinc-500" />
                                  <span className="text-[10px] font-mono text-zinc-500">
                                    Plus Jakarta Sans · Inter
                                  </span>
                                </div>
                              </button>

                              {fontFolderOpen && (
                                <div className="p-2.5 pt-2 space-y-2.5 border-t border-white/[0.04]">
                                  {/* Font Category Filter Pills */}
                                  <div className="grid grid-cols-5 gap-1 p-1 rounded-lg bg-[#0e0e10] border border-white/[0.05]">
                                    {(
                                      [
                                        { id: "all", label: "All" },
                                        { id: "typefaces", label: "Families" },
                                        { id: "headings", label: "Headings" },
                                        { id: "body", label: "Body/Nav" },
                                        { id: "labels", label: "Labels" },
                                      ] as const
                                    ).map((tab) => (
                                      <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setFontFilter(tab.id)}
                                        className={`py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                                          fontFilter === tab.id
                                            ? "bg-[#232327] text-white shadow-xs"
                                            : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                      >
                                        {tab.label}
                                      </button>
                                    ))}
                                  </div>

                                  <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                    {/* Typeface Families */}
                                    {(fontFilter === "all" ||
                                      fontFilter === "typefaces") &&
                                      filteredTypefaces.length > 0 && (
                                        <div className="space-y-1.5">
                                          <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                              Typefaces &amp; Weights
                                            </span>
                                            <span className="text-[9px] font-mono text-zinc-600">
                                              filbert.design
                                            </span>
                                          </div>

                                          {filteredTypefaces.map((tf) => (
                                            <div
                                              key={tf.id}
                                              onClick={() =>
                                                handleCopy(tf.cssFamily, tf.id)
                                              }
                                              className="group p-2 rounded-lg bg-[#101013] hover:bg-[#19191f] border border-white/[0.04] hover:border-white/[0.1] space-y-1.5 transition-all cursor-pointer"
                                              title={`Click to copy ${tf.cssFamily}`}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <span
                                                    className="text-sm font-semibold text-zinc-100 px-1.5 py-0.5 rounded bg-white/[0.05]"
                                                    style={{
                                                      fontFamily:
                                                        tf.id ===
                                                        "plus-jakarta-sans"
                                                          ? "var(--font-jakarta), sans-serif"
                                                          : "var(--font-inter), sans-serif",
                                                    }}
                                                  >
                                                    Aa
                                                  </span>
                                                  <div>
                                                    <div className="text-[11px] font-semibold text-zinc-100">
                                                      {tf.name}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-zinc-500">
                                                      {tf.token}
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                  {tf.weights.map((w) => (
                                                    <span
                                                      key={w.weight}
                                                      className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[9px] font-mono text-zinc-300 border border-white/[0.05]"
                                                    >
                                                      {w.weight} {w.label}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                              <p className="text-[10px] text-zinc-500 leading-snug">
                                                {tf.usage}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                    {/* Typography Scale Tokens */}
                                    {fontFilter !== "typefaces" &&
                                      filteredFontStyles.length > 0 && (
                                        <div className="space-y-2.5">
                                          {(
                                            [
                                              "Display & Headings",
                                              "Body & Navigation",
                                              "Labels & Badges",
                                            ] as const
                                          ).map((cat) => {
                                            const items =
                                              filteredFontStyles.filter(
                                                (s) => s.category === cat
                                              );
                                            if (items.length === 0) return null;

                                            return (
                                              <div
                                                key={cat}
                                                className="space-y-1.5"
                                              >
                                                <div className="flex items-center justify-between px-1">
                                                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                                    {cat}
                                                  </span>
                                                  <span className="text-[9px] font-mono text-zinc-600">
                                                    Size / Weight / LH
                                                  </span>
                                                </div>

                                                {items.map((fs) => {
                                                  const numericPx =
                                                    parseInt(fs.size, 10) || 16;
                                                  const previewPx = Math.min(
                                                    Math.max(numericPx, 10),
                                                    22
                                                  );

                                                  return (
                                                    <div
                                                      key={fs.id}
                                                      onClick={() =>
                                                        handleCopy(
                                                          formatFontCss(fs),
                                                          fs.id
                                                        )
                                                      }
                                                      className="group p-2 rounded-lg bg-[#101013] hover:bg-[#19191f] border border-white/[0.04] hover:border-white/[0.1] space-y-1.5 transition-all cursor-pointer"
                                                      title="Click to copy CSS typography rule"
                                                    >
                                                      <div className="flex items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                          <div className="flex items-center gap-1.5">
                                                            <span className="text-[11px] font-medium text-zinc-200 truncate">
                                                              {fs.name}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-zinc-500 truncate">
                                                              {fs.token}
                                                            </span>
                                                          </div>
                                                        </div>

                                                        <div className="flex items-center gap-1 shrink-0">
                                                          <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[9px] font-mono text-zinc-200">
                                                            {fs.size}
                                                          </span>
                                                          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-zinc-400">
                                                            {fs.weight}{" "}
                                                            {fs.weightLabel}
                                                          </span>
                                                          <span className="px-1 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-zinc-500">
                                                            /{fs.lineHeight}
                                                          </span>
                                                        </div>
                                                      </div>

                                                      {/* Live Neutral Type Specimen */}
                                                      <div
                                                        className="text-zinc-200 truncate py-0.5"
                                                        style={{
                                                          fontFamily:
                                                            "var(--font-jakarta), sans-serif",
                                                          fontSize: `${previewPx}px`,
                                                          fontWeight: fs.weight,
                                                          letterSpacing:
                                                            fs.letterSpacing,
                                                          textTransform:
                                                            fs.textTransform ||
                                                            "none",
                                                        }}
                                                      >
                                                        {fs.sample}
                                                      </div>

                                                      <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                                                        <span className="truncate">
                                                          {fs.fontFamily} · LS{" "}
                                                          {fs.letterSpacing}
                                                          {fs.responsive
                                                            ? ` · (${fs.responsive})`
                                                            : ""}
                                                        </span>
                                                        {copiedId === fs.id ? (
                                                          <span className="text-emerald-400 shrink-0 ml-1">
                                                            Copied CSS
                                                          </span>
                                                        ) : (
                                                          <Copy className="w-2.5 h-2.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 ml-1" />
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================
                  CARD 2: AIRPLANE WINDOW SHADE & CLOUD LEVERS
                  ================================================================ */}
              <div className="rounded-[15px] bg-[#161618] border border-white/[0.06] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold tracking-tight text-zinc-100">
                      Airplane Window Shade
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                    {Math.round(shadeProgress * 100)}% Closed
                  </span>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(shadeProgress * 100)}
                    onChange={(e) => setShadeProgress(Number(e.target.value) / 100)}
                    className="w-full accent-zinc-200 cursor-pointer h-1.5 bg-[#0e0e10] rounded-lg"
                    aria-label="Airplane window shade position"
                  />
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    {[
                      { label: "Daylight (0%)", value: 0 },
                      { label: "Dimmed (40%)", value: 0.4 },
                      { label: "Night Mode (100%)", value: 1 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setShadeProgress(preset.value)}
                        className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-mono border transition-colors cursor-pointer ${
                          Math.abs(shadeProgress - preset.value) < 0.08
                            ? "bg-[#232327] text-zinc-100 border-white/15"
                            : "bg-[#0e0e10] text-zinc-500 border-white/[0.04] hover:text-zinc-300"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                  <span className="text-[11px] text-zinc-400">Cloud Drift Speed</span>
                  <div className="flex items-center gap-1 bg-[#0e0e10] p-0.5 rounded-lg border border-white/[0.05]">
                    {(["calm", "cruising", "fast"] as const).map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setCloudSpeed(speed)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono capitalize transition-colors cursor-pointer ${
                          cloudSpeed === speed
                            ? "bg-[#232327] text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================================================================
                  CARD 2B: CALENDLY FLEX BUBBLES & LIQUID TABS TOOLKIT
                  ================================================================ */}
              <div className="rounded-[15px] bg-[#161618] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-semibold tracking-tight text-zinc-100">
                      Calendly Flex Bubbles
                    </span>
                  </div>
                  <Link
                    href="/experiment"
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                  >
                    Open /experiment &rarr;
                  </Link>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Modular squircle containers joined by continuous concave Bézier bridges, fused with Liquid Tabs surface tension.
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                  <span className="text-[11px] text-zinc-400">Bridge Fillet Anatomy</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                    Bézier C(t)
                  </span>
                </div>
              </div>

              {/* ================================================================
                  CARD 3: DESIGN OPTIONS SWITCHER (Approach A vs Approach B)
                  ================================================================ */}
              <div className="rounded-[15px] bg-[#161618] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-semibold tracking-tight text-zinc-100">
                      Design Options
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Active: {currentOption?.label}
                  </span>
                </div>

                {/* Segmented Option Switcher */}
                <div className="flex flex-col gap-1 p-1 rounded-xl bg-[#0e0e10] border border-white/[0.05]">
                  {options.map((option) => {
                    const active = option.id === activeApproach;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setActiveApproach(option.id)}
                        className={`relative py-1.5 px-2.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                          active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="active-approach-pill"
                            className="absolute inset-0 rounded-lg bg-[#232327] border border-white/[0.08] shadow-xs"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5 truncate">
                            <Layers className="w-3 h-3 shrink-0" />
                            <span className="truncate">{option.label}</span>
                          </span>
                          {active && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {currentOption?.description && (
                  <p className="text-[11px] text-zinc-400 leading-relaxed px-1">
                    {currentOption.description}
                  </p>
                )}
              </div>

              {/* ================================================================
                  CARD 4: PROTOTYPE REVIEW NOTES
                  ================================================================ */}
              <div className="rounded-[15px] bg-[#161618] border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setNotesExpanded((prev) => !prev)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-semibold tracking-tight text-zinc-100">
                      Review Notes
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
                      {notes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotesExpanded((prev) => !prev)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    aria-label="Toggle notes section"
                  >
                    {notesExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {notesExpanded && (
                  <div className="p-3 space-y-2.5">
                    <form onSubmit={handleAddNote} className="flex gap-1.5">
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder={`Add note for ${currentOption?.label || "prototype"}...`}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#0e0e10] text-zinc-200 placeholder:text-zinc-600 border border-white/[0.06] focus:border-white/20 outline-none"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-colors cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </form>

                    {notes.length > 0 && (
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="group flex items-start justify-between gap-2 p-2 rounded-lg bg-[#111113] border border-white/[0.04] text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => toggleNoteResolved(note.id)}
                              className="flex items-start gap-2 text-left flex-1 cursor-pointer"
                            >
                              {note.resolved ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-0.5">
                                <p
                                  className={`text-[11px] leading-snug ${
                                    note.resolved
                                      ? "line-through text-zinc-600"
                                      : "text-zinc-200"
                                  }`}
                                >
                                  {note.text}
                                </p>
                                <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                                  <span>
                                    {options.find((o) => o.id === note.approachId)?.label ||
                                      note.approachId}
                                  </span>
                                  <span>·</span>
                                  <span>{note.createdAt}</span>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteNote(note.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-rose-400 transition-opacity cursor-pointer"
                              aria-label="Delete note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
