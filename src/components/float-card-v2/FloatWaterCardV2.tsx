"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  RotateCcw,
  CreditCard,
  Sliders,
  ShieldCheck,
  Eye,
  Waves,
  Cpu,
} from "lucide-react";
import { prepareShader } from "@vgpu/wgsl/prepare";
import { clock, frameLoop, init, surface, effect, sampler, texture, type Gpu } from "vgpu";

/* ============================================================================
 * 1. WGSL SHADER (VGPU / WEBGPU PIPELINE)
 * Replicates https://vgpu.sh/examples/holographic-card (Image 1)
 * with the Float Card face (Image 2) and subtle transparent water (no blue dye)
 * ============================================================================ */

const WGSL_SOURCE = `
struct Params {
  resolution: vec2f,
  tilt: vec2f,
  pointer: vec2f,
  hover: f32,
  time: f32,
  waterProgress: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var cardTex: texture_2d<f32>;
@group(0) @binding(2) var linear: sampler;

fn roundedBox(p: vec2f, halfSize: vec2f, radius: f32) -> f32 {
  let q = abs(p) - halfSize + radius;
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

fn stroke(distance: f32, width: f32, aa: f32) -> f32 {
  return 1.0 - smoothstep(width, width + aa, abs(distance));
}

// Approximate visible wavelengths in micrometers with smooth display RGB responses
fn wavelengthColor(wavelength: f32) -> vec3f {
  let response = (vec3f(wavelength) - vec3f(0.610, 0.545, 0.460)) / vec3f(0.045, 0.038, 0.032);
  let visible = smoothstep(0.380, 0.410, wavelength) * (1.0 - smoothstep(0.700, 0.780, wavelength));
  return exp(-0.5 * response * response) * visible;
}

// Reflection grating approximation: m * wavelength = d * dot(L + V, across)
fn diffraction(across: vec2f, lightAndView: vec2f, spacing: f32) -> vec3f {
  let pathDifference = spacing * abs(dot(lightAndView, across));
  let along = dot(lightAndView, vec2f(-across.y, across.x));
  let envelope = exp(-along * along / 0.36);
  var reflected = vec3f(0.0);
  for (var order = 1; order <= 3; order++) {
    let m = f32(order);
    reflected += wavelengthColor(pathDifference / m) / (m * m);
  }
  return reflected * envelope;
}

// Broad, art-directed pearlescence underneath the finer diffraction detail
fn pearlColor(phase: f32) -> vec3f {
  return vec3f(0.55, 0.52, 0.64) + vec3f(0.43, 0.40, 0.34)
    * cos(6.2831853 * (phase + vec3f(0.05, 0.38, 0.63)));
}

fn grain(point: vec2f) -> f32 {
  let p = vec2u(abs(point) * 2400.0);
  var n = (p.x * 1597334677u) ^ (p.y * 3812015801u);
  n = (n ^ (n >> 16u)) * 2246822519u;
  return f32(n & 1023u) / 1023.0 - 0.5;
}

// Exact wavy contour lines from vgpu.sh/examples/holographic-card (Image 1)
fn etchedPhase(p: vec2f) -> f32 {
  let warp = vec2f(
    sin(p.y * 7.0 + sin(p.x * 4.0)) * 0.085,
    sin(p.x * 6.0 - p.y * 3.0) * 0.07
  );
  let q = p + warp - vec2f(0.12, 0.06);
  let radius = length(q * vec2f(1.0, 0.76));
  return radius * 142.0 + sin(atan2(q.y, q.x) * 3.0 + radius * 8.0) * 1.7;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let resolution = max(params.resolution, vec2f(1.0));
  let scale = min(resolution.y, resolution.x * 1.25);
  let screen = (uv - 0.5) * resolution / scale * 1.85;

  let sx = sin(params.tilt.y);
  let cx = cos(params.tilt.y);
  let sy = sin(params.tilt.x);
  let cy = cos(params.tilt.x);
  let right = vec3f(cy, 0.0, -sy);
  let down = vec3f(sy * sx, cx, cy * sx);
  let normal = cross(right, down);
  let eye = vec3f(0.0, 0.0, 4.5);
  let ray = normalize(vec3f(screen, -4.5));
  let hit = eye - ray * (dot(eye, normal) / dot(ray, normal));
  let p = vec2f(dot(hit, right), dot(hit, down));
  let aa = max(length(fwidth(p)), 0.0006);

  // Landscape card dimensions: ratio ~ 1.54:1 (Image 2)
  let halfW = 0.84;
  let halfH = 0.545;
  let radius = 0.048;
  let edge = roundedBox(p, vec2f(halfW, halfH), radius);
  let silhouette = 1.0 - smoothstep(-aa, aa, edge);

  // Soft ambient card shadow in the dark studio
  let shadow = exp(-max(roundedBox(screen - vec2f(0.015, 0.04), vec2f(halfW, halfH), radius), 0.0) * 20.0);
  var background = vec3f(0.02, 0.025, 0.035) * (1.0 - 0.75 * shadow);

  // Card normalized UV [0, 1]
  let cardUv = vec2f(
    (p.x / halfW) * 0.5 + 0.5,
    (p.y / halfH) * 0.5 + 0.5
  );

  // ─── 1. SUBTLE TRANSPARENT WATER WAVE LAYER (PLAYS ONCE) ───
  // Clear, pristine liquid wave washing diagonally across the card (no blue dye)
  let waveFront = (p.x * 0.72 + p.y * 0.45) - (params.waterProgress * 2.4 - 1.2);
  let ripple1 = sin(waveFront * 24.0 - params.time * 3.5) * exp(-abs(waveFront) * 3.2);
  let ripple2 = sin((p.x - p.y) * 14.0 + params.time * 1.8) * 0.25;
  let waveActive = smoothstep(1.0, 0.0, waveFront) * (1.0 - smoothstep(0.85, 1.0, params.waterProgress) * 0.35);
  let waterHeight = (ripple1 + ripple2) * 0.014 * waveActive;

  let dWaterX = dpdx(waterHeight) * 32.0;
  let dWaterY = dpdy(waterHeight) * 32.0;
  let waterNormal = normalize(vec3f(-dWaterX, -dWaterY, 1.0));

  // Refract the card texture beneath the clear water
  let refractUv = clamp(cardUv + waterNormal.xy * 0.014 * waveActive, vec2f(0.002), vec2f(0.998));
  var cardColor = textureSampleLevel(cardTex, linear, refractUv, 0.0).rgb;

  // Pure transparent water specular glints (no blue color, only clear sunlight refraction)
  let lightCenter = params.pointer * vec2f(halfW, halfH);
  let delta = p - lightCenter;
  let lightDirection = normalize(vec3f(lightCenter, 1.2) - hit);
  let viewDirection = normalize(eye - hit);

  let waterRefl = reflect(-viewDirection, vec3f(waterNormal.xy, 1.0));
  let waterSpec = pow(max(dot(waterRefl, lightDirection), 0.0), 36.0) * 0.45 * waveActive;
  cardColor += vec3f(0.98, 0.99, 1.0) * waterSpec;

  // Subtle transparent caustic shimmer under the clear water film
  let caustic = pow(max(0.0, sin(p.x * 30.0 + params.time * 2.8) * cos(p.y * 30.0 - params.time * 2.2)), 2.0) * 0.08 * waveActive;
  cardColor += vec3f(1.0) * caustic;

  // ─── 2. VGPU HOLOGRAPHIC FOIL & IRIDESCENT DIFFRACTION ON HOVER (Image 1) ───
  let hover = clamp(params.hover, 0.0, 1.0);
  let sweepDistance = delta.x * 0.72 + delta.y * 0.52 + sin(p.y * 4.0 + p.x * 3.0) * 0.08;
  let bandDistance = sweepDistance / 0.36;
  let lightBand = exp(-bandDistance * bandDistance);
  let glintDistance = sweepDistance / 0.085;
  let glint = exp(-glintDistance * glintDistance);
  let spotlight = exp(-dot(delta * vec2f(1.05, 0.72), delta * vec2f(1.05, 0.72)) * 2.6);
  let light = lightBand * spotlight * hover;

  let lightAndView = vec2f(dot(lightDirection + viewDirection, right), dot(lightDirection + viewDirection, down));
  let illumination = max(dot(normal, lightDirection), 0.0) * max(dot(normal, viewDirection), 0.0);

  // Wavy holographic contour lines (Image 1 pattern)
  let contour = etchedPhase(p);
  let dx = dpdx(p);
  let dy = dpdy(p);
  let gradient = vec2f(dpdx(contour) * dy.y - dpdy(contour) * dx.y, dpdy(contour) * dx.x - dpdx(contour) * dy.x);
  let across = gradient / max(length(gradient), 0.00000001);
  let diffCol = diffraction(across, lightAndView, 1.65) * illumination;
  let contours = stroke(sin(contour), 0.08, min(fwidth(contour), 1.0));
  let pearlPhase = dot(lightAndView, vec2f(0.48, -0.32)) + p.y * 0.32 + contour * 0.003;
  let pearl = pearlColor(pearlPhase);

  let noise = grain(p + vec2f(1.8));
  let sparkle = pow(max(noise + 0.5, 0.0), 22.0) * glint * spotlight * hover;

  // Composite holographic iridescence onto the card face on hover (Image 1 pattern)
  let holoReveal = hover * (0.05 + 0.35 * spotlight + light * 1.2);
  let rainbow = pearl * 0.95 + diffCol * 0.65;
  let foilBlend = mix(cardColor * 0.85 + rainbow * 0.28, rainbow * 1.15, contours);
  cardColor = mix(cardColor, foilBlend, holoReveal * 0.82);
  cardColor += pearl * sparkle * 0.28;
  cardColor += light * (vec3f(0.06) + pearl * 0.16);

  // Corner registration ticks (+) and micro-dots from Image 1
  let guide = abs(p) - vec2f(halfW - 0.08, halfH - 0.08);
  let horizontal = stroke(guide.y, 0.0006, aa * 0.5) * (1.0 - smoothstep(0.012, 0.017, abs(guide.x)));
  let vertical = stroke(guide.x, 0.0006, aa * 0.5) * (1.0 - smoothstep(0.012, 0.017, abs(guide.y)));
  cardColor += max(horizontal, vertical) * hover * (0.15 + light * 0.35);

  // Card rim bevel highlight
  let rim = stroke(edge + 0.002, 0.0008, aa * 0.7);
  let rimLight = pow(max(0.0, 1.0 - length(delta) * 0.65), 3.0) * hover;
  cardColor = mix(cardColor, cardColor * 0.85 + (pearl * 0.7 + vec3f(0.3)) * rimLight * 0.5, rim);

  return vec4f(mix(background, cardColor, silhouette), 1.0);
}
`;

/* ============================================================================
 * 2. GLSL WEBGPU FALLBACK SHADER (Runs identically on WebGL 1/2)
 * ============================================================================ */

const GLSL_VS = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const GLSL_FS = `
precision highp float;
varying vec2 v_uv;

uniform vec2 u_resolution;
uniform vec2 u_tilt;
uniform vec2 u_pointer;
uniform float u_hover;
uniform float u_time;
uniform float u_waterProgress;
uniform sampler2D u_cardTex;

float roundedBox(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

float stroke(float distance, float width, float aa) {
  return 1.0 - smoothstep(width, width + aa, abs(distance));
}

vec3 wavelengthColor(float wavelength) {
  vec3 response = (vec3(wavelength) - vec3(0.610, 0.545, 0.460)) / vec3(0.045, 0.038, 0.032);
  float visible = smoothstep(0.380, 0.410, wavelength) * (1.0 - smoothstep(0.700, 0.780, wavelength));
  return exp(-0.5 * response * response) * visible;
}

vec3 diffraction(vec2 across, vec2 lightAndView, float spacing) {
  float pathDifference = spacing * abs(dot(lightAndView, across));
  float along = dot(lightAndView, vec2(-across.y, across.x));
  float envelope = exp(-along * along / 0.36);
  vec3 reflected = vec3(0.0);
  for (int order = 1; order <= 3; order++) {
    float m = float(order);
    reflected += wavelengthColor(pathDifference / m) / (m * m);
  }
  return reflected * envelope;
}

vec3 pearlColor(float phase) {
  return vec3(0.55, 0.52, 0.64) + vec3(0.43, 0.40, 0.34)
    * cos(6.2831853 * (phase + vec3(0.05, 0.38, 0.63)));
}

float etchedPhase(vec2 p) {
  vec2 warp = vec2(
    sin(p.y * 7.0 + sin(p.x * 4.0)) * 0.085,
    sin(p.x * 6.0 - p.y * 3.0) * 0.07
  );
  vec2 q = p + warp - vec2(0.12, 0.06);
  float radius = length(q * vec2(1.0, 0.76));
  return radius * 142.0 + sin(atan(q.y, q.x) * 3.0 + radius * 8.0) * 1.7;
}

void main() {
  vec2 uv = v_uv;
  vec2 resolution = max(u_resolution, vec2(1.0));
  float scale = min(resolution.y, resolution.x * 1.25);
  vec2 screen = (uv - 0.5) * resolution / scale * 1.85;

  float sx = sin(u_tilt.y);
  float cx = cos(u_tilt.y);
  float sy = sin(u_tilt.x);
  float cy = cos(u_tilt.x);
  vec3 right = vec3(cy, 0.0, -sy);
  vec3 down = vec3(sy * sx, cx, cy * sx);
  vec3 normal = cross(right, down);
  vec3 eye = vec3(0.0, 0.0, 4.5);
  vec3 ray = normalize(vec3(screen, -4.5));
  vec3 hit = eye - ray * (dot(eye, normal) / dot(ray, normal));
  vec2 p = vec2(dot(hit, right), dot(hit, down));
  float aa = 0.0018;

  vec2 halfSize = vec2(0.84, 0.545);
  float radius = 0.048;
  float edge = roundedBox(p, halfSize, radius);
  float silhouette = 1.0 - smoothstep(-aa, aa, edge);

  float shadow = exp(-max(roundedBox(screen - vec2(0.015, 0.04), halfSize, radius), 0.0) * 20.0);
  vec3 background = vec3(0.02, 0.025, 0.035) * (1.0 - 0.75 * shadow);

  vec2 cardUv = vec2(
    (p.x / halfSize.x) * 0.5 + 0.5,
    (p.y / halfSize.y) * 0.5 + 0.5
  );

  // Subtle transparent water wave (no blue dye)
  float waveFront = (p.x * 0.72 + p.y * 0.45) - (u_waterProgress * 2.4 - 1.2);
  float ripple1 = sin(waveFront * 24.0 - u_time * 3.5) * exp(-abs(waveFront) * 3.2);
  float ripple2 = sin((p.x - p.y) * 14.0 + u_time * 1.8) * 0.25;
  float waveActive = smoothstep(1.0, 0.0, waveFront) * (1.0 - smoothstep(0.85, 1.0, u_waterProgress) * 0.35);
  float waterHeight = (ripple1 + ripple2) * 0.014 * waveActive;

  vec2 waterNormal = normalize(vec2(-waterHeight * 3.0, 1.0));
  vec2 refractUv = clamp(cardUv + waterNormal * 0.012 * waveActive, vec2(0.002), vec2(0.998));
  vec3 cardColor = texture2D(u_cardTex, refractUv).rgb;

  // Specular glint on clear water
  vec2 lightCenter = u_pointer * halfSize;
  vec2 delta = p - lightCenter;
  vec3 lightDirection = normalize(vec3(lightCenter, 1.2) - hit);
  vec3 viewDirection = normalize(eye - hit);

  vec3 waterRefl = reflect(-viewDirection, vec3(waterNormal * 0.5, 1.0));
  float waterSpec = pow(max(dot(waterRefl, lightDirection), 0.0), 32.0) * 0.42 * waveActive;
  cardColor += vec3(0.98, 0.99, 1.0) * waterSpec;

  // Holographic diffraction on hover
  float hover = clamp(u_hover, 0.0, 1.0);
  float sweepDistance = delta.x * 0.72 + delta.y * 0.52 + sin(p.y * 4.0 + p.x * 3.0) * 0.08;
  float bandDistance = sweepDistance / 0.36;
  float lightBand = exp(-bandDistance * bandDistance);
  float glint = exp(-pow(sweepDistance / 0.085, 2.0));
  float spotlight = exp(-dot(delta * vec2(1.05, 0.72), delta * vec2(1.05, 0.72)) * 2.6);
  float light = lightBand * spotlight * hover;

  vec2 lightAndView = vec2(dot(lightDirection + viewDirection, right), dot(lightDirection + viewDirection, down));
  float illumination = max(dot(normal, lightDirection), 0.0) * max(dot(normal, viewDirection), 0.0);

  float contour = etchedPhase(p);
  vec2 across = normalize(vec2(cos(contour), sin(contour)));
  vec3 diffCol = diffraction(across, lightAndView, 1.65) * illumination;
  float contours = stroke(sin(contour), 0.08, 0.15);
  float pearlPhase = dot(lightAndView, vec2(0.48, -0.32)) + p.y * 0.32 + contour * 0.003;
  vec3 pearl = pearlColor(pearlPhase);

  float holoReveal = hover * (0.05 + 0.35 * spotlight + light * 1.2);
  vec3 rainbow = pearl * 0.95 + diffCol * 0.65;
  vec3 foilBlend = mix(cardColor * 0.85 + rainbow * 0.28, rainbow * 1.15, contours);
  cardColor = mix(cardColor, foilBlend, holoReveal * 0.82);
  cardColor += light * (vec3(0.06) + pearl * 0.16);

  // Registration marks
  vec2 guide = abs(p) - (halfSize - 0.08);
  float horizontal = stroke(guide.y, 0.0006, 0.001) * (1.0 - smoothstep(0.012, 0.017, abs(guide.x)));
  float vertical = stroke(guide.x, 0.0006, 0.001) * (1.0 - smoothstep(0.012, 0.017, abs(guide.y)));
  cardColor += max(horizontal, vertical) * hover * (0.15 + light * 0.35);

  float rim = stroke(edge + 0.002, 0.0008, 0.001);
  cardColor = mix(cardColor, cardColor * 0.85 + (pearl * 0.7 + vec3(0.3)) * 0.4, rim * hover);

  gl_FragColor = vec4(mix(background, cardColor, silhouette), 1.0);
}
`;

/* ============================================================================
 * 3. CARD BASE TEXTURE RENDERER (Image 2)
 * Renders the clean Float corporate card with Canada emblem, VISA Purchasing,
 * Float F-watermark, and crisp cardholder typography
 * ============================================================================ */

const CARD_TEXTURE_W = 1152;
const CARD_TEXTURE_H = 746;

function drawCardTexture(
  ctx: CanvasRenderingContext2D,
  options: {
    cardholderName: string;
    spendLimit: string;
    baseImage?: HTMLImageElement | null;
  }
) {
  ctx.clearRect(0, 0, CARD_TEXTURE_W, CARD_TEXTURE_H);

  // If the extracted Image 2 base image is available, draw it 2x crisp!
  if (options.baseImage && options.baseImage.complete && options.baseImage.naturalWidth > 0) {
    ctx.drawImage(options.baseImage, 0, 0, CARD_TEXTURE_W, CARD_TEXTURE_H);
  } else {
    // Vector fallback matching Image 2 exactly
    const r = 48;
    ctx.beginPath();
    ctx.roundRect(0, 0, CARD_TEXTURE_W, CARD_TEXTURE_H, r);
    ctx.fillStyle = "#ECEEF1";
    ctx.fill();

    // Large white Float F watermark
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    // Central chevron column and facets
    ctx.moveTo(560, 0);
    ctx.lineTo(820, 160);
    ctx.lineTo(820, 240);
    ctx.lineTo(560, 360);
    ctx.lineTo(560, 480);
    ctx.lineTo(820, 320);
    ctx.lineTo(820, 400);
    ctx.lineTo(560, 560);
    ctx.lineTo(560, CARD_TEXTURE_H);
    ctx.lineTo(440, CARD_TEXTURE_H);
    ctx.lineTo(440, 520);
    ctx.lineTo(380, 560);
    ctx.lineTo(380, 440);
    ctx.lineTo(440, 400);
    ctx.lineTo(440, 240);
    ctx.lineTo(380, 280);
    ctx.lineTo(380, 160);
    ctx.lineTo(440, 120);
    ctx.lineTo(440, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Top-Left Float logo & wordmark
    ctx.fillStyle = "#181B1E";
    ctx.font = '700 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("Float", 195, 128);

    // Float Icon
    ctx.save();
    ctx.translate(118, 86);
    ctx.fillStyle = "#181B1E";
    // Top bar
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(26, 0);
    ctx.lineTo(48, 0);
    ctx.lineTo(22, 36);
    ctx.closePath();
    ctx.fill();
    // Bottom bar
    ctx.beginPath();
    ctx.moveTo(0, 68);
    ctx.lineTo(26, 32);
    ctx.lineTo(48, 32);
    ctx.lineTo(22, 68);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Top-Right Canadian Flag emblem
    ctx.save();
    ctx.translate(1010, 108);
    ctx.strokeStyle = "#D80621";
    ctx.lineWidth = 9;
    // Left parenthesis
    ctx.beginPath();
    ctx.arc(-28, 0, 32, Math.PI * 0.72, Math.PI * 1.28);
    ctx.stroke();
    // Right parenthesis
    ctx.beginPath();
    ctx.arc(28, 0, 32, -Math.PI * 0.28, Math.PI * 0.28);
    ctx.stroke();
    // Center maple leaf indicator
    ctx.fillStyle = "#D80621";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bottom-Right VISA Purchasing
    ctx.fillStyle = "#0A2569";
    ctx.font = 'italic 800 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("VISA", 870, 620);
    ctx.fillStyle = "#334155";
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("Purchasing", 870, 660);
  }

  // Overlay Cardholder Name and Spend Limit (Image 2 - lower left)
  ctx.save();
  ctx.fillStyle = "#262A30";
  ctx.font = '700 32px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.letterSpacing = "1.5px";
  ctx.fillText(options.cardholderName.toUpperCase(), 118, 616);

  ctx.fillStyle = "#5A626E";
  ctx.font = '600 20px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.letterSpacing = "1.2px";
  ctx.fillText(options.spendLimit.toUpperCase(), 118, 656);
  ctx.restore();
}

/* ============================================================================
 * 4. FLOAT WATER CARD V2 MAIN COMPONENT
 * ============================================================================ */

export function FloatWaterCardV2({
  cardholderName: initialName = "FILBERT MANGUNDAP",
  spendLimit: initialLimit = "$5,000.00 CAD / MO",
}: {
  cardholderName?: string;
  spendLimit?: string;
}) {
  const [cardholderName, setCardholderName] = useState(initialName);
  const [spendLimit, setSpendLimit] = useState(initialLimit);
  const [backendType, setBackendType] = useState<"WebGPU (VGPU)" | "WebGL">("WebGPU (VGPU)");
  const [isWaterPlaying, setIsWaterPlaying] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const waterProgressRef = useRef(0);
  const waterDurationRef = useRef(3.4); // Plays once over 3.4 seconds
  const cardDirtyRef = useRef(true);

  // Update card canvas whenever text changes
  const updateCardTextureCanvas = useCallback(() => {
    if (!cardCanvasRef.current) {
      cardCanvasRef.current = document.createElement("canvas");
      cardCanvasRef.current.width = CARD_TEXTURE_W;
      cardCanvasRef.current.height = CARD_TEXTURE_H;
    }
    const ctx = cardCanvasRef.current.getContext("2d");
    if (!ctx) return;
    drawCardTexture(ctx, {
      cardholderName: cardholderName || "FILBERT MANGUNDAP",
      spendLimit: spendLimit || "$5,000.00 CAD / MO",
      baseImage: baseImgRef.current,
    });
    cardDirtyRef.current = true;
  }, [cardholderName, spendLimit]);

  // Load Image 2 base asset
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/float-card-v2-base.png";
    img.onload = () => {
      baseImgRef.current = img;
      updateCardTextureCanvas();
      cardDirtyRef.current = true;
    };
  }, [updateCardTextureCanvas]);

  useEffect(() => {
    updateCardTextureCanvas();
  }, [updateCardTextureCanvas]);

  // Replay one-time water wave
  const handleReplayWater = () => {
    waterProgressRef.current = 0;
    setIsWaterPlaying(true);
  };

  // ─────────────────────────────────────────────────────────
  // VGPU (WEBGPU) + WEBGL DUAL-ENGINE RENDERER LIFECYCLE
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let removeListeners = () => {};

    // Initial card render
    updateCardTextureCanvas();

    // Check WebGPU availability and attempt VGPU init
    const runRenderer = async () => {
      const hasWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;

      if (hasWebGpu) {
        try {
          const gpu = await init();
          if (disposed) {
            gpu.dispose();
            return;
          }
          setBackendType("WebGPU (VGPU)");

          const output = surface(gpu, canvas, { dpr: [1, 2] });
          const cardTexture = texture(gpu, {
            kind: "2d",
            size: [CARD_TEXTURE_W, CARD_TEXTURE_H],
            format: "rgba8unorm",
            usage: ["texture_binding", "copy_dst", "render_attachment"],
            label: "float-card-texture",
          });

          // Upload card canvas to WebGPU texture
          const uploadCardTex = () => {
            if (cardCanvasRef.current) {
              gpu.gpu.queue.copyExternalImageToTexture(
                { source: cardCanvasRef.current },
                { texture: cardTexture.gpu },
                [CARD_TEXTURE_W, CARD_TEXTURE_H]
              );
              cardDirtyRef.current = false;
            }
          };
          uploadCardTex();

          const prepared = prepareShader(WGSL_SOURCE);
          const shader = effect(gpu, prepared, {
            label: "float-holographic-water-card",
            set: {
              params: {
                resolution: output.size,
                tilt: [0, 0],
                pointer: [0.2, -0.25],
                hover: 0,
                time: 0,
                waterProgress: 0,
              },
              cardTex: cardTexture,
              linear: sampler(gpu, { minFilter: "linear", magFilter: "linear" }),
            },
          });

          await shader.compile({ colors: [output.format] });
          if (disposed) return;

          let targetHover = 0;
          let pointerX = 0;
          let pointerY = 0;
          let tiltX = 0;
          let tiltY = 0;
          let hover = 0;
          let lightX = 0.2;
          let lightY = -0.25;

          // Pointer interaction: smoothly drives holographic light sweep & 3D tilt
          const move = (e: PointerEvent) => {
            if (!e.isPrimary) return;
            const rect = canvas.getBoundingClientRect();
            const scale = Math.min(rect.height, rect.width * 1.25);
            pointerX = (((e.clientX - rect.left) - rect.width / 2) / Math.max(1, scale)) * 1.85 / 0.84;
            pointerY = (((e.clientY - rect.top) - rect.height / 2) / Math.max(1, scale)) * 1.85 / 0.545;
            const distanceX = Math.max(0, Math.abs(pointerX) - 1) * scale * 0.84 / 1.85;
            const distanceY = Math.max(0, Math.abs(pointerY) - 1) * scale * 0.545 / 1.85;
            const proximity = Math.max(0, 1 - Math.hypot(distanceX, distanceY) / (scale * 0.55));
            targetHover = proximity * proximity * (3 - 2 * proximity);
          };
          const leave = () => {
            targetHover = 0;
          };

          canvas.addEventListener("pointermove", move, { passive: true });
          canvas.addEventListener("pointerdown", move, { passive: true });
          canvas.addEventListener("pointerleave", leave);
          canvas.addEventListener("pointercancel", leave);

          const time = clock(gpu);

          frameLoop(
            gpu,
            (currentFrame) => {
              if (cardDirtyRef.current) {
                uploadCardTex();
              }

              // Advance water progress ONCE over ~3.4 seconds
              if (waterProgressRef.current < 1.0) {
                waterProgressRef.current += Math.min(time.deltaTime, 0.05) / waterDurationRef.current;
                if (waterProgressRef.current >= 1.0) {
                  waterProgressRef.current = 1.0;
                  setIsWaterPlaying(false);
                }
              }

              const targetX = Math.max(-1, Math.min(1, pointerX)) * 0.16 * targetHover;
              const targetY = -Math.max(-1, Math.min(1, pointerY)) * 0.12 * targetHover;
              const blend = 1 - Math.exp(-10 * Math.min(time.deltaTime, 0.1));
              tiltX += (targetX - tiltX) * blend;
              tiltY += (targetY - tiltY) * blend;
              hover += (targetHover - hover) * blend;

              if (targetHover > 0) {
                lightX += (pointerX - lightX) * blend;
                lightY += (pointerY - lightY) * blend;
              }

              shader.set({
                params: {
                  resolution: output.size,
                  tilt: [tiltX, tiltY],
                  pointer: [lightX, lightY],
                  hover,
                  time: time.time,
                  waterProgress: waterProgressRef.current,
                },
              });

              currentFrame.pass(output, shader);
            },
            { fps: 60 }
          );

          removeListeners = () => {
            canvas.removeEventListener("pointermove", move);
            canvas.removeEventListener("pointerdown", move);
            canvas.removeEventListener("pointerleave", leave);
            canvas.removeEventListener("pointercancel", leave);
            gpu.dispose();
          };

          return;
        } catch (err) {
          console.warn("VGPU WebGPU initialization failed, falling back to WebGL:", err);
        }
      }

      // ─────────────────────────────────────────────────────────
      // WEBGL FALLBACK PIPELINE
      // ─────────────────────────────────────────────────────────
      setBackendType("WebGL");
      const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
      if (!gl) return;

      const createShader = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.error("GLSL shader compilation error:", gl.getShaderInfoLog(s));
        }
        return s;
      };

      const prog = gl.createProgram()!;
      gl.attachShader(prog, createShader(gl.VERTEX_SHADER, GLSL_VS));
      gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, GLSL_FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("GLSL program linking error:", gl.getProgramInfoLog(prog));
      }
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const cardTex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cardTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const uploadGlCard = () => {
        if (cardCanvasRef.current) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, cardTex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cardCanvasRef.current);
          cardDirtyRef.current = false;
        }
      };
      uploadGlCard();

      const uRes = gl.getUniformLocation(prog, "u_resolution");
      const uTilt = gl.getUniformLocation(prog, "u_tilt");
      const uPointer = gl.getUniformLocation(prog, "u_pointer");
      const uHover = gl.getUniformLocation(prog, "u_hover");
      const uTime = gl.getUniformLocation(prog, "u_time");
      const uWaterProgress = gl.getUniformLocation(prog, "u_waterProgress");
      const uCardTex = gl.getUniformLocation(prog, "u_cardTex");
      gl.uniform1i(uCardTex, 0);

      const initRect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round((initRect.width || 720) * dpr));
      canvas.height = Math.max(1, Math.round((initRect.height || 467) * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);

      let targetHover = 0;
      let pointerX = 0;
      let pointerY = 0;
      let tiltX = 0;
      let tiltY = 0;
      let hover = 0;
      let lightX = 0.2;
      let lightY = -0.25;

      const move = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scale = Math.min(rect.height, rect.width * 1.25);
        pointerX = (((e.clientX - rect.left) - rect.width / 2) / Math.max(1, scale)) * 1.85 / 0.84;
        pointerY = (((e.clientY - rect.top) - rect.height / 2) / Math.max(1, scale)) * 1.85 / 0.545;
        const distanceX = Math.max(0, Math.abs(pointerX) - 1) * scale * 0.84 / 1.85;
        const distanceY = Math.max(0, Math.abs(pointerY) - 1) * scale * 0.545 / 1.85;
        const proximity = Math.max(0, 1 - Math.hypot(distanceX, distanceY) / (scale * 0.55));
        targetHover = proximity * proximity * (3 - 2 * proximity);
      };
      const leave = () => {
        targetHover = 0;
      };

      canvas.addEventListener("pointermove", move, { passive: true });
      canvas.addEventListener("pointerdown", move, { passive: true });
      canvas.addEventListener("pointerleave", leave);

      let lastT = performance.now();
      let rafId = 0;

      const render = (now: number) => {
        if (disposed) return;
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;

        if (cardDirtyRef.current) {
          uploadGlCard();
        }

        if (waterProgressRef.current < 1.0) {
          waterProgressRef.current += dt / waterDurationRef.current;
          if (waterProgressRef.current >= 1.0) {
            waterProgressRef.current = 1.0;
            setIsWaterPlaying(false);
          }
        }

        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== Math.round(rect.width * window.devicePixelRatio)) {
          canvas.width = Math.round(rect.width * window.devicePixelRatio);
          canvas.height = Math.round(rect.height * window.devicePixelRatio);
          gl.viewport(0, 0, canvas.width, canvas.height);
        }

        const blend = 1 - Math.exp(-10 * dt);
        tiltX += (pointerX * 0.16 * targetHover - tiltX) * blend;
        tiltY += (-pointerY * 0.12 * targetHover - tiltY) * blend;
        hover += (targetHover - hover) * blend;
        if (targetHover > 0) {
          lightX += (pointerX - lightX) * blend;
          lightY += (pointerY - lightY) * blend;
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, cardTex);
        gl.uniform1i(uCardTex, 0);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uTilt, tiltX, tiltY);
        gl.uniform2f(uPointer, lightX, lightY);
        gl.uniform1f(uHover, hover);
        gl.uniform1f(uTime, now * 0.001);
        gl.uniform1f(uWaterProgress, waterProgressRef.current);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        rafId = requestAnimationFrame(render);
      };

      rafId = requestAnimationFrame(render);

      removeListeners = () => {
        cancelAnimationFrame(rafId);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerdown", move);
        canvas.removeEventListener("pointerleave", leave);
        gl.deleteTexture(cardTex);
        gl.deleteProgram(prog);
      };
    };

    void runRenderer();

    return () => {
      disposed = true;
      removeListeners();
    };
  }, [updateCardTextureCanvas]);

  return (
    <div className="w-full space-y-8">
      {/* ─── CARD STAGE ─── */}
      <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-[#090A0C] text-white shadow-2xl overflow-hidden">
        {/* Top Header Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="size-3.5 text-emerald-400" />
              <span>{backendType}</span>
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Holographic Foil (Image 1) + Official Float Card (Image 2)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplayWater}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 transition-colors cursor-pointer"
              title="Replay the subtle transparent water wash"
            >
              <RotateCcw className="size-3.5" />
              <span>{isWaterPlaying ? "Water Washing..." : "Replay Water Wave"}</span>
            </button>
          </div>
        </div>

        {/* Center Stage: VGPU Holographic Canvas */}
        <div className="relative flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-8 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]">
          <div className="relative w-full max-w-[720px] aspect-[1.54/1] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.85)]">
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-pointer select-none touch-none"
              aria-label="Float Card v2 with VGPU holographic shader and subtle transparent water"
            />
          </div>

          <p className="mt-4 text-xs font-mono tracking-widest uppercase text-zinc-400 text-center">
            Hover to sweep holographic diffraction &bull; Water is transparent &bull; No click-to-add
          </p>
        </div>
      </div>

      {/* ─── CARD DETAILS & METADATA CONTROLS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b131e] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="size-4 text-sky-600 dark:text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Float Cardholder &amp; Limit Metadata
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rendered onto Image 2&apos;s silver Float card face
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="FILBERT MANGUNDAP"
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Spend Limit
              </label>
              <input
                type="text"
                value={spendLimit}
                onChange={(e) => setSpendLimit(e.target.value)}
                placeholder="$5,000.00 CAD / MO"
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b131e] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="size-4 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                VGPU Shader Architecture (v2)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Iridescent diffraction grating + optical transparent water
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>VGPU / WebGPU Pipeline</strong>: Compiled with <code className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">@vgpu/wgsl</code> and executed on native GPU render passes.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Holographic Wavy Contour Pattern</strong>: Matches Image 1 from <a href="https://vgpu.sh/examples/holographic-card" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-500">vgpu.sh/examples/holographic-card</a>.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Subtle Transparent Water</strong>: Plays once on load with real-time optical refraction and specular white highlights. Zero blue dye and no click-to-carve.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
