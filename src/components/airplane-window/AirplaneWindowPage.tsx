"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AirplaneWindow, mixHex } from "./AirplaneWindow";
import { usePrototypeControl } from "@/components/prototype-control";
import { CompanyLogo, type CompanyId } from "@/components/CompanyLogos";

interface CareerStop {
  id: CompanyId;
  route: string;
  year: string;
  period: string;
  location: string;
  company: string;
  href: string;
  badge?: string;
  role: string;
  highlights: string[];
}

const FLIGHT_PLAN_STOPS: CareerStop[] = [
  {
    id: "float",
    route: "YYZ",
    year: "2026",
    period: "May 2026 - Present",
    location: "Toronto, ON",
    company: "Float",
    href: "/work/float",
    badge: "CURRENT",
    role: "Senior Product Designer, Spend Management & AI Automation",
    highlights: [
      "Designing end-to-end spend management experiences — covering corporate cards, expense approvals, and budget controls — to help finance teams gain real-time visibility and control over company spending.",
      "Shaping AI & Automation product surfaces that reduce manual work for finance operators, including intelligent categorization, automated approval flows, and proactive spend insights.",
    ],
  },
  {
    id: "7shifts",
    route: "YYZ",
    year: "2025",
    period: "Sept 2025 - May 2026",
    location: "Toronto, ON",
    company: "7shifts",
    href: "/work/7shifts",
    role: "Product Designer, Integrations",
    highlights: [
      "Designed and mapped user flows for third-party payroll and POS integrations, like ADP and Toast, to simplify the partner onboarding and data setup experience.",
      "Led the design for a new centralized hub that manages data-mapping and error handling across 120+ partner integrations, helping restaurant groups maintain accurate labor data.",
    ],
  },
  {
    id: "sonnet",
    route: "YVR>YYZ",
    year: "2024",
    period: "Aug 2024 - Sept 2025",
    location: "Toronto, ON",
    company: "Sonnet",
    href: "/work/sonnet",
    role: "Product Designer",
    highlights: [
      "Led the end-to-end redesign of the auto insurance coverage page to meet new Ontario regulations, using card sorting and usability testing to simplify complex coverage options — helping Sonnet achieve profitability for the first time.",
      "Boosted bundle conversions by 29% and quote-to-bind rates by 22% through geo-targeted CMS landing pages, while driving a 15% increase in customer lifetime value via A/B testing and bundling optimization experiments.",
    ],
  },
  {
    id: "teck",
    route: "YVR",
    year: "2023",
    period: "Sept 2023 - Apr 2024",
    location: "Vancouver, BC",
    company: "Teck",
    href: "/work/teck",
    role: "Product Designer, Co-Op, Design Systems",
    highlights: [
      "Built and maintained Nova, Teck’s internal WCAG-compliant design system, achieving 100× YoY growth in adoption and <2% component detach rate, reducing design cycle times across Teck’s diverse digital portfolio.",
      "Designed cross-platform, responsive data visualization dashboards to help enable mining supervisors translate real-time fleet management data into actionable insights. Co-facilitated 3+ discovery workshops with mine operators.",
    ],
  },
  {
    id: "telus-digital",
    route: "YVR>SEA",
    year: "2023",
    period: "May 2023 - Aug 2023",
    location: "Vancouver, BC",
    company: "TELUS Digital",
    href: "/work/telus-digital",
    role: "Product Designer, Intern",
    highlights: [
      "Redesigned T-Mobile's end-to-end employee retail experience to drive customer self-service through AI-powered tools, informed by immersive field research with staff and customers in Seattle.",
      "Designed AI-based translation tools and spatial UI experiences for visionOS for Fortune 500 clients across fintech and sports, delivering production-ready concepts under accelerated timelines.",
    ],
  },
  {
    id: "visier",
    route: "SIN>YVR",
    year: "2022",
    period: "May 2022 - Dec 2022",
    location: "Vancouver, BC",
    company: "Visier",
    href: "/work/visier",
    role: "User Experience Designer, Co-Op",
    highlights: [
      "Redesigned internal workflows in Visier Studio, including the Mapping page and admin task flows, reducing task completion time by 37% and boosting platform adoption over its legacy version.",
      "Designed and launched Visier Survey, a net-new feature enabling 25K+ enterprise users to create and analyze custom surveys without third-party tools with AI-powered automated trend summaries and recommendations.",
    ],
  },
  {
    id: "gojek",
    route: "SIN",
    year: "2021",
    period: "Jun 2021 - Dec 2021",
    location: "Singapore",
    company: "Gojek",
    href: "/work/gojek",
    role: "Product Designer, Intern",
    highlights: [
      "Reduced ride cancellations by 6% across 40M+ users through interaction design interventions addressing pickup anxiety — contributing substantial operational savings and supporting key business goals at scale.",
      "Designed the Save Address feature from end to end, enabling users to store frequent locations — driving 8K+ saves/day for rides and 40K+/day for food delivery.",
    ],
  },
];

const LEADERSHIP_ITEMS = [
  {
    title: "Design Mentor at Sonnet",
    description:
      "Mentor for a junior designer, supporting their growth in design practices and collaboration.",
  },
  {
    title: "Design Lead at UBC Launch Pad",
    description:
      "Mentored 15+ designers through workshops, portfolio reviews, and design critiques.",
  },
  {
    title: "Founding Designer at Garuda Hacks",
    description:
      "Spearheaded design efforts for one of Southeast Asia’s largest student hackathons.",
  },
];

const SKILLS_AND_TOOLS = [
  {
    category: "Design",
    items:
      "UI/UX Design, Interaction Design, Design Systems, Accessibility (WCAG), Cross-Platform Design, Design QA",
  },
  {
    category: "Research",
    items:
      "User Research, User Interviews, Surveys, Usability Testing, A/B Testing, Journey Mapping, Heuristic Evaluation",
  },
  {
    category: "Process",
    items:
      "Product Thinking, Systems Thinking, Dev Handoff, Agile Framework, Stakeholder Alignment, Rapid Prototyping",
  },
  {
    category: "Design Tools",
    items:
      "Figma, Adobe Creative, Webflow, Framer, CMS, JIRA, FullStory, Qualtrics, HTML/CSS, Android Studio",
  },
  {
    category: "AI Tools",
    items:
      "Claude, Claude Code, Cursor, Conductor, Linear, Gemini, NotebookLM, ChatGPT, Lovable, MCP, Agents",
  },
];

export function AirplaneWindowPage() {
  const {
    shadeProgress,
    setShadeProgress,
    cloudSpeed,
    activeApproach,
  } = usePrototypeControl();

  const [isNightIlluminated, setIsNightIlluminated] = useState(false);
  const [isDraggingShade, setIsDraggingShade] = useState(false);

  // Replicate the exact video sequence:
  // 1. As the shade slides down (0 -> 0.90), the room dims proportionally with sunlight blocked.
  // 2. When pulled all the way down (>= 0.90), the cabin briefly goes dark (~200ms) and then
  //    illuminates into Night / Dark Mode (white headlines, luminous accents, #212121 cabin).
  // 3. When pulled back up (< 0.76), it transitions back to daylight mode.
  useEffect(() => {
    if (shadeProgress >= 0.9) {
      const timer = setTimeout(() => {
        setIsNightIlluminated(true);
        document.documentElement.classList.add("dark");
      }, 210);
      return () => clearTimeout(timer);
    } else if (shadeProgress < 0.76) {
      const timer = setTimeout(() => {
        setIsNightIlluminated(false);
        document.documentElement.classList.remove("dark");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [shadeProgress]);

  // Base light-mode canvas color:
  // Approach A matches the warm alabaster cream in the video (#F8F3EF)
  // Approach B uses Filbert's signature ice canvas (#F9FCFF)
  const lightCanvasHex = activeApproach === "approach-b" ? "#F9FCFF" : "#F8F3EF";

  // Calculate continuous background color
  const dimCurve = Math.pow(shadeProgress, 1.08);
  const rawDimmedBg = mixHex(lightCanvasHex, "#151515", dimCurve);
  const pageBgColor = isNightIlluminated
    ? mixHex("#181818", "#232323", Math.min(1, (shadeProgress - 0.75) * 4))
    : rawDimmedBg;

  // Typography & UI colors:
  const primaryTextColor = isNightIlluminated
    ? "#EAE8E4"
    : mixHex("#2E2C2A", "#252423", shadeProgress);

  const secondaryTextColor = isNightIlluminated
    ? "#94928E"
    : mixHex("#76706A", "#4A4846", shadeProgress);

  const flightPlanBlue = isNightIlluminated
    ? "#5E6DF2"
    : mixHex("#3544DC", "#2A3499", shadeProgress);

  const dashedLineColor = isNightIlluminated
    ? "#484745"
    : mixHex("#CBC4BC", "#353331", shadeProgress);

  const routeMetaColor = isNightIlluminated
    ? "#686663"
    : mixHex("#B5AEA6", "#383634", shadeProgress);

  const yearMetaColor = isNightIlluminated
    ? "#85837F"
    : mixHex("#928B83", "#464442", shadeProgress);

  const roleSubtitleColor = isNightIlluminated
    ? "#ABA9A4"
    : mixHex("#4E4A46", "#3D3B39", shadeProgress);

  const pillBorderColor = isNightIlluminated
    ? "rgba(255,255,255,0.10)"
    : "rgba(46,44,42,0.10)";

  return (
    <main
      className={`flex-1 w-full min-h-[calc(100vh-52px)] overflow-x-hidden ${
        isDraggingShade
          ? "transition-none"
          : "transition-[background-color] duration-500 ease-out"
      }`}
      style={{
        backgroundColor: pageBgColor,
      }}
    >
      <div className="max-w-[780px] mx-auto px-6 pt-10 sm:pt-14 pb-28 flex flex-col items-center">
        {/* ====================================================================
            1. INTERACTIVE 3D AIRPLANE WINDOW (CENTER HERO)
            ==================================================================== */}
        <div className="relative flex flex-col items-center">
          <AirplaneWindow
            progress={shadeProgress}
            onChange={setShadeProgress}
            onDragStateChange={setIsDraggingShade}
            cloudSpeed={cloudSpeed}
            isNightIlluminated={isNightIlluminated}
          />
        </div>

        {/* ====================================================================
            2. HERO STATEMENT & FLIGHT PLAN TIMELINE
            ==================================================================== */}
        <div className="w-full mt-11 relative">
          {/* Centered Hero Headline & Resume Bio */}
          <div className="text-center max-w-[540px] mx-auto px-2">
            <h1
              className="text-[19px] sm:text-[21px] font-semibold tracking-[-0.022em] transition-colors duration-500"
              style={{ color: primaryTextColor }}
            >
              Filbert Mangundap
            </h1>

            <p
              className="mt-2.5 text-[16px] sm:text-[17.5px] leading-[1.58] tracking-[-0.015em] font-normal transition-colors duration-500"
              style={{ color: secondaryTextColor }}
            >
              Senior product designer based in Toronto with four years of
              experience designing 0 &rarr; 1 for operational and finance tech.
            </p>

            {/* Quick Contact Links from Resume */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-[12.5px] font-mono">
              <a
                href="https://filbert.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-full transition-colors duration-300 hover:opacity-80"
                style={{
                  color: roleSubtitleColor,
                  border: `1px solid ${pillBorderColor}`,
                }}
              >
                filbert.studio &#8599;
              </a>
              <a
                href="https://www.linkedin.com/in/filbertmang/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-full transition-colors duration-300 hover:opacity-80"
                style={{
                  color: roleSubtitleColor,
                  border: `1px solid ${pillBorderColor}`,
                }}
              >
                in/filbertmang &#8599;
              </a>
              <a
                href="mailto:filbertmangundap@gmail.com"
                className="px-2.5 py-1 rounded-full transition-colors duration-300 hover:opacity-80"
                style={{
                  color: roleSubtitleColor,
                  border: `1px solid ${pillBorderColor}`,
                }}
              >
                filbertmangundap@gmail.com
              </a>
            </div>
          </div>

          {/* ==================================================================
              FLIGHT PLAN ROUTE & CAREER TIMELINE
              ================================================================== */}
          <div className="relative mt-8 sm:-mt-8 w-full max-w-[660px] mx-auto">
            {/* FLIGHT PLAN Header + Airplane Icon + S-Curve Dashed SVG */}
            <div className="relative pl-[56px] sm:pl-[74px]">
              {/* "FLIGHT PLAN" + Blue Airplane Icon at the start of the curve */}
              <div className="flex flex-col items-center w-[76px] -ml-[12px]">
                <span
                  className="text-[9.5px] font-mono font-semibold uppercase tracking-[0.14em] transition-colors duration-500 select-none"
                  style={{ color: flightPlanBlue }}
                >
                  FLIGHT PLAN
                </span>

                {/* Solid Airplane Icon pointing downward along the flight path */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[18px] h-[18px] mt-2 transition-colors duration-500"
                  style={{
                    color: flightPlanBlue,
                    transform: "rotate(180deg)",
                  }}
                  aria-hidden="true"
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>

              {/* Curved SVG Dashed Flight Path connecting the airplane to the vertical timeline */}
              <div className="relative h-[68px] w-full pointer-events-none">
                <svg
                  className="absolute left-0 top-0 w-[60px] h-[74px] overflow-visible"
                  viewBox="0 0 60 74"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 26 2 C 26 36, 0 34, 0 72"
                    stroke={dashedLineColor}
                    strokeWidth="1.25"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    className="transition-colors duration-500"
                  />
                </svg>
              </div>

              {/* ==============================================================
                  TIMELINE STOPS (EXPERIENCE + EDUCATION + LEADERSHIP + SKILLS)
                  ============================================================== */}
              <div className="relative space-y-12">
                {/* Continuous vertical dashed line connecting timeline stops */}
                <div
                  className="pointer-events-none absolute left-0 top-2 bottom-4 w-[1.5px]"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, ${dashedLineColor} 50%, transparent 50%)`,
                    backgroundSize: "1.5px 6px",
                  }}
                  aria-hidden="true"
                />

                {FLIGHT_PLAN_STOPS.map((stop, index) => (
                  <div key={stop.id} className="relative pl-6 sm:pl-7">
                    {/* Left Metadata (Route / Year) + Bullseye Node on the Timeline */}
                    <div className="flex items-center">
                      {/* Left Route & Year Column */}
                      <div className="absolute -left-[68px] sm:-left-[78px] top-0.5 w-[56px] sm:w-[64px] text-right pr-2 select-none">
                        <div
                          className="text-[8.5px] font-mono uppercase tracking-[0.08em] leading-none transition-colors duration-500"
                          style={{ color: routeMetaColor }}
                        >
                          {stop.route}
                        </div>
                        <div
                          className="text-[13.5px] font-mono tabular-nums tracking-tight mt-0.5 leading-tight transition-colors duration-500"
                          style={{
                            color: yearMetaColor,
                            fontVariantNumeric: "slashed-zero tabular-nums",
                          }}
                        >
                          {stop.year}
                        </div>
                      </div>

                      {/* Circular Bullseye Node on the Vertical Track */}
                      <div
                        className="absolute -left-[6.5px] top-[7px] w-[14px] h-[14px] rounded-full flex items-center justify-center transition-colors duration-500"
                        style={{
                          backgroundColor: pageBgColor,
                          border: `1.5px solid ${
                            index === 0 ? flightPlanBlue : dashedLineColor
                          }`,
                        }}
                      >
                        <span
                          className="w-[5px] h-[5px] rounded-full transition-colors duration-500"
                          style={{
                            backgroundColor:
                              index === 0 ? flightPlanBlue : dashedLineColor,
                          }}
                        />
                      </div>

                      {/* Company SVG Logo + Company Name + CURRENT Tag + Period */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          href={stop.href}
                          className="group inline-flex items-center gap-2.5 focus:outline-none"
                        >
                          <CompanyLogo
                            company={stop.id}
                            variant="badge"
                            className="w-6 h-6 rounded-[5px] shadow-2xs transition-transform duration-200 group-hover:scale-105"
                          />
                          <h2
                            className="text-[18px] font-medium tracking-[-0.015em] transition-colors duration-500 group-hover:underline decoration-1 underline-offset-4"
                            style={{ color: primaryTextColor }}
                          >
                            {stop.company}
                          </h2>
                        </Link>

                        {stop.badge && (
                          <span
                            className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.08em] transition-colors duration-500"
                            style={{ color: flightPlanBlue }}
                          >
                            {stop.badge}
                          </span>
                        )}

                        <span
                          className="text-[12px] font-mono transition-colors duration-500"
                          style={{ color: yearMetaColor }}
                        >
                          {stop.period} &middot; {stop.location}
                        </span>
                      </div>
                    </div>

                    {/* Role Title */}
                    <p
                      className="mt-1 text-[15px] sm:text-[15.5px] font-medium tracking-[-0.01em] transition-colors duration-500"
                      style={{ color: roleSubtitleColor }}
                    >
                      {stop.role}
                    </p>

                    {/* Resume Bullet Highlights */}
                    <div className="mt-2 space-y-2 max-w-[520px]">
                      {stop.highlights.map((bullet, bulletIdx) => (
                        <p
                          key={bulletIdx}
                          className="text-[14px] leading-[1.6] transition-colors duration-500"
                          style={{ color: secondaryTextColor }}
                        >
                          {bullet}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ============================================================
                    EDUCATION STOP (UNIVERSITY OF BRITISH COLUMBIA)
                    ============================================================ */}
                <div className="relative pl-6 sm:pl-7 pt-2">
                  <div className="flex items-center">
                    <div className="absolute -left-[68px] sm:-left-[78px] top-2.5 w-[56px] sm:w-[64px] text-right pr-2 select-none">
                      <div
                        className="text-[8.5px] font-mono uppercase tracking-[0.08em] leading-none transition-colors duration-500"
                        style={{ color: routeMetaColor }}
                      >
                        YVR
                      </div>
                      <div
                        className="text-[12px] font-mono uppercase tracking-tight mt-0.5 leading-tight transition-colors duration-500"
                        style={{ color: yearMetaColor }}
                      >
                        EDU
                      </div>
                    </div>

                    {/* Node */}
                    <div
                      className="absolute -left-[6.5px] top-[15px] w-[14px] h-[14px] rounded-full flex items-center justify-center transition-colors duration-500"
                      style={{
                        backgroundColor: pageBgColor,
                        border: `1.5px solid ${dashedLineColor}`,
                      }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full transition-colors duration-500"
                        style={{ backgroundColor: dashedLineColor }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <CompanyLogo
                        company="ubc"
                        variant="badge"
                        className="w-6 h-6 rounded-[5px] shadow-2xs"
                      />
                      <h2
                        className="text-[17.5px] font-medium tracking-[-0.015em] transition-colors duration-500"
                        style={{ color: primaryTextColor }}
                      >
                        University of British Columbia
                      </h2>
                      <span
                        className="text-[12px] font-mono transition-colors duration-500"
                        style={{ color: yearMetaColor }}
                      >
                        Vancouver, BC
                      </span>
                    </div>
                  </div>

                  <p
                    className="mt-1 text-[15px] font-medium tracking-[-0.01em] transition-colors duration-500"
                    style={{ color: roleSubtitleColor }}
                  >
                    Bachelor of Arts in Visual Art, Bachelor of Arts in Creative
                    Writing
                  </p>
                  <p
                    className="mt-1 text-[13.5px] leading-relaxed transition-colors duration-500"
                    style={{ color: secondaryTextColor }}
                  >
                    With Distinction + Co-Op Excellence Award
                  </p>
                </div>

                {/* ============================================================
                    LEADERSHIP STOP
                    ============================================================ */}
                <div className="relative pl-6 sm:pl-7 pt-2">
                  <div className="flex items-baseline">
                    <div className="absolute -left-[68px] sm:-left-[78px] top-2.5 w-[56px] sm:w-[64px] text-right pr-2 select-none">
                      <div
                        className="text-[8.5px] font-mono uppercase tracking-[0.08em] leading-none transition-colors duration-500"
                        style={{ color: routeMetaColor }}
                      >
                        LEAD
                      </div>
                    </div>

                    <div
                      className="absolute -left-[6.5px] top-[13px] w-[14px] h-[14px] rounded-full flex items-center justify-center transition-colors duration-500"
                      style={{
                        backgroundColor: pageBgColor,
                        border: `1.5px solid ${dashedLineColor}`,
                      }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full transition-colors duration-500"
                        style={{ backgroundColor: dashedLineColor }}
                      />
                    </div>

                    <h2
                      className="text-[17.5px] font-medium tracking-[-0.015em] transition-colors duration-500"
                      style={{ color: primaryTextColor }}
                    >
                      Leadership &amp; Community
                    </h2>
                  </div>

                  <div className="mt-3 space-y-3 max-w-[520px]">
                    {LEADERSHIP_ITEMS.map((item) => (
                      <div key={item.title}>
                        <div
                          className="text-[14.5px] font-medium transition-colors duration-500"
                          style={{ color: roleSubtitleColor }}
                        >
                          {item.title}
                        </div>
                        <p
                          className="text-[13.5px] leading-relaxed mt-0.5 transition-colors duration-500"
                          style={{ color: secondaryTextColor }}
                        >
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================================
                    SKILLS & TOOLS STOP
                    ============================================================ */}
                <div className="relative pl-6 sm:pl-7 pt-2">
                  <div className="flex items-baseline">
                    <div className="absolute -left-[68px] sm:-left-[78px] top-2.5 w-[56px] sm:w-[64px] text-right pr-2 select-none">
                      <div
                        className="text-[8.5px] font-mono uppercase tracking-[0.08em] leading-none transition-colors duration-500"
                        style={{ color: routeMetaColor }}
                      >
                        CRAFT
                      </div>
                    </div>

                    <div
                      className="absolute -left-[6.5px] top-[13px] w-[14px] h-[14px] rounded-full flex items-center justify-center transition-colors duration-500"
                      style={{
                        backgroundColor: pageBgColor,
                        border: `1.5px solid ${dashedLineColor}`,
                      }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full transition-colors duration-500"
                        style={{ backgroundColor: dashedLineColor }}
                      />
                    </div>

                    <h2
                      className="text-[17.5px] font-medium tracking-[-0.015em] transition-colors duration-500"
                      style={{ color: primaryTextColor }}
                    >
                      Skills &amp; Tools
                    </h2>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-[520px]">
                    {SKILLS_AND_TOOLS.map((group) => (
                      <div key={group.category}>
                        <div
                          className="text-[12px] font-mono uppercase tracking-[0.06em] transition-colors duration-500"
                          style={{ color: roleSubtitleColor }}
                        >
                          {group.category}
                        </div>
                        <p
                          className="text-[13.5px] leading-relaxed mt-0.5 transition-colors duration-500"
                          style={{ color: secondaryTextColor }}
                        >
                          {group.items}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
