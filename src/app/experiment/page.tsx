// Experiment Playground: Calendly Flex Bubbles & Liquid Tabs
// Design Compass Reference: https://designcompass.org/en/2026/08/20/calendly-flex-bubbles-brand-system/

"use client";

import React, { useState } from "react";
import {
  Calendar,
  Hourglass,
  Leaf,
  Sparkles,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  Sliders,
  Layers,
  Sparkle,
} from "lucide-react";
import {
  FlexBubbleChain,
  FlexBubbleTabs,
  FlexBubbleDetailInspector,
  type CalendlyProductTab,
} from "@/components/ui/flex-bubble";

/* ─────────────────────────────────────────────────────────
 * MOCKUPS FOR CALENDLY PRODUCTS
 * ───────────────────────────────────────────────────────── */

function SchedulingMockup() {
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");
  const slots = ["9:00 AM", "10:30 AM", "1:15 PM", "3:45 PM"];

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            FM
          </div>
          <div>
            <h4 className="text-sm font-semibold">Filbert Mangundap</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Design Portfolio Intro · 30m</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
          Available Today
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          Select a time (EDT Toronto)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSlot(s)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                selectedSlot === s
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5 text-blue-600" />
          <span>Instant calendar invite sent</span>
        </span>
        <span className="font-medium text-blue-600">Google Meet</span>
      </div>
    </div>
  );
}

function NotetakerMockup() {
  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
            <Leaf className="size-4" />
          </div>
          <span className="text-sm font-semibold">Q2 Product Strategy</span>
        </div>
        <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">
          LIVE RECAP
        </span>
      </div>

      {/* Attendee Avatars */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="size-8 rounded-full bg-purple-200 dark:bg-purple-900 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-purple-800 dark:text-purple-200">
            EL
          </div>
          <div className="size-8 rounded-full bg-pink-200 dark:bg-pink-900 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-pink-800 dark:text-pink-200">
            SK
          </div>
          <div className="size-8 rounded-full bg-emerald-200 dark:bg-emerald-900 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-emerald-800 dark:text-emerald-200">
            FM
          </div>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          3 participants &bull; 42 mins recorded
        </span>
      </div>

      {/* Action Items List */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold tracking-wide uppercase text-purple-700 dark:text-purple-300">
          Action Items (3)
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/40">
            <CheckCircle2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
            <span>Filbert to deliver high-fidelity Liquid Tab tokens in Figma</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/40">
            <CheckCircle2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
            <span>Sync Stripe billing webhooks with customer portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CallieAiMockup() {
  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <span className="text-sm font-semibold">Callie Pre-Meeting Dossier</span>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          AI Brief
        </span>
      </div>

      <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-2">
        <p className="font-semibold text-amber-900 dark:text-amber-200">
          Key Objective: Series B Design System Architecture
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Invitee Maya Chen previously partnered with Float on automated credit workflows. Expressed strong interest in fluid transition mechanics.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="px-2.5 py-1 text-[11px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          💡 Suggest: 15-min interactive demo
        </span>
        <span className="px-2.5 py-1 text-[11px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          📊 Share design metrics
        </span>
      </div>
    </div>
  );
}

function PaymentsMockup() {
  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <CreditCard className="size-4" />
          </div>
          <span className="text-sm font-semibold">Design Consultation</span>
        </div>
        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
          $250.00
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Card details</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">•••• 4242</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between text-emerald-800 dark:text-emerald-200">
          <span>Stripe Secure Check-in</span>
          <span className="font-bold">Verified</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Funds held in escrow until session completion.
      </p>
    </div>
  );
}

function ContactsMockup() {
  return (
    <div className="space-y-3.5 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-semibold">Unified Invitee Timeline</span>
        <span className="text-xs text-rose-600 font-semibold">12 Sessions</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
              MC
            </div>
            <span className="font-medium">Maya Chen (VP Design)</span>
          </div>
          <span className="text-slate-400">Yesterday</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
              AK
            </div>
            <span className="font-medium">Alex Kim (Lead Recruiter)</span>
          </div>
          <span className="text-slate-400">3 days ago</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * CALENDLY PRODUCT TABS DATA
 * ───────────────────────────────────────────────────────── */

const CALENDLY_PRODUCTS: CalendlyProductTab[] = [
  {
    id: "scheduling",
    name: "Scheduling",
    headline: "The world's #1 scheduling tool, just as simple as ever.",
    description:
      "Giving you complete control and total customization, Calendly is the easiest way to find time to connect across time zones without back-and-forth emails.",
    primaryAction: "Get started with Scheduling",
    icon: <Hourglass className="size-4" />,
    accentColor: "#006BFF",
    accentForeground: "#FFFFFF",
    cardBg: "#DCEBFF",
    cardText: "#0D1E3A",
    pills: ["One-link scheduling", "Full calendar control", "Easy rebooking"],
    mockup: <SchedulingMockup />,
  },
  {
    id: "notetaker",
    name: "Notetaker",
    badge: "New",
    headline: "Actionable, shareable recaps for every meeting.",
    description:
      "Finish the day knowing every meeting was captured, next steps were tracked, and follow-ups were handled automatically by AI.",
    primaryAction: "Explore Notetaker",
    icon: <Leaf className="size-4" />,
    accentColor: "#7C3AED",
    accentForeground: "#FFFFFF",
    cardBg: "#EDE9FE",
    cardText: "#251247",
    pills: ["Automated transcription", "AI Action items", "CRM auto-sync"],
    mockup: <NotetakerMockup />,
  },
  {
    id: "callie",
    name: "Callie AI",
    badge: "Smart",
    headline: "Intelligent meeting prep before you even say hello.",
    description:
      "Callie synthesizes attendee backgrounds, past meeting notes, and company context into a crisp 30-second pre-meeting brief.",
    primaryAction: "Try Callie AI",
    icon: <Sparkles className="size-4" />,
    accentColor: "#EA580C",
    accentForeground: "#FFFFFF",
    cardBg: "#FFEDD5",
    cardText: "#351502",
    pills: ["Attendee dossiers", "Pre-meeting briefs", "Dynamic agendas"],
    mockup: <CallieAiMockup />,
  },
  {
    id: "payments",
    name: "Payments",
    headline: "Collect payments seamlessly at the time of booking.",
    description:
      "Integrate Stripe and PayPal directly into your scheduling flow to eliminate no-shows and collect deposits with zero friction.",
    primaryAction: "Configure Payments",
    icon: <CreditCard className="size-4" />,
    accentColor: "#059669",
    accentForeground: "#FFFFFF",
    cardBg: "#D1FAE5",
    cardText: "#073222",
    pills: ["Instant Stripe & PayPal", "Deposit support", "Refund protection"],
    mockup: <PaymentsMockup />,
  },
  {
    id: "contacts",
    name: "Contacts",
    headline: "Unified relationship history for every invitee.",
    description:
      "Track past sessions, upcoming milestones, and personal notes across your team in one consolidated, searchable directory.",
    primaryAction: "Explore Contacts",
    icon: <Users className="size-4" />,
    accentColor: "#E11D48",
    accentForeground: "#FFFFFF",
    cardBg: "#FFE4E6",
    cardText: "#3C0915",
    pills: ["Invitee activity feed", "Team-wide visibility", "CSV & CRM export"],
    mockup: <ContactsMockup />,
  },
];

/* ─────────────────────────────────────────────────────────
 * CHAIN PRESETS (Image 1: [Icon] ~ [Event Type] ~ [Status])
 * ───────────────────────────────────────────────────────── */

const CHAIN_PRESETS = [
  {
    name: "Calendly Healthcare (from Reference)",
    segments: [
      {
        id: "icon-1",
        type: "icon" as const,
        sublabel: "01. Icon",
        content: <Hourglass className="size-6 text-slate-900" />,
        bgColor: "#ffffff",
        textColor: "#0f172a",
      },
      {
        id: "event-1",
        type: "event" as const,
        sublabel: "02. Event Type",
        content: <span>Patient Visit</span>,
        bgColor: "#ffffff",
        textColor: "#0f172a",
      },
      {
        id: "status-1",
        type: "status" as const,
        sublabel: "03. Status",
        content: <span>Scheduled</span>,
        isSerif: true,
        bgColor: "#ffffff",
        textColor: "#0f172a",
      },
    ],
  },
  {
    name: "Sales Demo & Onboarding",
    segments: [
      {
        id: "icon-2",
        type: "icon" as const,
        sublabel: "Product",
        content: <Calendar className="size-6 text-blue-600" />,
        bgColor: "#EBF3FF",
        textColor: "#006BFF",
      },
      {
        id: "event-2",
        type: "event" as const,
        sublabel: "Event",
        content: <span>Enterprise Demo · 45m</span>,
        bgColor: "#EBF3FF",
        textColor: "#0D1E3A",
      },
      {
        id: "status-2",
        type: "status" as const,
        sublabel: "State",
        content: <span>Confirmed</span>,
        isSerif: true,
        bgColor: "#EBF3FF",
        textColor: "#006BFF",
      },
    ],
  },
  {
    name: "Design Portfolio Review",
    segments: [
      {
        id: "icon-3",
        type: "icon" as const,
        sublabel: "Domain",
        content: <Sparkles className="size-6 text-purple-600" />,
        bgColor: "#F3E8FF",
        textColor: "#7C3AED",
      },
      {
        id: "event-3",
        type: "event" as const,
        sublabel: "Topic",
        content: <span>Senior Product Designer Interview</span>,
        bgColor: "#F3E8FF",
        textColor: "#251247",
      },
      {
        id: "status-3",
        type: "status" as const,
        sublabel: "Result",
        content: <span>In Progress</span>,
        isSerif: true,
        bgColor: "#F3E8FF",
        textColor: "#7C3AED",
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
 * MAIN EXPERIMENT PAGE COMPONENT
 * ───────────────────────────────────────────────────────── */

export default function ExperimentPage() {
  const [activeTabId, setActiveTabId] = useState("scheduling");
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [useLiquidMotion, setUseLiquidMotion] = useState(true);

  // Chain state
  const [selectedChainIdx, setSelectedChainIdx] = useState(0);

  // Anatomy inspector state
  const [inspectorGap, setInspectorGap] = useState(28);
  const [inspectorWaist, setInspectorWaist] = useState(20);
  const [inspectorAttach, setInspectorAttach] = useState(44);

  const activeChain = CHAIN_PRESETS[selectedChainIdx];

  return (
    <main className="flex-1 w-full bg-[#f8fafc] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 transition-colors">
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-sky-50/50 via-white to-transparent dark:from-sky-950/20 dark:via-transparent dark:to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-semibold tracking-wide border border-blue-200/50 dark:border-blue-800/50 shadow-xs">
            <Sparkle className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>Calendly Brand System · Flex Bubbles &amp; Liquid Tabs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Flex Bubbles with Liquid Surface Tension
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Inspired by Calendly&apos;s brand overhaul designed by Smith &amp; Diction.
            Organic squircle containers connected by continuous concave Bézier bridges,
            integrated with Hairline UI&apos;s liquid spring physics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://designcompass.org/en/2026/08/20/calendly-flex-bubbles-brand-system/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <span>Design Compass Case Study</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
            <span className="text-xs text-slate-400">
              Press <kbd className="px-1.5 py-0.5 font-mono text-[11px] rounded bg-slate-200 dark:bg-slate-800">⌘K</kbd> to inspect tokens &amp; levers
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {/* ─── SECTION 1: CALENDLY PRODUCT SUITE & TABS ─── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
                01. Interactive Showcase
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                Flex Bubble Tabs + Liquid Springs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                The active tab projects a smooth concave bridge directly into the content panel below.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setOrientation("horizontal")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orientation === "horizontal"
                      ? "bg-white dark:bg-slate-700 shadow-xs font-semibold text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Horizontal (Image 3)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation("vertical")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orientation === "vertical"
                      ? "bg-white dark:bg-slate-700 shadow-xs font-semibold text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Vertical (Image 2)
                </button>
              </div>

              {orientation === "horizontal" && (
                <button
                  type="button"
                  onClick={() => setUseLiquidMotion(!useLiquidMotion)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    useLiquidMotion
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {useLiquidMotion ? "Liquid Tabs: ON" : "Discrete Tabs"}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Component Mount */}
          <div className="pt-4 flex justify-center">
            <FlexBubbleTabs
              tabs={CALENDLY_PRODUCTS}
              activeId={activeTabId}
              onTabChange={setActiveTabId}
              orientation={orientation}
              useLiquidMotion={useLiquidMotion}
            />
          </div>
        </section>

        {/* ─── SECTION 2: THE CHAINED BUBBLE SYSTEM (Image 1) ─── */}
        <section className="space-y-6">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
              02. Modular Chain System
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Flex Bubble Chain (Icon ~ Event Type ~ Status)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Image 1 reference: adjacent modules are fused with organic liquid fillets forming a single cohesive visual unit.
            </p>
          </div>

          {/* Preset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {CHAIN_PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setSelectedChainIdx(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedChainIdx === idx
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Chain Stage with dynamic background */}
          <div className="relative rounded-3xl p-10 sm:p-14 overflow-hidden bg-gradient-to-br from-sky-400/25 via-blue-500/20 to-indigo-600/30 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-950/40 border border-white/40 dark:border-white/10 shadow-xl flex flex-col items-center justify-center min-h-[220px]">
            <div className="absolute top-4 left-6 text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 opacity-70">
              Live Flex Bubble Chain
            </div>

            <div className="scale-100 sm:scale-105 transition-transform duration-300">
              <FlexBubbleChain
                segments={activeChain.segments}
                gap={16}
                bridgeWaist={20}
                bridgeAttach={38}
              />
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: GEOMETRIC DETAIL INSPECTOR (Image 1 "Detail") ─── */}
        <section className="space-y-6">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
              03. CAD &amp; Fillet Geometry
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Bridge Anatomy &amp; Concave Bézier Fillet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Image 1 zoom view: inspect how adjacent pill boundaries blend smoothly through tangent-continuous Bézier curves.
            </p>
          </div>

          {/* Controls to adjust waist & gap */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Bridge Gap Distance: <span className="font-mono text-blue-600">{inspectorGap}px</span>
              </label>
              <input
                type="range"
                min="14"
                max="56"
                value={inspectorGap}
                onChange={(e) => setInspectorGap(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Waist Pinch: <span className="font-mono text-blue-600">{inspectorWaist}px</span>
              </label>
              <input
                type="range"
                min="10"
                max="36"
                value={inspectorWaist}
                onChange={(e) => setInspectorWaist(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Attachment Height: <span className="font-mono text-blue-600">{inspectorAttach}px</span>
              </label>
              <input
                type="range"
                min="24"
                max="64"
                value={inspectorAttach}
                onChange={(e) => setInspectorAttach(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <FlexBubbleDetailInspector
            leftText="sit"
            rightText="Sc"
            gap={inspectorGap}
            bridgeWaist={inspectorWaist}
            bridgeAttach={inspectorAttach}
          />
        </section>

        {/* ─── SECTION 4: INTEGRATION REFERENCE & CODE ─── */}
        <section className="space-y-6">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
              04. Component Architecture
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Reusable Export API
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Drop-in components ready to power product tours, navigation menus, and modular status badges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Layers className="size-4 text-blue-600" />
                <span>FlexBubbleChain Component</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
{`<FlexBubbleChain
  segments={[
    { id: "1", content: <Hourglass /> },
    { id: "2", content: "Patient Visit" },
    { id: "3", content: "Scheduled", isSerif: true },
  ]}
  gap={16}
  bridgeWaist={20}
/>`}
              </pre>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sliders className="size-4 text-purple-600" />
                <span>FlexBubbleTabs + LiquidTabs</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
{`<FlexBubbleTabs
  tabs={CALENDLY_PRODUCTS}
  activeId={activeTab}
  onTabChange={setActiveTab}
  orientation="horizontal"
  useLiquidMotion={true}
/>`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
