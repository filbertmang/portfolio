"use client";

import React, { useEffect, useState } from "react";
import {
  Droplets,
  Sparkles,
  Waves,
  CreditCard,
  ShieldCheck,
  Infinity as InfinityIcon,
  Layers,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  FloatWaterCard,
  type CardLayoutVariant,
  type CardSurfaceStyle,
  type WaterPaletteStyle,
} from "@/components/float-card/FloatWaterCard";
import { CompanyLogo } from "@/components/CompanyLogos";
import { usePrototypeControl } from "@/components/prototype-control";

export default function FloatCardPage() {
  const { activeApproach, setActiveApproach } = usePrototypeControl();

  const [surfaceStyle, setSurfaceStyle] = useState<CardSurfaceStyle>("limestone");
  const [waterPalette, setWaterPalette] = useState<WaterPaletteStyle>("float-ocean");
  const [layoutVariant, setLayoutVariant] = useState<CardLayoutVariant>("video-minimal");

  // Sync with Prototype Control approach switcher when user selects a Float Card approach in Cmd+K
  useEffect(() => {
    if (activeApproach === "float-card-limestone") {
      setSurfaceStyle("limestone");
      setWaterPalette("float-ocean");
      setLayoutVariant("video-minimal");
    } else if (activeApproach === "float-card-glacial") {
      setSurfaceStyle("glacial-ice");
      setWaterPalette("bioluminescent");
      setLayoutVariant("spend-request");
    } else if (activeApproach === "float-card-navy") {
      setSurfaceStyle("float-navy");
      setWaterPalette("float-ocean");
      setLayoutVariant("spend-request");
    }
  }, [activeApproach]);

  return (
    <main className="flex-1 w-full bg-[#f8fafc] dark:bg-[#070e17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-sky-50/70 via-white to-transparent dark:from-sky-950/25 dark:via-transparent dark:to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 text-xs font-semibold tracking-wide border border-sky-200/60 dark:border-sky-800/60 shadow-xs">
            <CompanyLogo company="float" variant="glyph" className="size-3.5 text-sky-700 dark:text-sky-300" />
            <span>Float Financial · Spend Request Card &amp; Living Water Shader</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Float Corporate Card{" "}
            <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600 dark:from-sky-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
              Water Edition
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Replicating the organic card erosion choreography with{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              Float Financial&apos;s brand mark
            </strong>{" "}
            and a real-time{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              WebGL seascape water shader
            </strong>
            — featuring branching surface fractures, lacy seafoam shorelines, underwater caustics, and an interactive{" "}
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
              ∞
            </code>{" "}
            lagoon channel.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {(
              [
                {
                  id: "float-card-limestone",
                  label: "01. Video Match (Weathered Stone)",
                },
                {
                  id: "float-card-glacial",
                  label: "02. Glacial Ice (Spend Request)",
                },
                {
                  id: "float-card-navy",
                  label: "03. Float Midnight Navy",
                },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveApproach(preset.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  activeApproach === preset.id
                    ? "bg-[#0d1926] text-white dark:bg-white dark:text-[#0d1926] border-[#0d1926] dark:border-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-300"
                }`}
              >
                {preset.label}
              </button>
            ))}

            <span className="text-xs text-slate-400 dark:text-slate-500 pl-1">
              Press{" "}
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                ⌘K
              </kbd>{" "}
              for Prototype Control
            </span>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Interactive Float Water Card Component */}
        <section>
          <FloatWaterCard
            surfaceStyle={surfaceStyle}
            waterPalette={waterPalette}
            layoutVariant={layoutVariant}
            onSurfaceStyleChange={setSurfaceStyle}
            onWaterPaletteChange={setWaterPalette}
            onLayoutVariantChange={setLayoutVariant}
          />
        </section>

        {/* ─── CHOREOGRAPHY & SHADER BREAKDOWN (00:00 -> 00:08) ─── */}
        <section className="space-y-6">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold">
                Choreography &amp; Shader Architecture
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                From Grass to Living Water (00:00 &rarr; 00:08)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              60 FPS WebGL + Multi-Octave FBM Shoreline Displacement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                time: "00:00 – 00:01",
                title: "Mineral Slab & Coastal Mist",
                desc: "Starts with a pitted travertine/limestone Float card bearing Float's geometric ribbon glyph, brushed EMV smart chip, and cardholder typography as delicate tide droplets form along the perimeter.",
                icon: CreditCard,
              },
              {
                time: "00:01 – 00:02",
                title: "Branching Surface Fractures",
                desc: "Procedural lightning-tree fissures propagate inward from all four card edges and across the metallic EMV chip with 3D chipped stone lips and cyan subsurface water seepage.",
                icon: Layers,
              },
              {
                time: "00:02 – 00:03",
                title: "Shoreline Surge & Chip Lagoon",
                desc: "The right and bottom edges swell inward into an organic coastal shoreline with frothy whitewater seafoam, while interior lagoons erupt along the fractures and across the EMV chip.",
                icon: Waves,
              },
              {
                time: "00:04 – 00:08",
                title: "Infinity (∞) Water Channel",
                desc: "A continuous stream carves the figure-eight (∞) loop across the center of the card—revealing refracted stone shelves, dancing underwater caustics, and interactive 3D surface waves.",
                icon: InfinityIcon,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.time}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0b131e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                      {step.time}
                    </span>
                    <Icon className="size-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
