"use client";

import React, { memo, useEffect, useState } from "react";

export type FloatColor = "pink" | "yellow" | "green" | "blue";

export type FloatVariant =
  | { kind: "duck"; color: FloatColor; mallard?: boolean }
  | { kind: "fish"; color: FloatColor }
  | { kind: "person"; color: FloatColor };

export type DuckVisualStyle = "rubber" | "classic";

const PERSON_COLORS: Record<
  FloatColor,
  {
    ring: string;
    ringLight: string;
    ringDark: string;
    skin: string;
    hair: string;
    swimsuit: string;
  }
> = {
  pink: {
    ring: "#C49AAB",
    ringLight: "#D4B4C0",
    ringDark: "#A8808E",
    skin: "#D8C4A0",
    hair: "#4A3A30",
    swimsuit: "#A85868",
  },
  yellow: {
    ring: "#C4B470",
    ringLight: "#D0C490",
    ringDark: "#A89850",
    skin: "#D4BC98",
    hair: "#302418",
    swimsuit: "#988040",
  },
  green: {
    ring: "#7AAA8A",
    ringLight: "#94BCA0",
    ringDark: "#5C8E70",
    skin: "#D8C4A0",
    hair: "#5A3428",
    swimsuit: "#4A7858",
  },
  blue: {
    ring: "#7AA0B0",
    ringLight: "#90B4C0",
    ringDark: "#5C8498",
    skin: "#D4BC98",
    hair: "#1A1A28",
    swimsuit: "#486878",
  },
};

function PersonTubeG({ color }: { color: FloatColor }) {
  const c = PERSON_COLORS[color];
  return (
    <g>
      <circle cx="24" cy="24" r="21" fill={c.ring} />
      <path
        d="M24 3 A21 21 0 0 1 45 24"
        fill="none"
        stroke={c.ringLight}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M24 45 A21 21 0 0 1 3 24"
        fill="none"
        stroke={c.ringLight}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.25"
      />
      <circle
        cx="24"
        cy="24"
        r="21"
        fill="none"
        stroke={c.ringDark}
        strokeWidth="0.8"
        opacity="0.5"
      />
      <circle
        cx="24"
        cy="24"
        r="12"
        fill="none"
        stroke={c.ringDark}
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M11 16 Q16 8, 24 6 Q32 8, 37 16"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.18"
      />
      <circle cx="24" cy="24" r="12" fill="#1e4d6b" opacity="0.15" />
      <path
        d="M22 28 Q21 32, 20 35"
        stroke={c.skin}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M26 28 Q27 32, 28 35"
        stroke={c.skin}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
      <ellipse cx="24" cy="25" rx="5.5" ry="6" fill={c.swimsuit} />
      <path
        d="M18.5 23 Q14 20, 9 22"
        stroke={c.skin}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M29.5 23 Q34 20, 39 22"
        stroke={c.skin}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="8.5" cy="22.5" r="1.5" fill={c.skin} />
      <circle cx="39.5" cy="22.5" r="1.5" fill={c.skin} />
      <circle cx="24" cy="18" r="5.5" fill={c.skin} />
      <ellipse cx="24" cy="16.5" rx="6" ry="4.5" fill={c.hair} />
      <path
        d="M20 14.5 Q24 12, 28 14.5"
        fill="none"
        stroke={c.hair}
        strokeWidth="1.5"
        opacity="0.3"
      />
      <path
        d="M7 30 Q12 38, 24 41 Q36 38, 41 30"
        fill={c.ring}
        stroke={c.ringDark}
        strokeWidth="0.6"
        opacity="0.45"
      />
      <path
        d="M13 33 Q18 38, 24 39 Q30 38, 35 33"
        fill="none"
        stroke={c.ringLight}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.2"
      />
    </g>
  );
}

function FishG({ burst = false }: { burst?: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="fish-body-grad" cx="0.45" cy="0.4" r="0.55">
          <stop offset="0%" stopColor="#F4A460" />
          <stop offset="60%" stopColor="#E8913A" />
          <stop offset="100%" stopColor="#D07828" />
        </radialGradient>
        <filter id="fish-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <ellipse
        cx="24"
        cy="24"
        rx="3.5"
        ry="5"
        fill="#1a4a65"
        opacity="0.06"
        filter="url(#fish-shadow)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="4.5"
        ry="6.5"
        fill="none"
        stroke="#1a4a65"
        strokeWidth="0.3"
        opacity="0.05"
      />
      <path
        d={burst ? "M24 31 L19 36 L29 36 Z" : "M24 31 L21 35 L27 35 Z"}
        fill="#D07828"
        opacity="0.85"
      />
      <ellipse cx="24" cy="24" rx="4" ry="8" fill="url(#fish-body-grad)" />
      <ellipse cx="23.5" cy="23" rx="1.8" ry="4" fill="white" opacity="0.2" />
      <path
        d="M24 18 Q21 24, 24 30"
        fill="none"
        stroke="#C06820"
        strokeWidth="0.6"
        opacity="0.3"
      />
      <circle cx="22.5" cy="19" r="1.2" fill="#2A2520" />
      <circle cx="22.2" cy="18.7" r="0.4" fill="white" opacity="0.7" />
      <ellipse
        cx="24"
        cy="24"
        rx="4"
        ry="8"
        fill="none"
        stroke="#B06818"
        strokeWidth="0.3"
        opacity="0.2"
      />
      <ellipse cx="23" cy="22" rx="1" ry="2" fill="white" opacity="0.1" />
    </g>
  );
}

function PaddlingFeetG() {
  const [footSide, setFootSide] = useState(() => +(Math.random() > 0.5));
  useEffect(() => {
    const id = setInterval(() => setFootSide((prev) => +(prev === 0)), 250);
    return () => clearInterval(id);
  }, []);
  const x = footSide === 0 ? 21.5 : 26;
  return (
    <g opacity="0.35">
      <line
        x1={x + 0.5}
        y1="33"
        x2={x + 0.5}
        y2="36"
        stroke="#E8A030"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <g transform={`translate(${x}, 35.5)`}>
        <path
          d="M-0.8 0 L-1.5 2 L-0.3 1.5 L0.5 2.5 L1.3 1.5 L2.5 2 L1.8 0Z"
          fill="#E8A030"
        />
        <path
          d="M-0.8 0 L-1.5 2 L-0.3 1.5 L0.5 2.5 L1.3 1.5 L2.5 2 L1.8 0Z"
          fill="none"
          stroke="#C07820"
          strokeWidth="0.2"
          opacity="0.5"
        />
      </g>
    </g>
  );
}

/* ============================================================================
 * 1. EXACT BAOTHIENTO.COM DUCK (White Pekin + Mallard)
 * ============================================================================ */

function ClassicTail({ mallard = false }: { mallard?: boolean }) {
  return (
    <g>
      <path
        d="M22 34 Q24 38, 26 34"
        fill={mallard ? "#6A6258" : "#E0D8CC"}
      />
      <path
        d="M23 34 Q24 36.5, 25 34"
        fill={mallard ? "#7A7268" : "#E8E2D8"}
      />
    </g>
  );
}

function ClassicBody({ mallard = false }: { mallard?: boolean }) {
  return (
    <g>
      <ellipse
        cx="24"
        cy="26"
        rx="7"
        ry="8.5"
        fill={mallard ? "url(#mallard-body-grad)" : "url(#body-grad)"}
      />
      <path
        d="M17.5 28 Q20 34, 24 35 Q28 34, 30.5 28"
        fill={mallard ? "#5A5450" : "#C8C0B0"}
        opacity="0.35"
      />
      <path
        d="M17.2 22 Q16.8 27, 17.8 32"
        fill="none"
        stroke={mallard ? "#605850" : "#C4BAA8"}
        strokeWidth="2"
        opacity="0.12"
      />
      <path
        d="M30.8 22 Q31.2 27, 30.2 32"
        fill="none"
        stroke={mallard ? "#605850" : "#C4BAA8"}
        strokeWidth="2"
        opacity="0.12"
      />
      <ellipse
        cx="23"
        cy="23"
        rx="2.5"
        ry="3"
        fill="white"
        opacity={mallard ? 0.12 : 0.2}
      />
      <path
        d="M30 22 Q31 26, 30 30"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.08"
      />
      <ellipse
        cx="24"
        cy="26"
        rx="7"
        ry="8.5"
        fill="none"
        stroke={mallard ? "#6A6258" : "#B8B0A0"}
        strokeWidth="0.35"
        opacity="0.18"
      />
    </g>
  );
}

function ClassicWings({ mallard = false }: { mallard?: boolean }) {
  const fillMain = mallard ? "#7A7268" : "#E8E2D8";
  const fillShadow = mallard ? "#5A5248" : "#C4BAA8";
  const stroke1 = mallard ? "#6A6258" : "#CCC4B4";
  const stroke2 = mallard ? "#7A7268" : "#D4CCC0";
  const strokeOutline = mallard ? "#5A5248" : "#B8B0A0";
  return (
    <g>
      <path
        d="M17.5 22 Q16 26.5, 17.5 32 Q19.5 27.5, 17.5 22Z"
        fill={fillShadow}
        opacity="0.15"
      />
      <path
        d="M17 21 Q15.5 26.5, 17 32.5 Q19.5 27, 17 21Z"
        fill={fillMain}
      />
      <path
        d="M17.2 21.5 Q19 21, 19.2 22"
        fill="none"
        stroke="white"
        strokeWidth="0.4"
        opacity="0.15"
      />
      <path
        d="M17.8 23 Q17 26.5, 17.8 30"
        fill="none"
        stroke={stroke1}
        strokeWidth="0.4"
        opacity="0.3"
      />
      <path
        d="M18.3 24 Q17.5 27, 18.3 29"
        fill="none"
        stroke={stroke2}
        strokeWidth="0.3"
        opacity="0.22"
      />
      <path
        d="M17 21 Q15.5 26.5, 17 32.5"
        fill="none"
        stroke={strokeOutline}
        strokeWidth="0.35"
        opacity="0.25"
      />
      <path
        d="M30.5 22 Q32 26.5, 30.5 32 Q28.5 27.5, 30.5 22Z"
        fill={fillShadow}
        opacity="0.15"
      />
      <path
        d="M31 21 Q32.5 26.5, 31 32.5 Q28.5 27, 31 21Z"
        fill={fillMain}
      />
      <path
        d="M30.8 21.5 Q29 21, 28.8 22"
        fill="none"
        stroke="white"
        strokeWidth="0.4"
        opacity="0.15"
      />
      <path
        d="M30.2 23 Q31 26.5, 30.2 30"
        fill="none"
        stroke={stroke1}
        strokeWidth="0.4"
        opacity="0.3"
      />
      <path
        d="M29.7 24 Q30.5 27, 29.7 29"
        fill="none"
        stroke={stroke2}
        strokeWidth="0.3"
        opacity="0.22"
      />
      <path
        d="M31 21 Q32.5 26.5, 31 32.5"
        fill="none"
        stroke={strokeOutline}
        strokeWidth="0.35"
        opacity="0.25"
      />
    </g>
  );
}

function ClassicHead({ mallard = false }: { mallard?: boolean }) {
  return (
    <g>
      <ellipse
        cx="24"
        cy="19.5"
        rx="3"
        ry="1.2"
        fill={mallard ? "#0F4028" : "#C4BAA8"}
        opacity="0.2"
      />
      <ellipse
        cx="24"
        cy="18.5"
        rx="2.3"
        ry="1.5"
        fill={mallard ? "#E8E4DC" : "#EDE8E0"}
      />
      <ellipse
        cx="24"
        cy="17.5"
        rx="2.8"
        ry="0.8"
        fill={mallard ? "#0A3020" : "#C8C0B2"}
        opacity="0.15"
      />
      <circle
        cx="24"
        cy="15.2"
        r="3.2"
        fill={mallard ? "url(#mallard-head-grad)" : "url(#head-grad)"}
      />
      <circle
        cx="23"
        cy="14"
        r="1.2"
        fill={mallard ? "#4AE88A" : "white"}
        opacity={mallard ? 0.2 : 0.25}
      />
      <path
        d="M21 13.5 Q20.7 15.2, 21.3 16.5"
        fill="none"
        stroke={mallard ? "#0A3020" : "#C8C0B2"}
        strokeWidth="0.8"
        opacity="0.2"
      />
      <path
        d="M27 13.5 Q27.3 15.2, 26.7 16.5"
        fill="none"
        stroke={mallard ? "#0A3020" : "#C8C0B2"}
        strokeWidth="0.8"
        opacity="0.2"
      />
      <circle
        cx="24"
        cy="15.2"
        r="3.2"
        fill="none"
        stroke={mallard ? "#0A3020" : "#B8B0A2"}
        strokeWidth="0.3"
        opacity="0.2"
      />
      <circle cx="21.3" cy="15" r="0.6" fill="#1a1a1a" />
      <circle cx="26.7" cy="15" r="0.6" fill="#1a1a1a" />
      <circle cx="21.5" cy="14.8" r="0.2" fill="white" opacity="0.6" />
      <circle cx="26.9" cy="14.8" r="0.2" fill="white" opacity="0.6" />
    </g>
  );
}

function ClassicBeak({ mallard = false }: { mallard?: boolean }) {
  const accent = mallard ? "#806818" : "#B07020";
  return (
    <g>
      <path
        d="M21 13.2 Q24 14, 27 13.2"
        fill={mallard ? "#0A3020" : "#C4BAA8"}
        opacity="0.15"
      />
      <path
        d="M20.8 13.5 Q20.2 11.5, 21.5 10 Q24 8.5, 26.5 10 Q27.8 11.5, 27.2 13.5"
        fill={mallard ? "url(#mallard-beak-grad)" : "url(#beak-grad)"}
      />
      <path
        d="M22.5 10.5 Q24 9.5, 25.5 10.5"
        fill="white"
        opacity="0.15"
      />
      <path
        d="M20.8 13.5 Q20.2 11.5, 21.5 10 Q24 8.5, 26.5 10 Q27.8 11.5, 27.2 13.5"
        fill="none"
        stroke={accent}
        strokeWidth="0.35"
        opacity="0.35"
      />
      <ellipse cx="23" cy="11" rx="0.4" ry="0.2" fill={accent} opacity="0.3" />
      <ellipse cx="25" cy="11" rx="0.4" ry="0.2" fill={accent} opacity="0.3" />
      <path d="M23 9.8 Q24 8.9, 25 9.8" fill={accent} opacity="0.25" />
    </g>
  );
}

export function ClassicDuckG({
  paddling = false,
  mallard = false,
}: {
  paddling?: boolean;
  mallard?: boolean;
}) {
  return (
    <g>
      <defs>
        <filter id="duck-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
        <radialGradient id="body-grad" cx="0.48" cy="0.38" r="0.55">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="60%" stopColor="#F0EBE3" />
          <stop offset="100%" stopColor="#DDD6CA" />
        </radialGradient>
        <radialGradient id="mallard-body-grad" cx="0.48" cy="0.38" r="0.55">
          <stop offset="0%" stopColor="#A8A098" />
          <stop offset="60%" stopColor="#8E8680" />
          <stop offset="100%" stopColor="#726B64" />
        </radialGradient>
        <radialGradient id="head-grad" cx="0.46" cy="0.38" r="0.55">
          <stop offset="0%" stopColor="white" />
          <stop offset="50%" stopColor="#F5F1EB" />
          <stop offset="100%" stopColor="#E4DED4" />
        </radialGradient>
        <radialGradient id="mallard-head-grad" cx="0.46" cy="0.38" r="0.55">
          <stop offset="0%" stopColor="#2D6B4A" />
          <stop offset="50%" stopColor="#1B5E3A" />
          <stop offset="100%" stopColor="#0F4028" />
        </radialGradient>
        <linearGradient id="beak-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#F0B848" />
          <stop offset="100%" stopColor="#D89028" />
        </linearGradient>
        <linearGradient id="mallard-beak-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#C8A830" />
          <stop offset="100%" stopColor="#A08020" />
        </linearGradient>
      </defs>
      <ellipse
        cx="24"
        cy="27"
        rx="10"
        ry="7.5"
        fill="none"
        stroke="#1a4a65"
        strokeWidth="0.4"
        opacity="0.06"
      />
      <ellipse
        cx="24"
        cy="27"
        rx="11.5"
        ry="8.5"
        fill="none"
        stroke="#1a4a65"
        strokeWidth="0.25"
        opacity="0.04"
      />
      <ellipse
        cx="24.5"
        cy="28"
        rx="7.5"
        ry="6"
        fill="#1a4a65"
        opacity="0.08"
        filter="url(#duck-shadow)"
      />
      {paddling && <PaddlingFeetG />}
      <ClassicTail mallard={mallard} />
      <ClassicBody mallard={mallard} />
      <ClassicWings mallard={mallard} />
      <ClassicHead mallard={mallard} />
      <ClassicBeak mallard={mallard} />
      <ellipse cx="22" cy="22" rx="4" ry="5" fill="white" opacity="0.06" />
    </g>
  );
}

/* ============================================================================
 * 2. YELLOW RUBBER DUCK (Glossy Sunny Yellow Rubber Ducky)
 * ============================================================================ */

function RubberDuckTail() {
  return (
    <g>
      <path d="M22 34 Q24 38, 26 34" fill="#E5A800" />
      <path d="M23 34 Q24 36.5, 25 34" fill="#FFCC1A" />
    </g>
  );
}

function RubberDuckBody() {
  return (
    <g>
      <ellipse cx="24" cy="26" rx="7" ry="8.5" fill="url(#rubber-body-grad)" />
      {/* Warm golden rear contour */}
      <path
        d="M17.5 28 Q20 34, 24 35 Q28 34, 30.5 28"
        fill="#CC8E00"
        opacity="0.32"
      />
      <path
        d="M17.2 22 Q16.8 27, 17.8 32"
        fill="none"
        stroke="#C78A00"
        strokeWidth="2"
        opacity="0.16"
      />
      <path
        d="M30.8 22 Q31.2 27, 30.2 32"
        fill="none"
        stroke="#C78A00"
        strokeWidth="2"
        opacity="0.16"
      />
      {/* Glossy rubber vinyl sheen on back */}
      <ellipse cx="22.8" cy="22.8" rx="2.6" ry="3.2" fill="#FFFBE0" opacity="0.38" />
      <ellipse cx="22.3" cy="22.0" rx="1.2" ry="1.6" fill="white" opacity="0.32" />
      <path
        d="M30 22 Q31 26, 30 30"
        fill="none"
        stroke="#FFF7B8"
        strokeWidth="0.55"
        opacity="0.22"
      />
      <ellipse
        cx="24"
        cy="26"
        rx="7"
        ry="8.5"
        fill="none"
        stroke="#B87D00"
        strokeWidth="0.4"
        opacity="0.28"
      />
    </g>
  );
}

function RubberDuckWings() {
  const fillMain = "#F8C200";
  const fillShadow = "#C48600";
  const stroke1 = "#D99600";
  const stroke2 = "#E5A500";
  const strokeOutline = "#B57900";
  return (
    <g>
      {/* Left molded rubber wing */}
      <path
        d="M17.5 22 Q16 26.5, 17.5 32 Q19.5 27.5, 17.5 22Z"
        fill={fillShadow}
        opacity="0.22"
      />
      <path
        d="M17 21 Q15.5 26.5, 17 32.5 Q19.5 27, 17 21Z"
        fill={fillMain}
      />
      <path
        d="M17.2 21.5 Q19 21, 19.2 22"
        fill="none"
        stroke="#FFF8C2"
        strokeWidth="0.45"
        opacity="0.38"
      />
      <path
        d="M17.8 23 Q17 26.5, 17.8 30"
        fill="none"
        stroke={stroke1}
        strokeWidth="0.4"
        opacity="0.35"
      />
      <path
        d="M18.3 24 Q17.5 27, 18.3 29"
        fill="none"
        stroke={stroke2}
        strokeWidth="0.3"
        opacity="0.26"
      />
      <path
        d="M17 21 Q15.5 26.5, 17 32.5"
        fill="none"
        stroke={strokeOutline}
        strokeWidth="0.35"
        opacity="0.32"
      />
      {/* Right molded rubber wing */}
      <path
        d="M30.5 22 Q32 26.5, 30.5 32 Q28.5 27.5, 30.5 22Z"
        fill={fillShadow}
        opacity="0.22"
      />
      <path
        d="M31 21 Q32.5 26.5, 31 32.5 Q28.5 27, 31 21Z"
        fill={fillMain}
      />
      <path
        d="M30.8 21.5 Q29 21, 28.8 22"
        fill="none"
        stroke="#FFF8C2"
        strokeWidth="0.45"
        opacity="0.38"
      />
      <path
        d="M30.2 23 Q31 26.5, 30.2 30"
        fill="none"
        stroke={stroke1}
        strokeWidth="0.4"
        opacity="0.35"
      />
      <path
        d="M29.7 24 Q30.5 27, 29.7 29"
        fill="none"
        stroke={stroke2}
        strokeWidth="0.3"
        opacity="0.26"
      />
      <path
        d="M31 21 Q32.5 26.5, 31 32.5"
        fill="none"
        stroke={strokeOutline}
        strokeWidth="0.35"
        opacity="0.32"
      />
    </g>
  );
}

function RubberDuckHead() {
  return (
    <g>
      {/* Molded neck seam */}
      <ellipse
        cx="24"
        cy="19.5"
        rx="3"
        ry="1.2"
        fill="#B87A00"
        opacity="0.24"
      />
      <ellipse cx="24" cy="18.5" rx="2.3" ry="1.5" fill="#F2B800" />
      <ellipse
        cx="24"
        cy="17.5"
        rx="2.8"
        ry="0.8"
        fill="#BA7C00"
        opacity="0.18"
      />
      {/* Round rubber duck head */}
      <circle cx="24" cy="15.2" r="3.35" fill="url(#rubber-head-grad)" />
      {/* Glossy crown highlight */}
      <circle cx="22.9" cy="13.9" r="1.25" fill="#FFFDF0" opacity="0.45" />
      <circle cx="22.6" cy="13.6" r="0.6" fill="white" opacity="0.4" />
      <path
        d="M21 13.5 Q20.7 15.2, 21.3 16.5"
        fill="none"
        stroke="#C48400"
        strokeWidth="0.8"
        opacity="0.22"
      />
      <path
        d="M27 13.5 Q27.3 15.2, 26.7 16.5"
        fill="none"
        stroke="#C48400"
        strokeWidth="0.8"
        opacity="0.22"
      />
      <circle
        cx="24"
        cy="15.2"
        r="3.35"
        fill="none"
        stroke="#B57900"
        strokeWidth="0.3"
        opacity="0.28"
      />
      {/* Expressive dark eyes + glints */}
      <circle cx="21.25" cy="15" r="0.65" fill="#1E1915" />
      <circle cx="26.75" cy="15" r="0.65" fill="#1E1915" />
      <circle cx="21.45" cy="14.78" r="0.22" fill="white" opacity="0.75" />
      <circle cx="26.95" cy="14.78" r="0.22" fill="white" opacity="0.75" />
    </g>
  );
}

function RubberDuckBeak() {
  const accent = "#993600";
  return (
    <g>
      <path
        d="M21 13.2 Q24 14, 27 13.2"
        fill="#B55B00"
        opacity="0.22"
      />
      <path
        d="M20.8 13.5 Q20.2 11.5, 21.5 10 Q24 8.5, 26.5 10 Q27.8 11.5, 27.2 13.5"
        fill="url(#rubber-beak-grad)"
      />
      <path
        d="M22.5 10.5 Q24 9.5, 25.5 10.5"
        fill="white"
        opacity="0.24"
      />
      <path
        d="M20.8 13.5 Q20.2 11.5, 21.5 10 Q24 8.5, 26.5 10 Q27.8 11.5, 27.2 13.5"
        fill="none"
        stroke={accent}
        strokeWidth="0.38"
        opacity="0.4"
      />
      <ellipse cx="23" cy="11" rx="0.38" ry="0.2" fill={accent} opacity="0.32" />
      <ellipse cx="25" cy="11" rx="0.38" ry="0.2" fill={accent} opacity="0.32" />
      <path d="M23 9.8 Q24 8.9, 25 9.8" fill={accent} opacity="0.28" />
    </g>
  );
}

export function YellowRubberDuckG({ paddling = false }: { paddling?: boolean }) {
  return (
    <g>
      <defs>
        <filter
          id="rubber-duck-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
        <radialGradient id="rubber-body-grad" cx="0.46" cy="0.36" r="0.56">
          <stop offset="0%" stopColor="#FFEE55" />
          <stop offset="55%" stopColor="#FFD41A" />
          <stop offset="100%" stopColor="#E0A200" />
        </radialGradient>
        <radialGradient id="rubber-head-grad" cx="0.45" cy="0.36" r="0.56">
          <stop offset="0%" stopColor="#FFF478" />
          <stop offset="50%" stopColor="#FFDA22" />
          <stop offset="100%" stopColor="#E3A500" />
        </radialGradient>
        <linearGradient id="rubber-beak-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FF8820" />
          <stop offset="100%" stopColor="#DF5200" />
        </linearGradient>
      </defs>
      <ellipse
        cx="24"
        cy="27"
        rx="10"
        ry="7.5"
        fill="none"
        stroke="#1a4a65"
        strokeWidth="0.4"
        opacity="0.06"
      />
      <ellipse
        cx="24"
        cy="27"
        rx="11.5"
        ry="8.5"
        fill="none"
        stroke="#1a4a65"
        strokeWidth="0.25"
        opacity="0.04"
      />
      <ellipse
        cx="24.5"
        cy="28"
        rx="7.5"
        ry="6"
        fill="#1a4a65"
        opacity="0.09"
        filter="url(#rubber-duck-shadow)"
      />
      {paddling && <PaddlingFeetG />}
      <RubberDuckTail />
      <RubberDuckBody />
      <RubberDuckWings />
      <RubberDuckHead />
      <RubberDuckBeak />
      <ellipse cx="22" cy="22" rx="4" ry="5" fill="white" opacity="0.09" />
    </g>
  );
}

export const FloatSprite = memo(function FloatSprite({
  variant,
  size = 48,
  paddling = false,
  eating = false,
  burst = false,
  duckStyle = "rubber",
}: {
  variant: FloatVariant;
  size?: number;
  paddling?: boolean;
  eating?: boolean;
  burst?: boolean;
  duckStyle?: DuckVisualStyle;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={eating ? { overflow: "visible" } : undefined}
    >
      {variant.kind === "person" ? (
        <PersonTubeG color={variant.color} />
      ) : variant.kind === "fish" ? (
        <FishG burst={burst} />
      ) : duckStyle === "classic" ? (
        <ClassicDuckG paddling={paddling} mallard={variant.mallard} />
      ) : (
        <YellowRubberDuckG paddling={paddling} />
      )}
    </svg>
  );
});
