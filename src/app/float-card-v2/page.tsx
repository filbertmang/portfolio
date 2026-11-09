"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Cpu,
  Layers,
  ShieldCheck,
  CreditCard,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { FloatWaterCardV2 } from "@/components/float-card-v2/FloatWaterCardV2";
import { CompanyLogo } from "@/components/CompanyLogos";

export default function FloatCardV2Page() {
  return (
    <main className="flex-1 w-full bg-[#f8fafc] dark:bg-[#070e17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* ─── HERO HEADER ─── */}
      <section className="relative overflow-hidden pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-emerald-50/50 via-white to-transparent dark:from-emerald-950/20 dark:via-transparent dark:to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
            <CompanyLogo company="float" variant="glyph" className="size-3.5 text-emerald-700 dark:text-emerald-300" />
            <span>Float Financial · Float Card v2 (VGPU Holographic)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Float Card v2{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400 bg-clip-text text-transparent">
              Holographic Edition
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Redesigned with Float&apos;s official silver CAD card face (Float watermark, Canada emblem, and VISA Purchasing mark), powered by{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">VGPU</strong> for real-time holographic diffraction on hover and a subtle, transparent optical water wave.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/float-card"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Float Card v1 (Stone Erosion)</span>
            </Link>

            <a
              href="https://vgpu.sh/examples/holographic-card"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs hover:bg-emerald-100 transition-colors"
            >
              <span>VGPU Holographic Card Spec</span>
              <ExternalLink className="size-3" />
            </a>

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

      {/* ─── CARD COMPONENT MOUNT ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        <section>
          <FloatWaterCardV2 />
        </section>

        {/* ─── ARCHITECTURE COMPARISON & SPEC BREAKDOWN ─── */}
        <section className="space-y-6">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                Design &amp; Shader Architecture
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                Float Card v2 Specifications
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              VGPU + WebGPU Fragment Shader &bull; Transparent Optics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b131e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Card Face Redesign
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Float CAD Visa Spec
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Matches Image 2 exactly: silver card finish, subtle Float monogram watermark, Canadian maple leaf emblem, VISA Purchasing mark, and clean lower-left cardholder name &amp; monthly limit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b131e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  VGPU Holographic Foil
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Wavy Contour Diffraction (Image 1)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Integrated directly from <code className="font-mono text-[11px]">vgpu.sh/examples/holographic-card</code>. Grazing light sweeps across the card on hover with organic contour waves, iridescent rainbow dispersion, and 3D perspective tilt.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b131e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Droplets className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Subtle Clear Water
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Transparent Physical Optics
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Plays once automatically on load. No blue dye — only physical surface refraction, wave glints, and wet sheen over the card face. Click-to-add water has been cleanly removed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
