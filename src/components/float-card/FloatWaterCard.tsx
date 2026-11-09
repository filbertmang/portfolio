"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Droplets,
  Paintbrush,
  Waves,
  CreditCard,
  Sliders,
  Eye,
  Infinity as InfinityIcon,
} from "lucide-react";

/* ============================================================================
 * TYPES & CONFIGURATION
 * ============================================================================ */

export type CardSurfaceStyle = "limestone" | "glacial-ice" | "float-navy";
export type WaterPaletteStyle = "float-ocean" | "bioluminescent" | "cenote-jade";
export type CardLayoutVariant = "video-minimal" | "spend-request";
export type InteractionMode = "carve" | "ripple";

export interface FloatWaterCardProps {
  cardholderName?: string;
  cardTitle?: string;
  spendLimit?: string;
  currency?: "CAD" | "USD";
  cardType?: "Physical" | "Virtual";
  surfaceStyle?: CardSurfaceStyle;
  waterPalette?: WaterPaletteStyle;
  layoutVariant?: CardLayoutVariant;
  onSurfaceStyleChange?: (style: CardSurfaceStyle) => void;
  onWaterPaletteChange?: (palette: WaterPaletteStyle) => void;
  onLayoutVariantChange?: (variant: CardLayoutVariant) => void;
}

const CANVAS_W = 1024;
const CANVAS_H = 660;
const CARD_MARGIN_X = 44;
const CARD_MARGIN_Y = 38;
const CARD_W = CANVAS_W - CARD_MARGIN_X * 2; // 936
const CARD_H = CANVAS_H - CARD_MARGIN_Y * 2; // 584
const CARD_RADIUS = 38;

const MASK_W = 512;
const MASK_H = 330;

const TOTAL_DURATION = 8.0; // Matches 00:00 -> 00:08 video choreography

/* ============================================================================
 * DETERMINISTIC PRNG & NOISE HELPERS FOR TEXTURE GENERATION
 * ============================================================================ */

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2D(ix: number, iy: number): number {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}

function fbm2D(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise2D(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return val;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ============================================================================
 * 1. PROCEDURAL CARD BASE TEXTURE (Stone/Ice/Navy + Float Logo + EMV Chip + Text)
 * ============================================================================ */

function renderCardBaseTexture(
  canvas: HTMLCanvasElement,
  options: {
    cardholderName: string;
    cardTitle: string;
    spendLimit: string;
    currency: "CAD" | "USD";
    cardType: "Physical" | "Virtual";
    surfaceStyle: CardSurfaceStyle;
    layoutVariant: CardLayoutVariant;
  }
) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Create pixel-level procedural stone/slate texture inside an ImageData buffer
  const imgData = ctx.createImageData(CANVAS_W, CANVAS_H);
  const data = imgData.data;
  const rand = mulberry32(104729);

  // Base RGB palette per surface style
  const palette =
    options.surfaceStyle === "limestone"
      ? { r: 214, g: 216, b: 213, contrast: 28, poreDark: 55 } // Matches 1.mp4 weathered stone card
      : options.surfaceStyle === "glacial-ice"
      ? { r: 235, g: 243, b: 250, contrast: 22, poreDark: 42 } // Float Glacial Ice
      : { r: 17, g: 31, b: 48, contrast: 18, poreDark: 25 }; // Float Midnight Navy

  for (let y = 0; y < CANVAS_H; y++) {
    for (let x = 0; x < CANVAS_W; x++) {
      const idx = (y * CANVAS_W + x) * 4;

      // Signed distance to the nominal card rounded rectangle
      const cx = CANVAS_W * 0.5;
      const cy = CANVAS_H * 0.5;
      const halfW = CARD_W * 0.5;
      const halfH = CARD_H * 0.5;
      const dx = Math.abs(x - cx) - (halfW - CARD_RADIUS);
      const dy = Math.abs(y - cy) - (halfH - CARD_RADIUS);
      const ox = Math.max(dx, 0);
      const oy = Math.max(dy, 0);
      const sdf =
        Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(dx, dy), 0) - CARD_RADIUS;

      // We fill the whole canvas with the stone texture so eroded outer edges have valid texels,
      // and store the crisp card alpha mask in the Alpha channel!
      const n1 = fbm2D(x * 0.008, y * 0.008, 4); // Large mineral clouds
      const n2 = fbm2D(x * 0.035 + 17.3, y * 0.035 + 9.1, 3); // Medium mottling
      const n3 = valueNoise2D(x * 0.16, y * 0.16); // Fine stone grit
      const grain = (rand() - 0.5) * 10;

      // Occasional tiny mineral pits/pores (like travertine/concrete in 1.mp4)
      const poreNoise = valueNoise2D(x * 0.28 + 41.2, y * 0.28 + 83.7);
      const pit = poreNoise > 0.84 ? -((poreNoise - 0.84) / 0.16) * palette.poreDark : 0;

      // Subtle vignette toward card edges
      const normX = (x - cx) / halfW;
      const normY = (y - cy) / halfH;
      const vig = -Math.pow(normX * normX + normY * normY, 1.2) * 8;

      const delta =
        (n1 - 0.5) * palette.contrast * 1.35 +
        (n2 - 0.5) * palette.contrast * 0.75 +
        (n3 - 0.5) * 14 +
        grain +
        pit +
        vig;

      data[idx] = Math.max(0, Math.min(255, Math.round(palette.r + delta)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(palette.g + delta)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(palette.b + delta)));

      // Smooth anti-aliased alpha for the nominal card boundary
      const alpha = Math.max(0, Math.min(1, 0.5 - sdf * 0.75));
      data[idx + 3] = Math.round(alpha * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Clip subsequent vector drawings (Float logo, EMV chip, typography) to the card boundary
  ctx.save();
  roundedRectPath(ctx, CARD_MARGIN_X, CARD_MARGIN_Y, CARD_W, CARD_H, CARD_RADIUS);
  ctx.clip();

  const isDarkSurface = options.surfaceStyle === "float-navy";
  const primaryInk = isDarkSurface ? "#F5FAFF" : "#181B1E";
  const secondaryInk = isDarkSurface ? "rgba(245, 250, 255, 0.68)" : "rgba(24, 27, 30, 0.62)";

  // Subtle inner card border highlight
  ctx.strokeStyle = isDarkSurface
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 2;
  roundedRectPath(
    ctx,
    CARD_MARGIN_X + 1,
    CARD_MARGIN_Y + 1,
    CARD_W - 2,
    CARD_H - 2,
    CARD_RADIUS - 1
  );
  ctx.stroke();

  // ─────────────────────────────────────────────────────────
  // 1. TOP-LEFT: FLOAT FINANCIAL LOGO (Replacing Ramp's Logo)
  // ─────────────────────────────────────────────────────────
  // Exact Float vector path from CompanyLogos.tsx / public/assets/icons/float_24.svg
  const logoX = CARD_MARGIN_X + 62;
  const logoY = CARD_MARGIN_Y + 52;
  ctx.save();
  ctx.translate(logoX, logoY);
  const logoScale = 1.62;
  ctx.scale(logoScale, logoScale);

  // Subtle etched shadow under logo
  ctx.fillStyle = isDarkSurface ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)";
  ctx.translate(0.5, 0.8);
  const floatPath = new Path2D(
    "M4.21686 19.6469L16.5593 12.4945V21.9426L6.98402 27.4614L12.2987 30.5519V40L0.000244141 32.8477V23.3995L4.21686 25.8719V19.6469ZM4.21686 7.15232V16.6005L16.5593 9.44813V0L4.21686 7.15232Z"
  );
  ctx.fill(floatPath);

  ctx.translate(-0.5, -0.8);
  ctx.fillStyle = primaryInk;
  ctx.fill(floatPath);
  ctx.restore();

  // If "spend-request" layout is active, also render the Float wordmark & Spend Request badges
  if (options.layoutVariant === "spend-request") {
    ctx.save();
    ctx.font = '700 30px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = primaryInk;
    ctx.textBaseline = "middle";
    ctx.fillText("Float", logoX + 42, logoY + 32);

    // Top-right Spend Request Card Type & Currency Pill
    const badgeText = `${options.cardType.toUpperCase()} · ${options.currency}`;
    ctx.font = '600 15px "Plus Jakarta Sans", -apple-system, sans-serif';
    const textMetrics = ctx.measureText(badgeText);
    const pillW = textMetrics.width + 32;
    const pillH = 34;
    const pillX = CARD_MARGIN_X + CARD_W - pillW - 64;
    const pillY = logoY + 14;

    roundedRectPath(ctx, pillX, pillY, pillW, pillH, 17);
    ctx.fillStyle = isDarkSurface
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(13, 25, 38, 0.08)";
    ctx.fill();
    ctx.strokeStyle = isDarkSurface
      ? "rgba(255, 255, 255, 0.18)"
      : "rgba(13, 25, 38, 0.16)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = primaryInk;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, pillX + pillW / 2, pillY + pillH / 2 + 1);
    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────
  // 2. MIDDLE-RIGHT: METALLIC EMV SMART CHIP (Exact position from 1.mp4)
  // ─────────────────────────────────────────────────────────
  const chipX = CARD_MARGIN_X + Math.round(CARD_W * 0.695);
  const chipY = CARD_MARGIN_Y + Math.round(CARD_H * 0.455);
  const chipW = 114;
  const chipH = 88;
  const chipR = 16;

  ctx.save();
  // Subtle recessed well shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1.5;

  roundedRectPath(ctx, chipX, chipY, chipW, chipH, chipR);
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, "#D3D6D9");
  chipGrad.addColorStop(0.35, "#E4E7EA");
  chipGrad.addColorStop(0.65, "#C5C9CC");
  chipGrad.addColorStop(1, "#B5B9BD");
  ctx.fillStyle = chipGrad;
  ctx.fill();
  ctx.restore();

  // Metallic brushed sheen lines on the chip
  ctx.save();
  roundedRectPath(ctx, chipX, chipY, chipW, chipH, chipR);
  ctx.clip();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1;
  for (let ly = chipY; ly < chipY + chipH; ly += 3) {
    ctx.beginPath();
    ctx.moveTo(chipX, ly);
    ctx.lineTo(chipX + chipW, ly);
    ctx.stroke();
  }

  // EMV Chip internal contact pad lines (matches the exact geometry in 1.mp4)
  ctx.strokeStyle = "rgba(68, 72, 76, 0.58)";
  ctx.lineWidth = 1.6;

  const colLeft = chipX + chipW * 0.33;
  const colRight = chipX + chipW * 0.67;

  // Center vertical column with rounded top/bottom caps
  ctx.beginPath();
  ctx.moveTo(colLeft, chipY + 12);
  ctx.quadraticCurveTo(chipX + chipW * 0.5, chipY + 2, colRight, chipY + 12);
  ctx.lineTo(colRight, chipY + chipH - 12);
  ctx.quadraticCurveTo(
    chipX + chipW * 0.5,
    chipY + chipH - 2,
    colLeft,
    chipY + chipH - 12
  );
  ctx.closePath();
  ctx.stroke();

  // Horizontal pad dividers on left and right
  const row1 = chipY + chipH * 0.34;
  const row2 = chipY + chipH * 0.66;
  ctx.beginPath();
  // Left pads
  ctx.moveTo(chipX, row1);
  ctx.lineTo(colLeft, row1);
  ctx.moveTo(chipX, row2);
  ctx.lineTo(colLeft, row2);
  // Right pads
  ctx.moveTo(colRight, row1);
  ctx.lineTo(chipX + chipW, row1);
  ctx.moveTo(colRight, row2);
  ctx.lineTo(chipX + chipW, row2);
  ctx.stroke();
  ctx.restore();

  // Outer border of chip
  ctx.save();
  roundedRectPath(ctx, chipX, chipY, chipW, chipH, chipR);
  ctx.strokeStyle = "rgba(75, 80, 85, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // ─────────────────────────────────────────────────────────
  // 3. BOTTOM-LEFT: CARDHOLDER NAME & SPEND REQUEST DETAILS
  // ─────────────────────────────────────────────────────────
  const textX = CARD_MARGIN_X + 62;
  const bottomY = CARD_MARGIN_Y + CARD_H - 72;

  ctx.save();
  if (options.layoutVariant === "spend-request") {
    // Spend Request metadata above cardholder name
    ctx.font = '600 14px "Plus Jakarta Sans", -apple-system, sans-serif';
    ctx.fillStyle = secondaryInk;
    ctx.letterSpacing = "1.2px";
    ctx.fillText(
      `${options.cardTitle.toUpperCase()}  ·  ${options.spendLimit} ${options.currency}/MO`,
      textX,
      bottomY - 32
    );
  }

  // Primary Cardholder Name (matches BURAK ASLAN typography in 1.mp4)
  ctx.font = '700 24px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
  ctx.letterSpacing = "1.4px";
  // Subtle light bevel under text
  ctx.fillStyle = isDarkSurface ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.45)";
  ctx.fillText(options.cardholderName.toUpperCase(), textX + 0.5, bottomY + 1);
  ctx.fillStyle = primaryInk;
  ctx.fillText(options.cardholderName.toUpperCase(), textX, bottomY);

  // Bottom-right network mark when in Spend Request mode
  if (options.layoutVariant === "spend-request") {
    const netX = CARD_MARGIN_X + CARD_W - 64;
    ctx.textAlign = "right";
    if (options.currency === "CAD") {
      ctx.font = 'italic 800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = primaryInk;
      ctx.fillText("VISA", netX, bottomY - 2);
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = secondaryInk;
      ctx.fillText("COMMERCIAL", netX, bottomY + 14);
    } else {
      // Mastercard interlocking circles
      ctx.fillStyle = isDarkSurface ? "rgba(245,250,255,0.75)" : "rgba(24,27,30,0.7)";
      ctx.beginPath();
      ctx.arc(netX - 34, bottomY - 8, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isDarkSurface ? "rgba(245,250,255,0.45)" : "rgba(24,27,30,0.42)";
      ctx.beginPath();
      ctx.arc(netX - 16, bottomY - 8, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.restore();
}

/* ============================================================================
 * 2. PROCEDURAL BRANCHING FRACTURE / CRACK NETWORK (Matches 00:01 -> 00:08)
 * ============================================================================ */

interface CrackPath {
  startX: number; // Normalized [0, 1] within card
  startY: number;
  angle: number;
  length: number;
  width: number;
  startAt: number; // Propagation progress [0, 1]
  seed: number;
  branchDepth: number;
}

const PRIMARY_CRACKS: CrackPath[] = [
  // Top-center long branching crack (prominent in 00:01 - 00:08)
  { startX: 0.57, startY: 0.02, angle: Math.PI * 0.58, length: 0.46, width: 2.2, startAt: 0.0, seed: 101, branchDepth: 2 },
  // Top-left crack near logo
  { startX: 0.30, startY: 0.02, angle: Math.PI * 0.44, length: 0.34, width: 1.8, startAt: 0.08, seed: 202, branchDepth: 2 },
  // Left-middle crack
  { startX: 0.02, startY: 0.65, angle: -Math.PI * 0.16, length: 0.42, width: 2.1, startAt: 0.05, seed: 303, branchDepth: 2 },
  // Bottom-left crack
  { startX: 0.39, startY: 0.98, angle: -Math.PI * 0.48, length: 0.38, width: 1.9, startAt: 0.12, seed: 404, branchDepth: 2 },
  // Bottom-center crack
  { startX: 0.52, startY: 0.98, angle: -Math.PI * 0.55, length: 0.35, width: 2.0, startAt: 0.10, seed: 505, branchDepth: 2 },
  // Right edge crack cutting directly through the EMV chip!
  { startX: 0.96, startY: 0.56, angle: Math.PI * 0.96, length: 0.36, width: 2.2, startAt: 0.04, seed: 606, branchDepth: 2 },
  // Top-right diagonal crack toward chip
  { startX: 0.82, startY: 0.04, angle: Math.PI * 0.66, length: 0.42, width: 1.9, startAt: 0.06, seed: 707, branchDepth: 2 },
];

function renderCrackNetworkTexture(canvas: HTMLCanvasElement) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "rgb(0, 255, 0)"; // R=0 (no crack), G=255 (arrival threshold 1.0), B=0 (no bevel)
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const drawCrackRecursive = (spec: CrackPath) => {
    const rand = mulberry32(spec.seed);
    const steps = Math.max(18, Math.floor(spec.length * 140));
    let x = CARD_MARGIN_X + spec.startX * CARD_W;
    let y = CARD_MARGIN_Y + spec.startY * CARD_H;
    let curAngle = spec.angle;
    const stepLen = (spec.length * CARD_W) / steps;

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const arrival = Math.min(1, spec.startAt + t * (0.85 - spec.startAt * 0.5));
      // Jagged angular walk
      curAngle += (rand() - 0.5) * 0.52;
      const nx = x + Math.cos(curAngle) * stepLen;
      const ny = y + Math.sin(curAngle) * stepLen;

      const w = spec.width * (1 - t * 0.62);
      const gByte = Math.max(1, Math.min(254, Math.round(arrival * 255)));

      // Bevel lip (Blue channel) offset slightly
      ctx.strokeStyle = `rgb(0, ${gByte}, 220)`;
      ctx.lineWidth = w + 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x + 1.2, y + 1.2);
      ctx.lineTo(nx + 1.2, ny + 1.2);
      ctx.stroke();

      // Core fissure (Red channel = depth, Green channel = arrival time)
      const depthByte = Math.round(Math.min(255, (1 - t * 0.45) * 255));
      ctx.strokeStyle = `rgb(${depthByte}, ${gByte}, 0)`;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Spawn secondary sub-branches
      if (
        spec.branchDepth > 0 &&
        i > 4 &&
        i < steps - 4 &&
        rand() < (spec.branchDepth === 2 ? 0.14 : 0.09)
      ) {
        const side = rand() > 0.5 ? 1 : -1;
        drawCrackRecursive({
          startX: (nx - CARD_MARGIN_X) / CARD_W,
          startY: (ny - CARD_MARGIN_Y) / CARD_H,
          angle: curAngle + side * (0.45 + rand() * 0.5),
          length: spec.length * (0.32 + rand() * 0.25),
          width: spec.width * 0.65,
          startAt: arrival,
          seed: spec.seed * 31 + i * 17,
          branchDepth: spec.branchDepth - 1,
        });
      }

      x = nx;
      y = ny;
    }
  };

  for (const crack of PRIMARY_CRACKS) {
    drawCrackRecursive(crack);
  }
}

/* ============================================================================
 * 3. CHOREOGRAPHED WATER EROSION MASK (Matches 00:00 -> 00:08 of 1.mp4)
 * ============================================================================ */

interface WaterNode {
  x: number; // Normalized [0, 1] in card space
  y: number;
  rx: number; // Normalized radius X
  ry: number; // Normalized radius Y
  startTime: number; // Seconds in [0, 8]
  growDuration: number;
  intensity: number;
}

// 1. Perimeter tide nodes: carefully sculpted to frame the Float logo (top-left)
//    and Cardholder Name (bottom-left) in dry stone coves while lushly eroding
//    the right, bottom, top, and left edges just like 1.mp4!
const PERIMETER_NODES: WaterNode[] = [
  // Initial 00:00 edge droplets
  { x: 0.23, y: 0.0, rx: 0.07, ry: 0.035, startTime: -0.5, growDuration: 0.5, intensity: 0.75 },
  { x: 0.62, y: 0.0, rx: 0.11, ry: 0.04, startTime: -0.5, growDuration: 0.5, intensity: 0.82 },
  { x: 0.99, y: 0.16, rx: 0.045, ry: 0.11, startTime: -0.5, growDuration: 0.5, intensity: 0.85 },
  { x: 1.0, y: 0.52, rx: 0.04, ry: 0.14, startTime: -0.5, growDuration: 0.5, intensity: 0.82 },
  { x: 0.99, y: 0.88, rx: 0.05, ry: 0.12, startTime: -0.5, growDuration: 0.5, intensity: 0.88 },
  { x: 0.72, y: 1.0, rx: 0.16, ry: 0.04, startTime: -0.5, growDuration: 0.5, intensity: 0.82 },
  { x: 0.0, y: 0.36, rx: 0.032, ry: 0.10, startTime: -0.5, growDuration: 0.5, intensity: 0.72 },
  { x: 0.0, y: 0.72, rx: 0.032, ry: 0.12, startTime: -0.5, growDuration: 0.5, intensity: 0.75 },

  // 00:01 -> 00:03 Right & Bottom-Right surge
  { x: 0.96, y: 0.12, rx: 0.16, ry: 0.18, startTime: 0.2, growDuration: 1.6, intensity: 1.0 },
  { x: 0.98, y: 0.34, rx: 0.12, ry: 0.22, startTime: 0.3, growDuration: 1.7, intensity: 1.0 },
  { x: 0.98, y: 0.58, rx: 0.11, ry: 0.22, startTime: 0.4, growDuration: 1.8, intensity: 1.0 },
  { x: 0.96, y: 0.84, rx: 0.17, ry: 0.22, startTime: 0.25, growDuration: 1.7, intensity: 1.0 },
  { x: 0.82, y: 0.96, rx: 0.20, ry: 0.15, startTime: 0.5, growDuration: 1.8, intensity: 1.0 },
  { x: 0.62, y: 0.95, rx: 0.19, ry: 0.16, startTime: 0.7, growDuration: 1.8, intensity: 1.0 },
  { x: 0.46, y: 0.98, rx: 0.14, ry: 0.09, startTime: 0.9, growDuration: 1.8, intensity: 0.95 },

  // Top edge surge (frames logo on the right side of the logo)
  { x: 0.78, y: 0.03, rx: 0.20, ry: 0.14, startTime: 0.6, growDuration: 1.7, intensity: 1.0 },
  { x: 0.56, y: 0.01, rx: 0.18, ry: 0.09, startTime: 0.8, growDuration: 1.8, intensity: 0.95 },
  { x: 0.34, y: 0.02, rx: 0.16, ry: 0.10, startTime: 1.0, growDuration: 1.8, intensity: 0.95 },
  { x: 0.16, y: 0.0, rx: 0.10, ry: 0.045, startTime: 1.1, growDuration: 1.8, intensity: 0.85 },

  // Left edge surge (curves around logo and cardholder name)
  { x: 0.01, y: 0.06, rx: 0.06, ry: 0.09, startTime: 1.1, growDuration: 1.8, intensity: 0.9 },
  { x: 0.01, y: 0.32, rx: 0.075, ry: 0.16, startTime: 0.9, growDuration: 1.8, intensity: 0.95 },
  { x: 0.02, y: 0.56, rx: 0.085, ry: 0.18, startTime: 1.0, growDuration: 1.8, intensity: 1.0 },
  { x: 0.02, y: 0.82, rx: 0.075, ry: 0.18, startTime: 1.1, growDuration: 1.8, intensity: 0.95 },
  { x: 0.14, y: 0.99, rx: 0.16, ry: 0.06, startTime: 1.2, growDuration: 1.8, intensity: 0.92 },
  { x: 0.30, y: 0.99, rx: 0.14, ry: 0.065, startTime: 1.2, growDuration: 1.8, intensity: 0.92 },
];

// 2. Interior Fracture Lagoons (00:01.5 -> 00:03.2) — matches the exact interior patches in 1.mp4!
const INTERIOR_LAGOONS: WaterNode[] = [
  // Triangular lagoon breaking right through the right half of the EMV chip!
  { x: 0.765, y: 0.555, rx: 0.048, ry: 0.075, startTime: 1.4, growDuration: 1.5, intensity: 0.96 },
  { x: 0.745, y: 0.525, rx: 0.032, ry: 0.042, startTime: 1.6, growDuration: 1.4, intensity: 0.92 },

  // Upper-center cascading fracture lagoon (x ~ 0.54, y ~ 0.28)
  { x: 0.55, y: 0.25, rx: 0.042, ry: 0.068, startTime: 1.5, growDuration: 1.5, intensity: 0.95 },
  { x: 0.52, y: 0.34, rx: 0.045, ry: 0.052, startTime: 1.7, growDuration: 1.5, intensity: 0.95 },
  { x: 0.62, y: 0.21, rx: 0.026, ry: 0.028, startTime: 1.8, growDuration: 1.4, intensity: 0.85 },

  // Left-center & lower-left fracture islands
  { x: 0.20, y: 0.59, rx: 0.038, ry: 0.055, startTime: 1.6, growDuration: 1.4, intensity: 0.94 },
  { x: 0.28, y: 0.64, rx: 0.042, ry: 0.045, startTime: 1.8, growDuration: 1.4, intensity: 0.92 },
  { x: 0.38, y: 0.50, rx: 0.028, ry: 0.032, startTime: 1.9, growDuration: 1.3, intensity: 0.88 },
  { x: 0.39, y: 0.67, rx: 0.034, ry: 0.036, startTime: 2.0, growDuration: 1.3, intensity: 0.88 },
  { x: 0.14, y: 0.43, rx: 0.022, ry: 0.026, startTime: 2.1, growDuration: 1.2, intensity: 0.82 },
];

/**
 * Evaluates the exact Infinity (∞) curve from frames 00:04 -> 00:08 of 1.mp4!
 * u in [0, 1]:
 *   0.00 -> 0.25: Center crossover (0.46, 0.55) -> Bottom-right (0.58, 0.67) -> Far-right (0.68, 0.55)
 *   0.25 -> 0.50: Far-right (0.68, 0.55) -> Top-right (0.58, 0.43) -> Center crossover (0.46, 0.55)
 *   0.50 -> 0.75: Center crossover (0.46, 0.55) -> Bottom-left (0.34, 0.67) -> Far-left (0.25, 0.55)
 *   0.75 -> 1.00: Far-left (0.25, 0.55) -> Top-left (0.34, 0.43) -> Center crossover (0.46, 0.55)
 */
function sampleInfinityCurve(u: number): { x: number; y: number; radius: number } {
  const cx = 0.465;
  const cy = 0.555;

  if (u <= 0.5) {
    // Right loop: theta goes from -PI to +PI
    // At theta = -PI (u=0): x = cx, y = cy
    // At theta = -PI/2 (u=0.125): bottom of right loop
    // At theta = 0 (u=0.25): rightmost edge of right loop
    // At theta = +PI/2 (u=0.375): top of right loop
    // At theta = +PI (u=0.5): back to center (cx, cy)
    const theta = -Math.PI + (u / 0.5) * (2 * Math.PI);
    const loopCx = cx + 0.108;
    const rx = 0.108;
    const ry = 0.125;
    const x = loopCx + rx * Math.cos(theta);
    const y = cy - ry * Math.sin(theta);
    // Slightly thicker along the bottom-right and outer arch (matches 00:05-00:06)
    const radius = 0.068 + 0.016 * Math.sin(u * Math.PI * 2);
    return { x, y, radius };
  } else {
    // Left loop: v in [0, 1]
    const v = (u - 0.5) / 0.5;
    // Start at center (theta = 0 -> x = loopCx + rx = cx), go down-left (theta = PI/2 -> y = cy + ry),
    // far-left (theta = PI -> x = loopCx - rx), top-left (theta = 3PI/2 -> y = cy - ry), back to center (2PI)
    const theta = v * (2 * Math.PI);
    const loopCx = cx - 0.108;
    const rx = 0.108;
    const ry = 0.125;
    const x = loopCx + rx * Math.cos(theta);
    const y = cy + ry * Math.sin(theta);
    const radius = 0.066 + 0.014 * Math.sin(v * Math.PI);
    return { x, y, radius };
  }
}

function drawRadialBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  intensity: number
) {
  if (rx <= 0.5 || ry <= 0.5 || intensity <= 0.01) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  const a = Math.min(1, intensity);
  grad.addColorStop(0, `rgba(255, 255, 255, ${a})`);
  grad.addColorStop(0.5, `rgba(255, 255, 255, ${a * 0.72})`);
  grad.addColorStop(0.8, `rgba(255, 255, 255, ${a * 0.28})`);
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderWaterMask(
  maskCtx: CanvasRenderingContext2D,
  userLayerCanvas: HTMLCanvasElement,
  elapsed: number
) {
  maskCtx.fillStyle = "#000000";
  maskCtx.fillRect(0, 0, MASK_W, MASK_H);

  // Use screen/lighter blending so overlapping water nodes fuse organically
  maskCtx.globalCompositeOperation = "screen";

  const scaleX = MASK_W / CANVAS_W;
  const scaleY = MASK_H / CANVAS_H;
  const cardLeft = CARD_MARGIN_X * scaleX;
  const cardTop = CARD_MARGIN_Y * scaleY;
  const cardW = CARD_W * scaleX;
  const cardH = CARD_H * scaleY;

  // 1. Perimeter Tide Nodes
  for (const node of PERIMETER_NODES) {
    const prog = Math.max(
      0,
      Math.min(1, (elapsed - node.startTime) / node.growDuration)
    );
    if (prog <= 0) continue;
    const ease = 1 - Math.pow(1 - prog, 2.6);
    drawRadialBlob(
      maskCtx,
      cardLeft + node.x * cardW,
      cardTop + node.y * cardH,
      node.rx * cardW * (0.25 + 0.75 * ease),
      node.ry * cardH * (0.25 + 0.75 * ease),
      node.intensity * ease
    );
  }

  // 2. Interior Fracture Lagoons
  for (const node of INTERIOR_LAGOONS) {
    const prog = Math.max(
      0,
      Math.min(1, (elapsed - node.startTime) / node.growDuration)
    );
    if (prog <= 0) continue;
    const ease = 1 - Math.pow(1 - prog, 2.4);
    drawRadialBlob(
      maskCtx,
      cardLeft + node.x * cardW,
      cardTop + node.y * cardH,
      node.rx * cardW * ease,
      node.ry * cardH * ease,
      node.intensity * ease
    );
  }

  // 3. The Infinity (∞) Stream Choreography (3.6s -> 7.9s)
  const infStart = 3.6;
  const infEnd = 7.85;
  if (elapsed > infStart) {
    const infProg = Math.max(0, Math.min(1, (elapsed - infStart) / (infEnd - infStart)));
    const totalSamples = 110;
    const activeSamples = Math.floor(infProg * totalSamples);

    for (let i = 0; i <= activeSamples; i++) {
      const u = i / totalSamples;
      const pt = sampleInfinityCurve(u);
      // Smoothly swell each node after the leading brush head passes it
      const age = (infProg - u) * (infEnd - infStart);
      const swell = Math.max(0, Math.min(1, age / 0.45));
      const swellEase = 0.35 + 0.65 * (1 - Math.pow(1 - swell, 2));
      drawRadialBlob(
        maskCtx,
        cardLeft + pt.x * cardW,
        cardTop + pt.y * cardH,
        pt.radius * cardW * swellEase,
        pt.radius * cardH * 1.35 * swellEase,
        0.92 * swellEase
      );
    }
  }

  // 4. Composite User-Painted Freehand Water Channels
  maskCtx.drawImage(userLayerCanvas, 0, 0);

  // 5. Protect Top-Left Float Logo & Bottom-Left Cardholder Name Coves
  //    (Just like BURAK ASLAN and the Ramp logo stay legible in 1.mp4!)
  maskCtx.globalCompositeOperation = "destination-out";
  // Logo protection cove
  drawRadialBlob(
    maskCtx,
    cardLeft + 0.088 * cardW,
    cardTop + 0.155 * cardH,
    0.068 * cardW,
    0.105 * cardH,
    0.96
  );
  // Cardholder name protection cove
  drawRadialBlob(
    maskCtx,
    cardLeft + 0.21 * cardW,
    cardTop + 0.855 * cardH,
    0.18 * cardW,
    0.082 * cardH,
    0.96
  );

  maskCtx.globalCompositeOperation = "source-over";
}

/* ============================================================================
 * 4. WEBGL SHADERS: SEASCAPE WATER + CAUSTICS + SEAFOAM + FRACTURED STONE RIM
 * ============================================================================ */

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_cardTex;
uniform sampler2D u_crackTex;
uniform sampler2D u_maskTex;

uniform float u_time;
uniform float u_crackProgress;
uniform vec2 u_resolution;
uniform int u_waterPalette; // 0 = float-ocean, 1 = bioluminescent, 2 = cenote-jade
uniform int u_isDarkCard;
uniform vec4 u_ripples[12]; // xy = normalized uv, z = dropTime, w = amp

float hash(vec2 p) {
  float h = dot(p, vec2(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.05 + vec2(13.7, 29.3);
    a *= 0.5;
  }
  return v;
}

// Seascape wave octave (adapted from DuckPond.tsx & Alexander Alekseev's Seascape)
float sea_octave(vec2 uv, float choppy) {
  uv += noise(uv) * 2.0 - 1.0;
  vec2 wv = 1.0 - abs(sin(uv));
  vec2 swv = abs(cos(uv));
  wv = mix(wv, swv, wv);
  return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
}

const mat2 octave_m = mat2(1.6, 1.2, -1.2, 1.6);

float getWaveHeight(vec2 uv) {
  float seaTime = u_time * 0.95;
  float freq = 0.22;
  float amp = 0.55;
  float choppy = 3.8;
  float h = 0.0;

  for (int i = 0; i < 4; i++) {
    float d = sea_octave((uv + seaTime) * freq, choppy);
    d += sea_octave((uv - seaTime * 0.85) * freq, choppy);
    h += d * amp;
    uv *= octave_m;
    freq *= 1.92;
    amp *= 0.24;
    choppy = mix(choppy, 1.0, 0.22);
  }
  return h;
}

float evalRipple(vec2 uv, vec2 center, float time, float dropTime) {
  float age = time - dropTime;
  if (age < 0.0 || age > 3.5) return 0.0;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - center) * aspect;
  float dist = length(diff);
  float wavefront = age * 0.26;
  float envelope = exp(-pow((dist - wavefront) * 14.0, 2.0));
  float decay = exp(-age * 1.45);
  return 0.38 * envelope * decay * cos(dist * 75.0 - time * 11.0);
}

// Animated underwater caustic network
float causticPattern(vec2 uv, float t) {
  vec2 p = uv * vec2(18.0, 12.0);
  float c1 = sin(p.x * 1.8 + t * 1.7 + sin(p.y * 2.1 - t * 1.3)) *
             cos(p.y * 1.9 - t * 1.4 + cos(p.x * 1.6 + t * 1.2));
  vec2 p2 = mat2(0.7, -0.7, 0.7, 0.7) * p * 1.35;
  float c2 = sin(p2.x * 2.0 - t * 1.5 + sin(p2.y * 1.8 + t * 1.9)) *
             cos(p2.y * 2.1 + t * 1.6 + cos(p2.x * 1.9 - t * 1.1));
  float v = pow(abs(c1 + c2) * 0.5, 2.2);
  return clamp(1.0 - v * 2.4, 0.0, 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec4 cardSample = texture2D(u_cardTex, uv);
  vec4 crackSample = texture2D(u_crackTex, uv);
  float rawMask = texture2D(u_maskTex, uv).r;

  // Multi-scale organic shoreline FBM noise (creates the ragged coves, islets & tufts like 1.mp4)
  vec2 aspectUV = uv * vec2(1.58, 1.0);
  float nCoarse = fbm(aspectUV * 11.0);
  float nMed = fbm(aspectUV * 28.0 + vec2(5.2, 8.7));
  float nFine = fbm(aspectUV * 68.0 + vec2(19.1, 3.4));
  float organicNoise = nCoarse * 0.50 + nMed * 0.33 + nFine * 0.17;

  // Subtle breathing tide oscillation along the shoreline
  float tideBreath = 0.014 * sin(u_time * 2.1 + aspectUV.x * 16.0 + aspectUV.y * 12.0);

  // Combine smooth mask with fractal shoreline displacement
  float maskActivity = smoothstep(0.01, 0.22, rawMask);
  float erosion = rawMask + (organicNoise - 0.49) * 0.36 * maskActivity + tideBreath * maskActivity;

  float waterThreshold = 0.40;
  float isWater = step(waterThreshold, erosion);

  // Outside the nominal card boundary: allow organic water crests/splashes to billow
  // slightly past the straight card edges (just like the grass in 1.mp4!)
  float outsideCard = 1.0 - cardSample.a;
  float outerWaterAlpha = smoothstep(waterThreshold - 0.015, waterThreshold + 0.025, erosion);
  float finalAlpha = max(cardSample.a, outerWaterAlpha);

  if (finalAlpha < 0.01) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // ─────────────────────────────────────────────────────────
  // 1. DRY & CRACKED CARD SURFACE + WET SHORELINE CLIFF RIM
  // ─────────────────────────────────────────────────────────
  vec3 cardColor = cardSample.rgb;

  // Reveal branching cracks progressively as u_crackProgress goes 0 -> 1
  float crackArrival = crackSample.g;
  float crackActive = smoothstep(crackArrival + 0.04, crackArrival - 0.04, u_crackProgress);
  float crackDepth = crackSample.r * crackActive;
  float crackBevel = crackSample.b * crackActive;

  // 3D chipped stone highlight beside crack
  cardColor += vec3(0.11, 0.12, 0.13) * crackBevel * (1.0 - crackDepth);

  // Dark fissure core + subtle turquoise water seepage inside deep cracks
  vec3 fissureColor = u_isDarkCard == 1
    ? vec3(0.02, 0.08, 0.14)
    : vec3(0.16, 0.19, 0.22);
  vec3 seepageGlow = vec3(0.08, 0.55, 0.72) * smoothstep(0.45, 0.9, u_crackProgress) * 0.45;
  cardColor = mix(cardColor, fissureColor + seepageGlow * crackDepth, crackDepth * 0.88);

  // Damp/wet stone darkening halo just outside the water boundary
  float distToWater = waterThreshold - erosion;
  float wetHalo = smoothstep(0.11, 0.0, distToWater) * (1.0 - isWater);
  if (u_isDarkCard == 1) {
    cardColor = mix(cardColor, cardColor * 0.65 + vec3(0.0, 0.08, 0.14), wetHalo * 0.75);
  } else {
    cardColor = mix(cardColor, cardColor * 0.72 + vec3(0.01, 0.04, 0.06), wetHalo * 0.78);
  }

  // Rocky cliff bevel right at the fractured edge (0.0 -> 0.038 outside water)
  float cliffRim = smoothstep(0.038, 0.0, distToWater) * (1.0 - isWater);
  vec3 cliffColor = u_isDarkCard == 1
    ? vec3(0.06, 0.22, 0.34)
    : vec3(0.24, 0.31, 0.35);
  cardColor = mix(cardColor, cliffColor, cliffRim * 0.85);

  // Tiny glistening water droplets / wet mineral sparkles along the damp rim
  float dropletNoise = smoothstep(0.79, 0.86, nFine) * smoothstep(0.08, 0.01, distToWater);
  cardColor += vec3(0.55, 0.85, 0.98) * dropletNoise * 0.45;

  if (erosion < waterThreshold) {
    gl_FragColor = vec4(cardColor, finalAlpha);
    return;
  }

  // ─────────────────────────────────────────────────────────
  // 2. LIVING WATER INTERIOR (Shallows -> Reef Lagoon -> Deep Trench)
  // ─────────────────────────────────────────────────────────
  float waterDepth = clamp((erosion - waterThreshold) / 0.36, 0.0, 1.0);

  // Compute wave height + interactive ripples
  vec2 waveUV = aspectUV * 18.0;
  float h = getWaveHeight(waveUV);
  float rippleSum = 0.0;
  for (int i = 0; i < 12; i++) {
    if (u_ripples[i].w > 0.01) {
      rippleSum += evalRipple(uv, u_ripples[i].xy, u_time, u_ripples[i].z) * u_ripples[i].w;
    }
  }
  h += rippleSum;

  // Finite-difference surface normal
  float eps = 0.04;
  float hx = getWaveHeight(waveUV + vec2(eps, 0.0)) + rippleSum * 0.8;
  float hy = getWaveHeight(waveUV + vec2(0.0, eps)) + rippleSum * 0.8;
  vec3 normal = normalize(vec3(h - hx, eps * 6.5, h - hy));

  // Palette selection
  vec3 shallowCol = vec3(0.20, 0.78, 0.92); // Crystal Float cyan
  vec3 midCol     = vec3(0.02, 0.48, 0.74); // Float ocean blue
  vec3 deepCol    = vec3(0.03, 0.18, 0.34); // Abyssal navy
  vec3 skyCol     = vec3(0.65, 0.92, 0.99);

  if (u_waterPalette == 1) {
    // Bioluminescent Maldives
    shallowCol = vec3(0.15, 0.95, 0.98);
    midCol     = vec3(0.04, 0.56, 0.88);
    deepCol    = vec3(0.02, 0.11, 0.28);
    skyCol     = vec3(0.75, 0.98, 1.00);
  } else if (u_waterPalette == 2) {
    // Cenote Emerald & Turquoise
    shallowCol = vec3(0.22, 0.86, 0.76);
    midCol     = vec3(0.03, 0.52, 0.58);
    deepCol    = vec3(0.02, 0.20, 0.26);
    skyCol     = vec3(0.70, 0.96, 0.90);
  }

  // Refracted submerged stone shelf visible in shallow water
  vec2 refractUV = clamp(uv + normal.xz * 0.018 * (1.0 - waterDepth * 0.5), 0.0, 1.0);
  vec3 submergedStone = texture2D(u_cardTex, refractUV).rgb * 0.55;

  // Bathymetry color ramp (submerged stone -> turquoise shallows -> mid ocean -> deep trench)
  vec3 waterBase = mix(shallowCol, midCol, smoothstep(0.08, 0.52, waterDepth));
  waterBase = mix(waterBase, deepCol, smoothstep(0.48, 0.95, waterDepth));
  waterBase = mix(submergedStone * shallowCol * 1.35, waterBase, smoothstep(0.0, 0.28, waterDepth));

  // Underwater sunlight caustics (warped by surface wave normal)
  float caustics = causticPattern(aspectUV + normal.xz * 0.06, u_time);
  float causticMask = smoothstep(0.02, 0.18, waterDepth) * (1.0 - smoothstep(0.65, 0.98, waterDepth));
  waterBase += shallowCol * caustics * causticMask * 0.48;

  // Wave crest height variation
  waterBase += shallowCol * (h - 0.52) * 0.22;

  // Fresnel sky reflection
  vec3 eye = vec3(0.0, 1.0, 0.0);
  float fresnel = pow(1.0 - max(dot(normal, eye), 0.0), 3.0) * 0.58;
  vec3 waterCol = mix(waterBase, skyCol, clamp(fresnel, 0.0, 1.0));

  // Eroded cliff drop-shadow just inside the northern/western water rim
  float innerRimShadow = (1.0 - smoothstep(0.0, 0.14, waterDepth)) * 0.42;
  waterCol *= (1.0 - innerRimShadow);

  // Lacy Whitewater Seafoam Collar along the shoreline (replaces the soil/moss rim in 1.mp4!)
  float foamBand = 1.0 - smoothstep(0.0, 0.14 + 0.05 * nMed, waterDepth);
  float foamLace = smoothstep(0.32, 0.66, nFine * 0.65 + nMed * 0.35 + 0.25 * foamBand);
  float shorelineFoam = foamBand * foamLace;

  // Secondary inner ripple foam line
  float innerWaveLine = exp(-pow((waterDepth - 0.20 - 0.03 * sin(u_time * 3.0 + aspectUV.x * 20.0)) * 24.0, 2.0)) *
                        smoothstep(0.42, 0.7, nMed) * 0.55;

  vec3 foamColor = vec3(0.95, 0.99, 1.0);
  waterCol = mix(waterCol, foamColor, clamp(shorelineFoam * 0.92 + innerWaveLine, 0.0, 1.0));

  // Specular sun glints on wave crests
  vec3 lightDir = normalize(vec3(0.38, 0.78, 0.32));
  vec3 refl = reflect(-eye, normal);
  float spec = pow(max(dot(refl, lightDir), 0.0), 68.0);
  waterCol += vec3(1.0, 0.99, 0.96) * spec * 0.85;

  // Anti-aliased transition right across the waterThreshold boundary
  float edgeAA = smoothstep(waterThreshold - 0.008, waterThreshold + 0.008, erosion);
  vec3 finalRGB = mix(cardColor, clamp(waterCol, 0.0, 1.0), edgeAA);

  gl_FragColor = vec4(finalRGB, finalAlpha);
}
`;

function compileGLShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("FloatWaterCard shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/* ============================================================================
 * 5. MAIN INTERACTIVE FLOAT WATER CARD COMPONENT
 * ============================================================================ */

interface RipplePoint {
  x: number;
  y: number;
  time: number;
  amp: number;
}

export function FloatWaterCard({
  cardholderName: initialName = "FILBERT MANGUNDAP",
  cardTitle: initialTitle = "Q4 Design Offsite",
  spendLimit: initialLimit = "$5,000.00",
  currency: initialCurrency = "CAD",
  cardType: initialCardType = "Physical",
  surfaceStyle: controlledSurface,
  waterPalette: controlledPalette,
  layoutVariant: controlledLayout,
  onSurfaceStyleChange,
  onWaterPaletteChange,
  onLayoutVariantChange,
}: FloatWaterCardProps) {
  // Interactive state
  const [cardholderName, setCardholderName] = useState(initialName);
  const [cardTitle, setCardTitle] = useState(initialTitle);
  const [spendLimit, setSpendLimit] = useState(initialLimit);
  const [currency, setCurrency] = useState<"CAD" | "USD">(initialCurrency);
  const [cardType, setCardType] = useState<"Physical" | "Virtual">(initialCardType);

  const [internalSurface, setInternalSurface] = useState<CardSurfaceStyle>("limestone");
  const [internalPalette, setInternalPalette] = useState<WaterPaletteStyle>("float-ocean");
  const [internalLayout, setInternalLayout] = useState<CardLayoutVariant>("video-minimal");

  const surfaceStyle = controlledSurface ?? internalSurface;
  const waterPalette = controlledPalette ?? internalPalette;
  const layoutVariant = controlledLayout ?? internalLayout;

  const setSurfaceStyle = (s: CardSurfaceStyle) => {
    setInternalSurface(s);
    onSurfaceStyleChange?.(s);
  };
  const setWaterPalette = (p: WaterPaletteStyle) => {
    setInternalPalette(p);
    onWaterPaletteChange?.(p);
  };
  const setLayoutVariant = (v: CardLayoutVariant) => {
    setInternalLayout(v);
    onLayoutVariantChange?.(v);
  };

  const [isPlaying, setIsPlaying] = useState(true);
  const [timeline, setTimeline] = useState(0);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("carve");
  const [brushSize, setBrushSize] = useState(30);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  // Canvas & WebGL refs
  const glCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const crackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const userLayerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isPlayingRef = useRef(isPlaying);
  const timelineRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const shaderClockRef = useRef(0);
  const ripplesRef = useRef<RipplePoint[]>([]);
  const isPointerDownRef = useRef(false);
  const lastPaintPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastInfinityRippleRef = useRef(0);
  const cardTexDirtyRef = useRef(true);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const pushRipple = useCallback((nx: number, ny: number, amp = 1.0) => {
    const now = shaderClockRef.current;
    const arr = ripplesRef.current.filter((r) => now - r.time < 3.5);
    if (arr.length >= 12) arr.shift();
    arr.push({ x: nx, y: ny, time: now, amp });
    ripplesRef.current = arr;
  }, []);

  // Re-render card base texture whenever card text/layout/surface changes
  useEffect(() => {
    if (!cardCanvasRef.current) {
      cardCanvasRef.current = document.createElement("canvas");
    }
    renderCardBaseTexture(cardCanvasRef.current, {
      cardholderName: cardholderName || "FILBERT MANGUNDAP",
      cardTitle: cardTitle || "New Spend Request",
      spendLimit: spendLimit || "$5,000.00",
      currency,
      cardType,
      surfaceStyle,
      layoutVariant,
    });
    cardTexDirtyRef.current = true;
  }, [
    cardholderName,
    cardTitle,
    spendLimit,
    currency,
    cardType,
    surfaceStyle,
    layoutVariant,
  ]);

  // Initialize offscreen canvases and WebGL loop
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (!glCanvas) return;

    if (!cardCanvasRef.current) {
      cardCanvasRef.current = document.createElement("canvas");
      renderCardBaseTexture(cardCanvasRef.current, {
        cardholderName,
        cardTitle,
        spendLimit,
        currency,
        cardType,
        surfaceStyle,
        layoutVariant,
      });
    }

    if (!crackCanvasRef.current) {
      crackCanvasRef.current = document.createElement("canvas");
      renderCrackNetworkTexture(crackCanvasRef.current);
    }

    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement("canvas");
      maskCanvasRef.current.width = MASK_W;
      maskCanvasRef.current.height = MASK_H;
    }

    if (!userLayerCanvasRef.current) {
      userLayerCanvasRef.current = document.createElement("canvas");
      userLayerCanvasRef.current.width = MASK_W;
      userLayerCanvasRef.current.height = MASK_H;
    }

    const gl = glCanvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vs = compileGLShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileGLShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Fullscreen quad
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Create textures
    const createTex = (unit: number, sourceCanvas: HTMLCanvasElement) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        sourceCanvas
      );
      return tex;
    };

    const cardTex = createTex(0, cardCanvasRef.current);
    const crackTex = createTex(1, crackCanvasRef.current);
    const maskTex = createTex(2, maskCanvasRef.current);

    gl.uniform1i(gl.getUniformLocation(program, "u_cardTex"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_crackTex"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "u_maskTex"), 2);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uCrackProgress = gl.getUniformLocation(program, "u_crackProgress");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uWaterPalette = gl.getUniformLocation(program, "u_waterPalette");
    const uIsDarkCard = gl.getUniformLocation(program, "u_isDarkCard");
    const uRipples: (WebGLUniformLocation | null)[] = [];
    for (let i = 0; i < 12; i++) {
      uRipples.push(gl.getUniformLocation(program, `u_ripples[${i}]`));
    }

    gl.viewport(0, 0, CANVAS_W, CANVAS_H);
    gl.uniform2f(uRes, CANVAS_W, CANVAS_H);

    let rafId = 0;
    lastFrameTimeRef.current = performance.now();

    const maskCtx = maskCanvasRef.current.getContext("2d");

    const renderFrame = (now: number) => {
      const dt = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = now;
      shaderClockRef.current += dt;

      if (isPlayingRef.current) {
        const nextT = timelineRef.current + dt;
        if (nextT >= TOTAL_DURATION) {
          timelineRef.current = TOTAL_DURATION;
          setIsPlaying(false);
        } else {
          timelineRef.current = nextT;
        }
        setTimeline(timelineRef.current);

        // Emit subtle water ripples along the leading head of the ∞ curve during 3.6s -> 7.85s
        if (
          timelineRef.current > 3.65 &&
          timelineRef.current < 7.85 &&
          shaderClockRef.current - lastInfinityRippleRef.current > 0.22
        ) {
          lastInfinityRippleRef.current = shaderClockRef.current;
          const u = (timelineRef.current - 3.6) / (7.85 - 3.6);
          const pt = sampleInfinityCurve(Math.max(0, Math.min(1, u)));
          const uvX = (CARD_MARGIN_X + pt.x * CARD_W) / CANVAS_W;
          const uvY = (CARD_MARGIN_Y + pt.y * CARD_H) / CANVAS_H;
          pushRipple(uvX, uvY, 0.75);
        }
      }

      // Upload updated card base texture if changed
      if (cardTexDirtyRef.current && cardCanvasRef.current) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, cardTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          cardCanvasRef.current
        );
        cardTexDirtyRef.current = false;
      }

      // Update water mask canvas and upload to TEXTURE2
      if (maskCtx && userLayerCanvasRef.current && maskCanvasRef.current) {
        renderWaterMask(maskCtx, userLayerCanvasRef.current, timelineRef.current);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, maskTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          maskCanvasRef.current
        );
      }

      // Crack propagation happens between 0.35s and 2.6s (matching 00:01 -> 00:02 of 1.mp4)
      const crackProg = Math.max(
        0,
        Math.min(1, (timelineRef.current - 0.35) / 2.25)
      );

      gl.uniform1f(uTime, shaderClockRef.current);
      gl.uniform1f(uCrackProgress, crackProg);

      const ripples = ripplesRef.current;
      for (let i = 0; i < 12; i++) {
        if (i < ripples.length) {
          gl.uniform4f(
            uRipples[i],
            ripples[i].x,
            ripples[i].y,
            ripples[i].time,
            ripples[i].amp
          );
        } else {
          gl.uniform4f(uRipples[i], 0, 0, -10, 0);
        }
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      gl.deleteTexture(cardTex);
      gl.deleteTexture(crackTex);
      gl.deleteTexture(maskTex);
      gl.deleteProgram(program);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update palette & dark-mode shader uniforms reactively
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (!glCanvas) return;
    const gl = glCanvas.getContext("webgl");
    if (!gl) return;
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    if (!program) return;

    const paletteIdx =
      waterPalette === "float-ocean"
        ? 0
        : waterPalette === "bioluminescent"
        ? 1
        : 2;
    gl.uniform1i(gl.getUniformLocation(program, "u_waterPalette"), paletteIdx);
    gl.uniform1i(
      gl.getUniformLocation(program, "u_isDarkCard"),
      surfaceStyle === "float-navy" ? 1 : 0
    );
  }, [waterPalette, surfaceStyle]);

  // Paint water channel onto user layer canvas
  const paintUserWaterAt = useCallback(
    (uvX: number, uvY: number) => {
      const userCanvas = userLayerCanvasRef.current;
      if (!userCanvas) return;
      const ctx = userCanvas.getContext("2d");
      if (!ctx) return;

      const mx = uvX * MASK_W;
      const my = uvY * MASK_H;
      const r = (brushSize / 100) * 36 + 10;

      ctx.globalCompositeOperation = "screen";
      if (lastPaintPosRef.current) {
        const dx = mx - lastPaintPosRef.current.x;
        const dy = my - lastPaintPosRef.current.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(dist / 4));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          drawRadialBlob(
            ctx,
            lastPaintPosRef.current.x + dx * t,
            lastPaintPosRef.current.y + dy * t,
            r,
            r,
            0.9
          );
        }
      } else {
        drawRadialBlob(ctx, mx, my, r, r, 0.92);
      }
      lastPaintPosRef.current = { x: mx, y: my };
    },
    [brushSize]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const uvX = (e.clientX - rect.left) / rect.width;
    const uvY = (e.clientY - rect.top) / rect.height;
    isPointerDownRef.current = true;
    lastPaintPosRef.current = null;
    pushRipple(uvX, uvY, 1.15);

    if (interactionMode === "carve") {
      paintUserWaterAt(uvX, uvY);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const uvX = (e.clientX - rect.left) / rect.width;
    const uvY = (e.clientY - rect.top) / rect.height;

    // Subtle 3D perspective tilt
    const nx = (uvX - 0.5) * 2;
    const ny = (uvY - 0.5) * 2;
    setTilt({ rx: -ny * 4.5, ry: nx * 5.5 });

    if (isPointerDownRef.current) {
      pushRipple(uvX, uvY, 0.85);
      if (interactionMode === "carve") {
        paintUserWaterAt(uvX, uvY);
      }
    } else if (Math.random() < 0.28) {
      pushRipple(uvX, uvY, 0.45);
    }
  };

  const handlePointerUpOrLeave = () => {
    isPointerDownRef.current = false;
    lastPaintPosRef.current = null;
    setTilt({ rx: 0, ry: 0 });
  };

  const handleReset = () => {
    if (userLayerCanvasRef.current) {
      const ctx = userLayerCanvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, MASK_W, MASK_H);
    }
    timelineRef.current = 0;
    setTimeline(0);
    setIsPlaying(true);
  };

  const handleJumpToInfinity = () => {
    timelineRef.current = 8.0;
    setTimeline(8.0);
    setIsPlaying(false);
    pushRipple(0.46, 0.55, 1.2);
  };

  const currentPhaseLabel =
    timeline < 0.5
      ? "00:00 · Mineral Card & Coastal Mist"
      : timeline < 1.8
      ? "00:01 · Surface Fractures & Tide Surge"
      : timeline < 3.6
      ? "00:02–00:03 · Fracture Lagoons & Chip Erosion"
      : timeline < 7.9
      ? "00:04–00:07 · Carving the Infinity (∞) Water Channel"
      : "00:08 · Full Infinity (∞) Lagoon Complete";

  return (
    <div className="w-full space-y-8">
      {/* ─── MAIN INTERACTIVE CARD STAGE ─── */}
      <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b131e] shadow-[0_24px_70px_-15px_rgba(13,25,38,0.08)] dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Stage Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
              <Droplets className="size-3.5 text-sky-500" />
              <span>Float Water Shader · WebGL</span>
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {currentPhaseLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Interaction Mode Toggle */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setInteractionMode("carve")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  interactionMode === "carve"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Paintbrush className="size-3" />
                <span>Carve Water</span>
              </button>
              <button
                type="button"
                onClick={() => setInteractionMode("ripple")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  interactionMode === "ripple"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Waves className="size-3" />
                <span>Ripple Only</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleJumpToInfinity}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 transition-colors cursor-pointer"
              title="Jump to 00:08 Infinity (∞) State"
            >
              <InfinityIcon className="size-3.5" />
              <span>00:08 ∞ State</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Replay 00:00 -> 00:08 Sequence"
            >
              <RotateCcw className="size-3.5" />
              <span>Replay</span>
            </button>
          </div>
        </div>

        {/* Center Studio Backdrop + Interactive WebGL Card Canvas */}
        <div className="relative flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-8 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.06)_0%,transparent_70%)]">
          <div
            className="relative w-full max-w-[680px] transition-transform duration-200 ease-out"
            style={{
              transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
          >
            <canvas
              ref={glCanvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              className={`w-full h-auto drop-shadow-[0_28px_48px_rgba(13,25,38,0.22)] dark:drop-shadow-[0_28px_55px_rgba(0,0,0,0.65)] select-none touch-none ${
                interactionMode === "carve" ? "cursor-crosshair" : "cursor-pointer"
              }`}
            />
          </div>

          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium text-center">
            {interactionMode === "carve"
              ? "Click and drag anywhere across the card to carve custom water channels & trigger ripples"
              : "Move or click across the water channels to send 3D surface waves across the card"}
          </p>
        </div>

        {/* ─── VIDEO TIMELINE SCRUBBER BAR (00:00 -> 00:08) ─── */}
        <div className="px-6 py-4 border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (!isPlaying && timelineRef.current >= TOTAL_DURATION - 0.05) {
                timelineRef.current = 0;
                setTimeline(0);
              }
              setIsPlaying((prev) => !prev);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>{timeline >= TOTAL_DURATION - 0.05 ? "Replay 00:00" : "Play"}</span>
              </>
            )}
          </button>

          <div className="flex-1 w-full space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>00:0{Math.floor(timeline)}s</span>
              <div className="hidden md:flex items-center gap-4 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    timelineRef.current = 0.0;
                    setTimeline(0.0);
                  }}
                  className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                >
                  00:00 Edge Mist
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    timelineRef.current = 1.4;
                    setTimeline(1.4);
                  }}
                  className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                >
                  00:01 Surface Cracks
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    timelineRef.current = 3.2;
                    setTimeline(3.2);
                  }}
                  className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                >
                  00:03 Fracture Pools
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    timelineRef.current = 5.8;
                    setTimeline(5.8);
                  }}
                  className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                >
                  00:06 Right Loop
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    timelineRef.current = 8.0;
                    setTimeline(8.0);
                  }}
                  className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                >
                  00:08 Full ∞ Lagoon
                </button>
              </div>
              <span>00:08s</span>
            </div>

            <input
              type="range"
              min={0}
              max={TOTAL_DURATION}
              step={0.02}
              value={timeline}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setIsPlaying(false);
                timelineRef.current = v;
                setTimeline(v);
              }}
              aria-label="Animation timeline scrubber"
              className="w-full accent-sky-600 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-700"
            />
          </div>
        </div>
      </div>

      {/* ─── SPEND REQUEST CARD CUSTOMIZER & SHADER CONTROLS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Float Spend Request (new_card) Inspector */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b131e] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#0d1926] dark:bg-sky-500/20 text-white dark:text-sky-300 flex items-center justify-center">
                <CreditCard className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Float Spend Request · Card Preview Spec
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle between the minimal video layout and Float&apos;s{" "}
                  <code className="font-mono text-[11px]">?type=new_card</code> preview
                </p>
              </div>
            </div>
          </div>

          {/* Layout Variant Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Card Component Layout
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLayoutVariant("video-minimal")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  layoutVariant === "video-minimal"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Minimal Video Spec (Float Glyph)
              </button>
              <button
                type="button"
                onClick={() => setLayoutVariant("spend-request")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  layoutVariant === "spend-request"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Spend Request (new_card)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="FILBERT MANGUNDAP"
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Quick Name Preset
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCardholderName("FILBERT MANGUNDAP")}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    cardholderName.toUpperCase() === "FILBERT MANGUNDAP"
                      ? "bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Filbert M.
                </button>
                <button
                  type="button"
                  onClick={() => setCardholderName("BURAK ASLAN")}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    cardholderName.toUpperCase() === "BURAK ASLAN"
                      ? "bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Burak Aslan (Video)
                </button>
              </div>
            </div>
          </div>

          {layoutVariant === "spend-request" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Spend Request Purpose
                </label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Monthly Limit
                </label>
                <input
                  type="text"
                  value={spendLimit}
                  onChange={(e) => setSpendLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Currency &amp; Network
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["CAD", "USD"] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        currency === curr
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Water Shader & Card Material Controls */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b131e] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Sliders className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Water &amp; Surface Material Levers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize the fractured stone substrate, bathymetry palette &amp; brush size
                </p>
              </div>
            </div>
          </div>

          {/* Surface Material Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Card Surface Material
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "limestone", label: "Weathered Stone", swatch: "#D6D8D5" },
                  { id: "glacial-ice", label: "Float Glacial Ice", swatch: "#EBF3FA" },
                  { id: "float-navy", label: "Float Midnight", swatch: "#111F30" },
                ] as const
              ).map((mat) => (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => setSurfaceStyle(mat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    surfaceStyle === mat.id
                      ? "bg-sky-50/80 dark:bg-sky-950/50 border-sky-400 dark:border-sky-600 text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span
                    className="size-3.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: mat.swatch }}
                  />
                  <span className="truncate">{mat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Water Palette Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Water Bathymetry &amp; Caustics
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "float-ocean", label: "Float Ocean", swatch: "#0284C7" },
                  { id: "bioluminescent", label: "Bioluminescent", swatch: "#06B6D4" },
                  { id: "cenote-jade", label: "Cenote Jade", swatch: "#0D9488" },
                ] as const
              ).map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setWaterPalette(pal.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    waterPalette === pal.id
                      ? "bg-sky-50/80 dark:bg-sky-950/50 border-sky-400 dark:border-sky-600 text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span
                    className="size-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: pal.swatch }}
                  />
                  <span className="truncate">{pal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brush Size Slider */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Interactive Water Carve Brush Width
              </span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">
                {brushSize}px
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={64}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
