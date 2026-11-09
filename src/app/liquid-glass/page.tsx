"use client";

import { useState } from "react";
import Link from "next/link";
import { Toggle } from "@base-ui/react/toggle";
import {
  Sparkles,
  Sliders,
  ExternalLink,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Share2,
  Bookmark,
  Bell,
  Send,
  Music,
  Layers,
  ChevronDown,
  RotateCcw,
  Palette,
  Check,
  Flame,
  Radio as RadioIcon,
  Eye,
  Info,
} from "lucide-react";

import { AirplaneBoldIcon } from "@/components/icons/airplane-bold";
import { CellularBarsBoldIcon } from "@/components/icons/cellular-bars-bold";
import { RecordRingIcon } from "@/components/icons/record-ring";
import { SunBoldIcon } from "@/components/icons/sun-bold";
import { VolumeLevelIcon } from "@/components/icons/volume-level";
import { WifiBoldIcon } from "@/components/icons/wifi-bold";

import {
  Glass,
  GlassButton,
  GlassToolbar,
  GlassSwitch,
  GlassSlider,
  GlassSegmented,
  GlassMenu,
  GlassField,
  GlassToast,
  GlassActions,
} from "@/components/liquid-glass";

type BackdropStyle = "aurora" | "sunset" | "ocean" | "cosmic" | "mesh";

const BACKDROPS: { id: BackdropStyle; label: string; bgClass: string; desc: string }[] = [
  {
    id: "aurora",
    label: "Aurora Emerald",
    bgClass:
      "bg-[radial-gradient(ellipse_at_top_left,#00dfa2_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,#0079ff_0%,transparent_50%),radial-gradient(circle_at_center,#051329_0%,#020617_100%)]",
    desc: "Vivid emerald & cyan refraction",
  },
  {
    id: "sunset",
    label: "Sunset Glow",
    bgClass:
      "bg-[radial-gradient(ellipse_at_top_right,#ff5e62_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#ff9966_0%,transparent_50%),radial-gradient(circle_at_center,#3b0764_0%,#18032e_100%)]",
    desc: "Warm peach & magenta glow",
  },
  {
    id: "ocean",
    label: "Deep Royal Navy",
    bgClass:
      "bg-[radial-gradient(ellipse_at_top,#1e3a8a_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,#0284c7_0%,transparent_50%),radial-gradient(circle_at_center,#091428_0%,#040a17_100%)]",
    desc: "Teck & Visier navy spectrum",
  },
  {
    id: "cosmic",
    label: "Cosmic Berry",
    bgClass:
      "bg-[radial-gradient(ellipse_at_top_left,#ec4899_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,#8b5cf6_0%,transparent_50%),radial-gradient(circle_at_center,#1e1b4b_0%,#0f0d26_100%)]",
    desc: "Hot pink & violet diffusion",
  },
  {
    id: "mesh",
    label: "Chromatic Art",
    bgClass:
      "bg-[radial-gradient(at_0%_0%,#38bdf8_0px,transparent_50%),radial-gradient(at_50%_0%,#f43f5e_0px,transparent_50%),radial-gradient(at_100%_0%,#eab308_0px,transparent_50%),radial-gradient(at_0%_100%,#10b981_0px,transparent_50%),radial-gradient(at_100%_100%,#6366f1_0px,transparent_50%),#09090b]",
    desc: "High-contrast multi-color test",
  },
];

const TINTS = [
  { label: "Default (Clean)", value: undefined },
  { label: "Teck Royal (#0a84ff)", value: "#0a84ff" },
  { label: "7shifts Amber (#ff6808)", value: "#ff6808" },
  { label: "WillowTree Berry (#df0173)", value: "#df0173" },
  { label: "Forest Mint (#30d158)", value: "#30d158" },
  { label: "Goldenrod (#ff9f0a)", value: "#ff9f0a" },
];

export default function LiquidGlassPage() {
  // Global Stage Controls
  const [glassMode, setGlassMode] = useState<"dark" | "light">("dark");
  const [activeBackdrop, setActiveBackdrop] = useState<BackdropStyle>("aurora");
  const [activeTint, setActiveTint] = useState<string | undefined>(undefined);
  const [glassVariant, setGlassVariant] = useState<"regular" | "clear">("regular");

  // Control Center State (Usage Example)
  const [volume, setVolume] = useState(64);
  const [brightness, setBrightness] = useState(76);
  const [airplaneOn, setAirplaneOn] = useState(false);
  const [cellularOn, setCellularOn] = useState(true);
  const [wifiOn, setWifiOn] = useState(true);
  const [screenRecordOn, setScreenRecordOn] = useState(false);

  // Now Playing State
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackProgress, setTrackProgress] = useState(42);

  // Focus & Menu State
  const [focusSegment, setFocusSegment] = useState("Work");
  const [menuFocusMode, setMenuFocusMode] = useState("Do Not Disturb");

  // Toast / Notifications State
  const [toastVisible, setToastVisible] = useState(true);
  const [toastCount, setToastCount] = useState(1);

  // Composer State
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch demo
  const [switchChecked, setSwitchChecked] = useState(true);

  const backdrop = BACKDROPS.find((b) => b.id === activeBackdrop) || BACKDROPS[0];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header bar with meta badge and reference */}
      <section className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="size-3" />
                Lab Experiment · Liquid Glass
              </span>
              <span className="text-xs text-slate-400 font-mono">React 19 + Tailwind v4 + Base UI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Liquid Glass Primitives
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Physically-modelled refraction, dynamic specular rims, magnetic pull gestures, and fluid SVG goo filters.
              Faithfully replicated from Manik Rana’s lab exploration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://manikrana.dev/lab/liquid-glass"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors cursor-pointer"
            >
              <span>Source: manikrana.dev/lab/liquid-glass</span>
              <ExternalLink className="size-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </section>

      {/* Stage Toolbar: Backdrops, Tint & Glass Mode Levers */}
      <section className="bg-slate-900/40 border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Backdrop Switcher */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
                <Palette className="size-3.5" />
                <span>Backdrop:</span>
              </span>
              {BACKDROPS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBackdrop(b.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeBackdrop === b.id
                      ? "bg-white/20 text-white shadow-sm border border-white/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Tint Selector */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 font-medium px-2">Tint:</span>
              {TINTS.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTint(t.value)}
                  className={`size-6 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                    activeTint === t.value
                      ? "ring-2 ring-white scale-110 border-white"
                      : "border-white/20 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: t.value || "rgb(80,80,80)" }}
                  title={t.label}
                >
                  {activeTint === t.value && <Check className="size-3 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Glass Mode & Variant */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setGlassMode("dark")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  glassMode === "dark"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Dark Glass
              </button>
              <button
                type="button"
                onClick={() => setGlassMode("light")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  glassMode === "light"
                    ? "bg-white text-slate-900 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Light Glass
              </button>
            </div>

            <button
              type="button"
              onClick={() => setGlassVariant(glassVariant === "regular" ? "clear" : "regular")}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                glassVariant === "clear"
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-black/40 text-slate-300 border-white/10 hover:border-white/20"
              }`}
            >
              Surface: {glassVariant === "clear" ? "Clear Variant" : "Regular Fill"}
            </button>
          </div>
        </div>
      </section>

      {/* Main Interactive Stage with Dynamic Colored Backdrop */}
      <div
        data-glass={glassMode}
        data-tint={activeTint}
        className={`flex-1 relative overflow-hidden transition-all duration-700 py-12 px-4 sm:px-8 ${backdrop.bgClass}`}
      >
        {/* Ambient floating blur orbs for enhanced specular refraction */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-cyan-400/20 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-12 right-12 size-[450px] rounded-full bg-blue-500/20 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/3 size-72 rounded-full bg-purple-500/15 blur-[100px]"
        />

        <div className="relative max-w-7xl mx-auto space-y-12">
          {/* SECTION 1: The Core Control Center (Usage Demonstration) */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Interactive Prototype 01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  iOS-Inspired Liquid Control Center
                </h2>
                <p className="text-xs sm:text-sm text-white/70 max-w-xl">
                  Try pressing and dragging the buttons & sliders. Notice the magnetic stretch, dynamic light reflection, and tactile spring physics.
                </p>
              </div>
              <div className="text-xs text-white/60 bg-black/30 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                Volume: <span className="font-mono font-semibold text-white">{volume}%</span> · Brightness:{" "}
                <span className="font-mono font-semibold text-white">{brightness}%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8">
              {/* THE EXACT COMPONENT FROM USAGE.TSX */}
              <div className="flex w-fit flex-col gap-3 rounded-3xl bg-blue-950/40 backdrop-blur-xl p-6 border border-white/15 shadow-2xl shadow-black/40">
                <div className="flex gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Toggle
                      aria-label="Airplane mode"
                      pressed={airplaneOn}
                      onPressedChange={setAirplaneOn}
                      render={<GlassButton magnetic size="lg" shape="circle" accent="#ff9f0a" />}
                    >
                      <AirplaneBoldIcon className="size-7" />
                    </Toggle>

                    <Toggle
                      aria-label="Cellular data"
                      pressed={cellularOn}
                      onPressedChange={setCellularOn}
                      render={<GlassButton magnetic size="lg" shape="circle" accent="#30d158" />}
                    >
                      <CellularBarsBoldIcon className="size-7" />
                    </Toggle>

                    <Toggle
                      aria-label="Wi-Fi"
                      pressed={wifiOn}
                      onPressedChange={setWifiOn}
                      render={<GlassButton magnetic size="lg" shape="circle" accent="#0a84ff" />}
                    >
                      <WifiBoldIcon className="size-7" />
                    </Toggle>

                    <Toggle
                      aria-label="Screen recording"
                      pressed={screenRecordOn}
                      onPressedChange={setScreenRecordOn}
                      render={
                        <GlassButton
                          magnetic
                          size="lg"
                          shape="circle"
                          accent="white"
                          className="[--accent-ink:#ff3b30]"
                        />
                      }
                    >
                      <RecordRingIcon className="size-8" />
                    </Toggle>
                  </div>

                  {/* Tile Slider with reactive volume icon & stretch physics */}
                  <GlassSlider
                    variant="tile"
                    aria-label="Volume"
                    value={volume}
                    onValueChange={setVolume}
                    icon={(onFill) => (
                      <VolumeLevelIcon
                        className="h-7"
                        dimWaves={!onFill}
                        level={volume === 0 ? 0 : volume < 34 ? 1 : volume < 67 ? 2 : 3}
                      />
                    )}
                  />
                </div>

                {/* Display brightness horizontal bar slider */}
                <GlassSlider
                  aria-label="Display brightness"
                  value={brightness}
                  onValueChange={setBrightness}
                  accent="#0a84ff"
                  start={<SunBoldIcon className="size-3.5" />}
                  end={<SunBoldIcon className="size-4.5" />}
                  className="w-full"
                />
              </div>

              {/* Liquid Actions & Goo Filter Unfold */}
              <div className="flex flex-col gap-4 max-w-sm">
                <div className="bg-black/30 backdrop-blur-xl p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">GlassActions (Goo Unfold)</h4>
                      <p className="text-xs text-white/70">Click the orb to trigger the SVG goo filter transition</p>
                    </div>
                  </div>

                  <div className="py-4 flex items-center justify-center">
                    <GlassActions>
                      <GlassActions.Trigger label="Actions Trigger">
                        <Sparkles className="size-5 text-white" />
                      </GlassActions.Trigger>
                      <GlassActions.Action label="Love" closeOnClick onClick={() => alert("Liked!")}>
                        <Heart className="size-5 text-rose-400 fill-rose-400" />
                      </GlassActions.Action>
                      <GlassActions.Action label="Bookmark" closeOnClick onClick={() => alert("Bookmarked!")}>
                        <Bookmark className="size-5 text-amber-400 fill-amber-400" />
                      </GlassActions.Action>
                      <GlassActions.Action label="Share" closeOnClick onClick={() => alert("Shared!")}>
                        <Share2 className="size-5 text-blue-400" />
                      </GlassActions.Action>
                      <GlassActions.Action label="Spark" closeOnClick onClick={() => alert("Sparkled!")}>
                        <Flame className="size-5 text-emerald-400" />
                      </GlassActions.Action>
                    </GlassActions>
                  </div>

                  <p className="text-[11px] text-white/50 text-center">
                    Uses SVG feGaussianBlur, feColorMatrix, and feComposite filters to merge and unmerge liquid glass droplets.
                  </p>
                </div>

                {/* Switch lever showcase */}
                <div className="bg-black/30 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">GlassSwitch</h5>
                    <p className="text-[11px] text-white/60">Tactile spring thumb with momentum slop</p>
                  </div>
                  <GlassSwitch
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                    accent="#30d158"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Composed Stage Pieces (Now Playing, Focus Picker, Composer, Notification) */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/60">
                Interactive Prototype 02
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Composed Stage Pieces
              </h2>
              <p className="text-xs sm:text-sm text-white/70">
                The full suite of composed glass surfaces: Now Playing card, morphing GlassMenu, segmented lens, and dynamic notification toasts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Now Playing Glass Card */}
              <Glass
                variant={glassVariant}
                magnetic
                className="rounded-3xl p-5 border border-white/10 flex flex-col justify-between min-h-[320px] shadow-2xl backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Music className="size-4 text-blue-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Now Playing</span>
                    </div>
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-4 mt-5">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center text-white shrink-0">
                      <RadioIcon className="size-7 animate-spin [animation-duration:8s]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-white truncate">Liquid Reflections</h4>
                      <p className="text-xs text-white/70 truncate">Manik Rana · Lab Edition</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                        Spatial Audio · Dolby Atmos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  {/* Track scrubber slider */}
                  <div className="space-y-1">
                    <GlassSlider
                      aria-label="Track progress"
                      value={trackProgress}
                      onValueChange={setTrackProgress}
                      accent="#38bdf8"
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-white/60">
                      <span>1:42</span>
                      <span>3:58</span>
                    </div>
                  </div>

                  {/* Playback Controls Toolbar */}
                  <div className="flex items-center justify-center">
                    <GlassToolbar>
                      <GlassToolbar.Button
                        aria-label="Previous track"
                        onClick={() => setTrackProgress(0)}
                      >
                        <SkipBack className="size-4 text-white" />
                      </GlassToolbar.Button>
                      <GlassToolbar.Separator />
                      <GlassToolbar.Button
                        aria-label={isPlaying ? "Pause" : "Play"}
                        variant="fill"
                        accent="#0a84ff"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="size-4 text-white fill-white" />
                        ) : (
                          <Play className="size-4 text-white fill-white ml-0.5" />
                        )}
                      </GlassToolbar.Button>
                      <GlassToolbar.Separator />
                      <GlassToolbar.Button
                        aria-label="Next track"
                        onClick={() => setTrackProgress(85)}
                      >
                        <SkipForward className="size-4 text-white" />
                      </GlassToolbar.Button>
                    </GlassToolbar>
                  </div>
                </div>
              </Glass>

              {/* Card 2: Focus Switcher & Morphing Dropdown Menu */}
              <Glass
                variant={glassVariant}
                magnetic
                className="rounded-3xl p-5 border border-white/10 flex flex-col justify-between min-h-[320px] shadow-2xl backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sliders className="size-4 text-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                        Focus & Modals
                      </span>
                    </div>
                    <span className="text-xs font-mono text-white/60">Spring Lens</span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-white/70 mb-2">Segmented Sliding Lens (GlassSegmented)</p>
                      <GlassSegmented
                        value={focusSegment}
                        onValueChange={setFocusSegment}
                        className="mx-auto"
                      >
                        <GlassSegmented.Item value="Personal">
                          <span className="text-xs font-semibold text-white">Personal</span>
                        </GlassSegmented.Item>
                        <GlassSegmented.Item value="Work">
                          <span className="text-xs font-semibold text-white">Work</span>
                        </GlassSegmented.Item>
                        <GlassSegmented.Item value="Sleep">
                          <span className="text-xs font-semibold text-white">Sleep</span>
                        </GlassSegmented.Item>
                      </GlassSegmented>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-medium text-white/70 mb-2">Morphing Dropdown Surface (GlassMenu)</p>
                      <div className="flex justify-center">
                        <GlassMenu>
                          <GlassMenu.Trigger value={menuFocusMode}>
                            <span className="flex items-center gap-2">
                              <span>{menuFocusMode}</span>
                              <ChevronDown className="size-3.5 opacity-60" />
                            </span>
                          </GlassMenu.Trigger>
                          <GlassMenu.Popup>
                            <GlassMenu.Group>
                              <GlassMenu.GroupLabel>Active Profile</GlassMenu.GroupLabel>
                              <GlassMenu.RadioGroup
                                value={menuFocusMode}
                                onValueChange={(val) => setMenuFocusMode(val as string)}
                              >
                                <GlassMenu.RadioItem value="Work">
                                  <span>Work Focus</span>
                                </GlassMenu.RadioItem>
                                <GlassMenu.RadioItem value="Personal">
                                  <span>Personal Mode</span>
                                </GlassMenu.RadioItem>
                                <GlassMenu.RadioItem value="Do Not Disturb">
                                  <span>Do Not Disturb</span>
                                </GlassMenu.RadioItem>
                                <GlassMenu.RadioItem value="Coding Flow">
                                  <span>Coding Flow</span>
                                </GlassMenu.RadioItem>
                              </GlassMenu.RadioGroup>
                            </GlassMenu.Group>
                            <GlassMenu.Separator />
                            <GlassMenu.Item onClick={() => alert("Profile Settings clicked")}>
                              <span>Profile Settings...</span>
                            </GlassMenu.Item>
                          </GlassMenu.Popup>
                        </GlassMenu>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-white/60">
                  Surface morphs directly out of the trigger button coordinates with visualDuration: 0.25 spring physics.
                </div>
              </Glass>

              {/* Card 3: Quick Composer & Notifications Stack */}
              <Glass
                variant={glassVariant}
                magnetic
                className="rounded-3xl p-5 border border-white/10 flex flex-col justify-between min-h-[320px] shadow-2xl backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Bell className="size-4 text-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                        Composer & Alerts
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setToastVisible(true);
                        setToastCount((c) => c + 1);
                      }}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      Trigger Toast
                    </button>
                  </div>

                  {/* Toast Stack */}
                  <div className="mt-5 space-y-3">
                    {toastVisible && (
                      <GlassToast className="w-full justify-between shadow-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <GlassToast.Icon>
                            <Sparkles className="size-4 text-amber-400" />
                          </GlassToast.Icon>
                          <GlassToast.Title className="truncate">
                            AirDrop · Received note #{toastCount}
                          </GlassToast.Title>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <GlassToast.Action onClick={() => alert("Accepted note!")}>
                            Accept
                          </GlassToast.Action>
                          <GlassToast.Close onClick={() => setToastVisible(false)} />
                        </div>
                      </GlassToast>
                    )}

                    {!toastVisible && (
                      <div className="text-center py-4 text-xs text-white/50 border border-dashed border-white/15 rounded-2xl">
                        Toast dismissed · click "Trigger Toast" above to summon again.
                      </div>
                    )}
                  </div>

                  {/* Quick Glass Field Composer */}
                  <div className="mt-6 space-y-2">
                    <p className="text-xs font-medium text-white/70">GlassField (Dynamic Textarea & Input)</p>
                    <GlassField className="w-full bg-white/5">
                      <GlassField.Input
                        placeholder="Leave a quick review thought..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && commentText.trim()) {
                            alert(`Submitted: ${commentText}`);
                            setCommentText("");
                          }
                        }}
                      />
                      <GlassButton
                        size="xs"
                        variant="fill"
                        accent="#0a84ff"
                        shape="circle"
                        aria-label="Send note"
                        onClick={() => {
                          if (commentText.trim()) {
                            alert(`Submitted: ${commentText}`);
                            setCommentText("");
                          }
                        }}
                        className="ml-1"
                      >
                        <Send className="size-3 text-white" />
                      </GlassButton>
                    </GlassField>
                  </div>
                </div>

                <div className="text-[11px] text-white/50 flex items-center gap-1.5 pt-2">
                  <Info className="size-3.5 text-blue-400 shrink-0" />
                  <span>GlassField supports both auto-expanding textarea and single-line input.</span>
                </div>
              </Glass>
            </div>
          </section>

          {/* SECTION 3: Primitives Matrix & Design System Token Mapping */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/60">
                Component Reference & Tokens
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Primitives Matrix
              </h2>
              <p className="text-xs sm:text-sm text-white/70">
                All 4 button variants (Glass, Fill, Tint, Ghost) across 4 standard sizes (xs, sm, md, lg), mapped to this project’s tokens.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-6">
              {/* Button Variants */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-white/60 mb-3">
                  GlassButton Variants (Magnetic)
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <GlassButton variant="glass" magnetic>
                    Glass Variant
                  </GlassButton>
                  <GlassButton variant="fill" accent="#0a84ff" magnetic>
                    Fill Variant
                  </GlassButton>
                  <GlassButton variant="tint" accent="#30d158" magnetic>
                    Tint Variant
                  </GlassButton>
                  <GlassButton variant="ghost" magnetic>
                    Ghost Variant
                  </GlassButton>
                </div>
              </div>

              {/* Button Sizes & Shapes */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-white/60 mb-3">
                  Sizes & Shapes (Circle vs Pill)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <GlassButton size="xs" shape="pill" magnetic>
                    xs pill
                  </GlassButton>
                  <GlassButton size="sm" shape="pill" magnetic>
                    sm pill
                  </GlassButton>
                  <GlassButton size="md" shape="pill" magnetic>
                    md pill
                  </GlassButton>
                  <GlassButton size="lg" shape="pill" magnetic>
                    lg pill
                  </GlassButton>

                  <div className="h-6 w-px bg-white/20 mx-2" />

                  <GlassButton size="xs" shape="circle" magnetic aria-label="Heart xs">
                    <Heart className="size-3" />
                  </GlassButton>
                  <GlassButton size="sm" shape="circle" magnetic aria-label="Heart sm">
                    <Heart className="size-3.5" />
                  </GlassButton>
                  <GlassButton size="md" shape="circle" magnetic aria-label="Heart md">
                    <Heart className="size-4" />
                  </GlassButton>
                  <GlassButton size="lg" shape="circle" magnetic aria-label="Heart lg">
                    <Heart className="size-5" />
                  </GlassButton>
                </div>
              </div>

              {/* Design Token Mapping Details */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="font-mono text-blue-400">--glass-fill</span>
                  <p className="text-white/60 mt-1">
                    Linear gradient mix of sheen & glass-color with backdrop-filter blur(16px).
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="font-mono text-emerald-400">--glass-rim</span>
                  <p className="text-white/60 mt-1">
                    Dynamic top/bottom specular highlights mapped to OKLab mixes.
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="font-mono text-amber-400">--glass-contact</span>
                  <p className="text-white/60 mt-1">
                    Shadow contact drop + lift shade for realistic elevation physics.
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="font-mono text-pink-400">useMagnetic</span>
                  <p className="text-white/60 mt-1">
                    Spring gesture hook with pointer tracking, grip scale, and slop release.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
