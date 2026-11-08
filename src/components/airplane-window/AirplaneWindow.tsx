"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

export function mixHex(hex1: string, hex2: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const c1 = hex1.replace("#", "");
  const c2 = hex2.replace("#", "");

  const r1 = parseInt(c1.substring(0, 2), 16);
  const g1 = parseInt(c1.substring(2, 4), 16);
  const b1 = parseInt(c1.substring(4, 6), 16);

  const r2 = parseInt(c2.substring(0, 2), 16);
  const g2 = parseInt(c2.substring(2, 4), 16);
  const b2 = parseInt(c2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const b = Math.round(b1 + (b2 - b1) * clamped);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

interface AirplaneWindowProps {
  /** 0 = fully open (light mode), 1 = fully closed (dark mode) */
  progress: number;
  onChange: (nextProgress: number) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  cloudSpeed?: "calm" | "cruising" | "fast";
  isNightIlluminated?: boolean;
}

const APERTURE_HEIGHT = 242;
const MIN_SHADE_HEIGHT = 34; // Shade lip visible at the top when open
const MAX_SHADE_HEIGHT = 256; // Covers the entire rounded bottom of the aperture when closed
const TRAVEL_DISTANCE = APERTURE_HEIGHT - MIN_SHADE_HEIGHT;

export function AirplaneWindow({
  progress,
  onChange,
  onDragStateChange,
  cloudSpeed = "cruising",
  isNightIlluminated = false,
}: AirplaneWindowProps) {
  const apertureRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartYRef = useRef<number>(0);
  const dragStartProgressRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Smooth spring/ease animation helper for snap or click toggle
  const animateToProgress = useCallback(
    (target: number, durationMs = 340) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      const start = progress;
      const diff = target - start;
      if (Math.abs(diff) < 0.002) {
        onChange(target);
        return;
      }
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / durationMs);
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - t, 3);
        onChange(start + diff * eased);
        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [progress, onChange]
  );

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    setIsDragging(true);
    onDragStateChange?.(true);
    dragStartYRef.current = e.clientY;
    dragStartProgressRef.current = progress;
    hasMovedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartYRef.current;
    if (Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }
    const nextProgress = Math.max(
      0,
      Math.min(1, dragStartProgressRef.current + deltaY / TRAVEL_DISTANCE)
    );
    onChange(nextProgress);
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    onDragStateChange?.(false);

    // If user clicked the handle without dragging, toggle smoothly between open/closed
    if (!hasMovedRef.current) {
      if (progress > 0.85) {
        animateToProgress(0, 460);
      } else if (progress < 0.15) {
        animateToProgress(0.32, 320);
      }
      return;
    }

    // Gentle magnetic snap at the very bottom (>= 90%) or very top (<= 6%)
    if (progress >= 0.9 && progress < 1) {
      animateToProgress(1, 180);
    } else if (progress > 0 && progress <= 0.06) {
      animateToProgress(0, 180);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(Math.min(1, progress + 0.1));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(Math.max(0, progress - 0.1));
    } else if (e.key === "Home") {
      e.preventDefault();
      animateToProgress(0, 350);
    } else if (e.key === "End") {
      e.preventDefault();
      animateToProgress(1, 350);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      animateToProgress(progress > 0.5 ? 0 : 1, 420);
    }
  };

  // Compute dynamic frame colors that darken smoothly as the shade blocks cabin light
  const d = Math.pow(progress, 1.05);
  const nightLift = isNightIlluminated ? 0.06 : 0;
  const effectiveDark = Math.max(0, Math.min(1, d - nightLift));

  const outerBezelTopLeft = mixHex("#CBC3B9", "#252423", effectiveDark);
  const outerBezelMid = mixHex("#E7E1D8", "#2F2E2C", effectiveDark);
  const outerBezelBottomRight = mixHex("#F3EFE9", "#383634", effectiveDark);

  const innerRevealTop = mixHex("#BDB4A9", "#1D1C1B", effectiveDark);
  const innerRevealMid = mixHex("#E5DFD6", "#282725", effectiveDark);
  const innerRevealBottom = mixHex("#FFFFFF", "#3A3937", effectiveDark);

  const shadeTopColor = mixHex("#B7AEA3", "#232120", effectiveDark);
  const shadeMidColor = mixHex("#C8C0B6", "#2A2826", effectiveDark);
  const shadeLipColor = mixHex("#D5CEC4", "#33312E", effectiveDark);
  const shadeGrooveBorder = mixHex("#9E958B", "#1A1918", effectiveDark);

  const shadeHeightPx =
    MIN_SHADE_HEIGHT + progress * (MAX_SHADE_HEIGHT - MIN_SHADE_HEIGHT);

  const durationMultiplier =
    cloudSpeed === "fast" ? 0.45 : cloudSpeed === "calm" ? 1.85 : 1;

  return (
    <div className="relative flex flex-col items-center select-none">

      {/* ====================================================================
          OUTER MOLDED AIRCRAFT CABIN WINDOW BEZEL (3D Capsule)
          ==================================================================== */}
      <div
        className="relative w-[220px] h-[304px] rounded-[110px] p-[18px] transition-shadow duration-200"
        style={{
          background: `linear-gradient(135deg, ${outerBezelTopLeft} 0%, ${outerBezelMid} 48%, ${outerBezelBottomRight} 100%)`,
          boxShadow:
            progress > 0.85
              ? "0 24px 50px -12px rgba(0, 0, 0, 0.65), 0 4px 14px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08), inset 0 -2px 4px rgba(0, 0, 0, 0.45)"
              : `0 22px 44px -12px rgba(65, 52, 40, ${0.19 * (1 - progress * 0.5)}), 0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1.5px 2px rgba(255, 255, 255, ${0.75 * (1 - progress)}), inset 2px 4px 10px rgba(95, 84, 72, ${0.18 * (1 - progress)})`,
          border: `1px solid ${mixHex("#DFD8CE", "#2E2D2B", effectiveDark)}`,
        }}
      >
        {/* Subtle diagonal specular sheen across the bottom-left outer bezel */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[110px] overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -bottom-8 left-4 w-28 h-28 rounded-full blur-md"
            style={{
              background: `linear-gradient(35deg, rgba(255,255,255,${0.55 * (1 - progress * 0.85)}), transparent)`,
              transform: "rotate(-24deg)",
            }}
          />
        </div>

        {/* ==================================================================
            MIDDLE RECESSED INNER REVEAL (Sloped 3D Cabin Molding)
            ================================================================== */}
        <div
          className="relative w-full h-full rounded-[92px] p-[13px]"
          style={{
            background: `linear-gradient(180deg, ${innerRevealTop} 0%, ${innerRevealMid} 46%, ${innerRevealBottom} 100%)`,
            boxShadow: `inset 0 8px 14px rgba(60, 52, 44, ${0.32 * (1 - progress * 0.5)}), inset 0 -6px 12px rgba(255, 255, 255, ${0.9 * (1 - progress * 0.85)}), 0 1px 0 rgba(255, 255, 255, ${0.6 * (1 - progress * 0.85)})`,
            border: `1.5px solid ${mixHex("#B5ACA0", "#1E1D1C", effectiveDark)}`,
          }}
        >
          {/* Specular sill reflection on the lower inner curve */}
          <div
            className="pointer-events-none absolute inset-x-5 bottom-[3px] h-5 rounded-b-[80px] blur-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent 10%, rgba(255,255,255,${0.75 * (1 - progress * 0.88)}) 38%, rgba(255,255,255,${0.95 * (1 - progress * 0.88)}) 50%, transparent 88%)`,
            }}
            aria-hidden="true"
          />

          {/* ================================================================
              INNERMOST WINDOW APERTURE (Sky, Animated Clouds & Draggable Shade)
              ================================================================ */}
          <div
            ref={apertureRef}
            role="slider"
            tabIndex={0}
            aria-label="Airplane window shade"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuetext={`${Math.round(progress * 100)}% closed`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onKeyDown={handleKeyDown}
            className={`relative w-full h-full rounded-[79px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              boxShadow:
                "inset 0 4px 12px rgba(15, 38, 72, 0.35), 0 1px 2px rgba(255, 255, 255, 0.5)",
              touchAction: "none",
            }}
          >
            {/* 1 + 2. SKY & PROCEDURAL VOLUMETRIC CLOUD SEA */}
            <CloudScene durationMultiplier={durationMultiplier} />
            {/* 3. INNER WINDOW PANE GLASS GLARE & DEPTH SHADOW */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[79px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 38%, rgba(255,255,255,0) 60%)",
                boxShadow:
                  "inset 0 6px 14px rgba(12, 32, 62, 0.25), inset 0 -3px 8px rgba(255, 255, 255, 0.55)",
              }}
              aria-hidden="true"
            />

            {/* ==============================================================
                4. INTERACTIVE PULL-DOWN AIRPLANE SHADE (THE SHADER)
                ============================================================== */}
            <div
              className="absolute inset-x-0 top-0 z-10 flex flex-col justify-end"
              style={{
                height: `${shadeHeightPx}px`,
                background: `linear-gradient(180deg, ${shadeTopColor} 0%, ${shadeMidColor} 78%, ${shadeLipColor} 100%)`,
                borderBottomLeftRadius: "50% 13px",
                borderBottomRightRadius: "50% 13px",
                boxShadow:
                  progress >= 0.99
                    ? "inset 0 10px 22px rgba(0, 0, 0, 0.45), inset 6px 0 12px rgba(0,0,0,0.25), inset -6px 0 12px rgba(0,0,0,0.25)"
                    : `0 10px 20px -2px rgba(15, 23, 34, ${0.32 + progress * 0.25}), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 10px 18px rgba(0, 0, 0, 0.22), inset 7px 0 12px rgba(0, 0, 0, 0.12), inset -7px 0 12px rgba(0, 0, 0, 0.12)`,
                borderBottom: `1.5px solid ${shadeGrooveBorder}`,
              }}
            >
              {/* Subtle horizontal matte-plastic micro-texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)",
                }}
                aria-hidden="true"
              />

              {/* Contoured Lower Shade Lip & Recessed Finger-Pull Handle */}
              <div className="relative w-full pb-[7px] pt-2 flex flex-col items-center justify-end">
                {/* Upper contour crease above the handle */}
                <div
                  className="w-[84%] h-[1px] mb-1.5 rounded-full opacity-45"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,0,0,0.28), transparent)",
                  }}
                />

                {/* Recessed Pill Handle Groove */}
                <div
                  className="relative w-[64px] h-[6px] rounded-full"
                  style={{
                    background: `linear-gradient(180deg, ${mixHex("#9A9187", "#191817", effectiveDark)} 0%, ${mixHex("#CFC7BD", "#353330", effectiveDark)} 100%)`,
                    boxShadow:
                      "inset 0 1.5px 2.5px rgba(0, 0, 0, 0.42), 0 1px 0 rgba(255, 255, 255, 0.38)",
                  }}
                />
              </div>
            </div>

            {/* Innermost perimeter gasket shadow so the shade slides inside the track */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[79px] z-20"
              style={{
                boxShadow: `inset 0 3px 7px rgba(0, 0, 0, ${0.28 + progress * 0.25}), inset 0 0 0 1px rgba(0, 0, 0, 0.14)`,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PROCEDURAL CLOUDS
   Each layer is a seamless SVG tile: fractal noise is added to a vertical
   density gradient (SourceGraphic), thresholded into billowy alpha, then lit
   with a distant light from above so the puffs get sunlit crowns and soft
   blue-grey undersides. Two identical tiles sit side-by-side and translate
   -50% for an endless drift; layers move at different speeds for parallax.
   ========================================================================== */

interface CloudLayerProps {
  id: string;
  width: number;
  height: number;
  top: string;
  baseFrequency: string;
  octaves: number;
  seed: number;
  surfaceScale: number;
  /** Vertical density ramp: [offset, gray 0..1] — higher gray = denser clouds */
  density: [number, number][];
  /** alpha = slope * density + intercept (applied before clamping) */
  slope: number;
  intercept: number;
  duration: number;
  shadowTint: [number, number, number];
  blur?: number;
  opacity?: number;
}

function CloudLayer({
  id,
  width,
  height,
  top,
  baseFrequency,
  octaves,
  seed,
  surfaceScale,
  density,
  slope,
  intercept,
  duration,
  shadowTint,
  blur = 0.6,
  opacity = 1,
}: CloudLayerProps) {
  const [sr, sg, sb] = shadowTint;
  // Lit value L in [0,1] → color = shadow + (1 - shadow) * L
  const tintMatrix = `${1 - sr} 0 0 0 ${sr}  0 ${1 - sg} 0 0 ${sg}  0 0 ${1 - sb} 0 ${sb}  0 0 0 1 0`;

  return (
    <div
      className="absolute left-0 flex pointer-events-none"
      style={{
        top,
        width: width * 2,
        height,
        opacity,
        animation: `airplaneCloudDrift ${duration}s linear infinite`,
        willChange: "transform",
        // Feather the layer's top & bottom so no tile boundary ever reads as a hard line
        maskImage:
          "linear-gradient(to bottom, transparent 0%, #000 30%, #000 85%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, #000 30%, #000 85%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      {[0, 1].map((i) => (
        <svg
          key={i}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block shrink-0"
        >
          {i === 0 && (
            <defs>
              <linearGradient id={`${id}-density`} x1="0" y1="0" x2="0" y2="1">
                {density.map(([offset, gray]) => {
                  const v = Math.round(gray * 255);
                  return (
                    <stop key={offset} offset={offset} stopColor={`rgb(${v},${v},${v})`} />
                  );
                })}
              </linearGradient>
              <filter
                id={id}
                filterUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={width}
                height={height}
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency={baseFrequency}
                  numOctaves={octaves}
                  seed={seed}
                  stitchTiles="stitch"
                  result="noise"
                />
                {/* density = noise + gradient - 1 */}
                <feComposite
                  in="noise"
                  in2="SourceGraphic"
                  operator="arithmetic"
                  k1="0"
                  k2="1"
                  k3="1"
                  k4="-1"
                  result="density"
                />
                {/* Threshold density into billowy cloud alpha */}
                <feColorMatrix
                  in="density"
                  type="matrix"
                  values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${slope} 0 0 0 ${intercept}`}
                  result="alphaRaw"
                />
                <feGaussianBlur in="alphaRaw" stdDeviation={blur} result="cloudAlpha" />
                {/* Heavily smoothed height-field so lighting reads as rounded puffs, not crinkles */}
                <feGaussianBlur in="alphaRaw" stdDeviation={blur * 4} result="heightField" />
                {/* Volumetric lighting from the sun above */}
                <feDiffuseLighting
                  in="heightField"
                  surfaceScale={surfaceScale}
                  diffuseConstant="1.15"
                  lightingColor="#ffffff"
                  result="lit"
                >
                  <feDistantLight azimuth="250" elevation="38" />
                </feDiffuseLighting>
                <feColorMatrix in="lit" type="matrix" values={tintMatrix} result="tinted" />
                <feComposite in="tinted" in2="cloudAlpha" operator="in" />
              </filter>
            </defs>
          )}
          <rect width={width} height={height} fill={`url(#${id}-density)`} filter={`url(#${id})`} />
        </svg>
      ))}
    </div>
  );
}

function CloudScene({ durationMultiplier }: { durationMultiplier: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* High-altitude sky: deep cobalt overhead fading to pale haze at the horizon */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #2F7FE0 0%, #4E97EC 16%, #7DB4F3 30%, #B3D3F7 40%, #DCEAF8 45%, #D6E3F0 54%, #A9BCD2 100%)",
        }}
      />

      {/* Faint high cirrus wisps */}
      <CloudLayer
        id="awin-cirrus"
        width={520}
        height={90}
        top="6%"
        baseFrequency="0.006 0.06"
        octaves={4}
        seed={21}
        surfaceScale={1}
        density={[
          [0, 0.35],
          [0.5, 0.55],
          [1, 0.35],
        ]}
        slope={2.2}
        intercept={-0.05}
        duration={120 * durationMultiplier}
        shadowTint={[0.86, 0.91, 0.98]}
        blur={1.4}
        opacity={0.45}
      />

      {/* Distant cloud deck — flattened by perspective, sits on the horizon */}
      <CloudLayer
        id="awin-far"
        width={520}
        height={110}
        top="35%"
        baseFrequency="0.022 0.08"
        octaves={4}
        seed={7}
        surfaceScale={3}
        density={[
          [0, 0.1],
          [0.3, 0.5],
          [0.6, 0.75],
          [1, 0.9],
        ]}
        slope={4.5}
        intercept={0.2}
        duration={70 * durationMultiplier}
        shadowTint={[0.7, 0.77, 0.87]}
        blur={0.45}
      />

      {/* Mid cumulus field */}
      <CloudLayer
        id="awin-mid"
        width={520}
        height={140}
        top="47%"
        baseFrequency="0.014 0.036"
        octaves={4}
        seed={13}
        surfaceScale={6}
        density={[
          [0, 0.3],
          [0.25, 0.55],
          [0.65, 0.72],
          [1, 0.85],
        ]}
        slope={4.5}
        intercept={0}
        duration={42 * durationMultiplier}
        shadowTint={[0.62, 0.7, 0.82]}
        blur={0.7}
      />

      {/* Near billowing cumulus — biggest puffs, strongest shading */}
      <CloudLayer
        id="awin-near"
        width={520}
        height={150}
        top="60%"
        baseFrequency="0.009 0.022"
        octaves={4}
        seed={3}
        surfaceScale={10}
        density={[
          [0, 0.3],
          [0.3, 0.58],
          [1, 0.85],
        ]}
        slope={4.2}
        intercept={0.05}
        duration={26 * durationMultiplier}
        shadowTint={[0.56, 0.64, 0.77]}
        blur={0.9}
      />

      {/* Depth falloff: lower edge sits in the cloud's own shadow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 70%, rgba(110, 132, 160, 0.22) 100%), radial-gradient(120% 60% at 20% 45%, rgba(255,250,240,0.28) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
