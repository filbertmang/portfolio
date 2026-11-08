"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FloatSprite,
  type DuckVisualStyle,
  type FloatColor,
  type FloatVariant,
} from "./DuckSvg";
import { sfx } from "./sfx";

/* ============================================================================
 * 1. POND EDGE SDF, FILM GRAIN, FOG & LIGHT LEAKS (Canvas Layer 2)
 * ============================================================================ */

const POND_PARAMS = {
  brightness: 21,
  contrast: 31,
  warmth: 23,
  grain: 71,
  grainPop: 9,
  fog: 63,
  lightLeak: 12,
  edgeFade: 10,
  cornerRadius: 28,
  edgeNoise: 27,
  edgeMargin: 5,
} as const;

const LIGHT_BG_RGB = { r: 245, g: 241, b: 236 }; // #f5f1ec
const DARK_BG_RGB = { r: 7, g: 14, b: 23 }; // #070e17

function intHash2D(x: number, y: number): number {
  let h = (0x165667b1 * x + 0x27d4eb2f * y) | 0;
  h = Math.imul(h ^ (h >> 13), 0x4bf19f61);
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise2D(x: number, y: number, freq: number): number {
  const fx = x * freq;
  const fy = y * freq;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const dx = fx - ix;
  const dy = fy - iy;
  const ux = dx * dx * (3 - 2 * dx);
  const uy = dy * dy * (3 - 2 * dy);
  return (
    (intHash2D(ix, iy) * (1 - ux) + intHash2D(ix + 1, iy) * ux) * (1 - uy) +
    (intHash2D(ix, iy + 1) * (1 - ux) + intHash2D(ix + 1, iy + 1) * ux) * uy
  );
}

function multiOctaveNoise2D(x: number, y: number): number {
  return (
    0.6 * smoothNoise2D(x, y, 0.004) +
    0.25 * smoothNoise2D(x, y, 0.01) +
    0.15 * smoothNoise2D(x, y, 0.025)
  );
}

function grainSample(amp: number, popChance: number, popBoost: number): number {
  const r = Math.random();
  if (r < 0.6 * popChance) {
    return popBoost * (0.5 + 0.5 * Math.random()) * amp;
  }
  if (r < popChance) {
    return -(popBoost * (0.3 + 0.4 * Math.random()) * amp);
  }
  return ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * amp * 2;
}

function evalSinglePointSDF(
  x: number,
  y: number,
  width: number,
  height: number
): number {
  const margin = (POND_PARAMS.edgeMargin / 100) * Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const halfW = cx - margin;
  const halfH = cy - margin;
  const minHalf = Math.min(halfW, halfH);
  const radius = (POND_PARAMS.cornerRadius / 100) * minHalf;
  const noiseAmp = (POND_PARAMS.edgeNoise / 100) * Math.min(width, height) * 0.06;
  const dx = Math.abs(x - cx) - (halfW - radius);
  const dy = Math.abs(y - cy) - (halfH - radius);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  let dist = Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(dx, dy), 0) - radius;
  if (noiseAmp > 0) {
    dist += (2 * multiOctaveNoise2D(x, y) - 1) * noiseAmp;
  }
  return dist;
}

function computeSdfGrid(width: number, height: number): Float32Array {
  const sdf = new Float32Array(width * height);
  const margin = (POND_PARAMS.edgeMargin / 100) * Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const halfW = cx - margin;
  const halfH = cy - margin;
  const minHalf = Math.min(halfW, halfH);
  const radius = (POND_PARAMS.cornerRadius / 100) * minHalf;
  const noiseAmp = (POND_PARAMS.edgeNoise / 100) * Math.min(width, height) * 0.06;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x - cx) - (halfW - radius);
      const dy = Math.abs(y - cy) - (halfH - radius);
      const ox = Math.max(dx, 0);
      const oy = Math.max(dy, 0);
      let d =
        Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(dx, dy), 0) - radius;
      if (noiseAmp > 0) {
        d += (2 * multiOctaveNoise2D(x, y) - 1) * noiseAmp;
      }
      sdf[y * width + x] = d;
    }
  }
  return sdf;
}

function applyOuterMask(
  data: Uint8ClampedArray,
  sdf: Float32Array,
  fadeDist: number,
  bgRgb: { r: number; g: number; b: number }
) {
  for (let idx = 0; idx < sdf.length; idx++) {
    const dist = sdf[idx];
    const p = 4 * idx;
    if (dist > 0) {
      data[p] = bgRgb.r;
      data[p + 1] = bgRgb.g;
      data[p + 2] = bgRgb.b;
      data[p + 3] = 255;
    } else if (fadeDist > 0 && -dist < fadeDist) {
      const t = -dist / fadeDist;
      const edgeWeight = 1 - t * t * (3 - 2 * t);
      const curA = data[p + 3] / 255;
      const outA = edgeWeight + curA * (1 - edgeWeight);
      if (outA > 0) {
        data[p] = Math.round(
          (bgRgb.r * edgeWeight + data[p] * curA * (1 - edgeWeight)) / outA
        );
        data[p + 1] = Math.round(
          (bgRgb.g * edgeWeight + data[p + 1] * curA * (1 - edgeWeight)) / outA
        );
        data[p + 2] = Math.round(
          (bgRgb.b * edgeWeight + data[p + 2] * curA * (1 - edgeWeight)) / outA
        );
      }
      data[p + 3] = Math.round(255 * outA);
    }
  }
}

function renderOverlayCanvas(
  canvas: HTMLCanvasElement,
  sdf: Float32Array,
  bgRgb: { r: number; g: number; b: number }
) {
  const width = canvas.width;
  const height = canvas.height;
  if (width <= 0 || height <= 0) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Pass 1: Warm film grain + inner edge fade
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const fadeDist =
    bgRgb.r === 0
      ? 0
      : (POND_PARAMS.edgeFade / 100) * Math.min(width, height) * 0.45;
  const grainAmp = (POND_PARAMS.grain / 100) * 80;
  const grainPop = POND_PARAMS.grainPop / 100;
  const popChance = 0.15 * grainPop;
  const popBoost = 1.5 + 2.5 * grainPop;
  const warmth = 0.3 * POND_PARAMS.warmth;
  const brightness = (POND_PARAMS.brightness / 100) * 255;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const p = 4 * idx;
      const dist = sdf[idx];
      if (dist > 0) continue;

      let r = warmth + brightness;
      let g = brightness;
      let b = -warmth + brightness;
      const gVal = grainSample(grainAmp, popChance, popBoost);
      r += gVal;
      g += gVal;
      b += gVal;
      const avg = (r + g + b) / 3;
      const alphaMag = Math.min(255, Math.max(0, 0.7 * Math.abs(avg)));

      if (avg >= 0) {
        data[p] = Math.min(255, 245 + Math.round(0.5 * warmth));
        data[p + 1] = 240;
        data[p + 2] = Math.max(0, 230 - Math.round(0.3 * warmth));
        data[p + 3] = Math.round(alphaMag);
      } else {
        data[p] = 30;
        data[p + 1] = 25;
        data[p + 2] = 20;
        data[p + 3] = Math.round(0.6 * alphaMag);
      }

      if (fadeDist > 0 && -dist < fadeDist) {
        const t = -dist / fadeDist;
        const edgeAlpha = Math.round(255 * (1 - t * t * (3 - 2 * t)));
        const a0 = data[p + 3] / 255;
        const a1 = edgeAlpha / 255;
        const outA = a0 + a1 * (1 - a0);
        if (outA > 0) {
          data[p] = Math.round((data[p] * a0 + bgRgb.r * a1 * (1 - a0)) / outA);
          data[p + 1] = Math.round(
            (data[p + 1] * a0 + bgRgb.g * a1 * (1 - a0)) / outA
          );
          data[p + 2] = Math.round(
            (data[p + 2] * a0 + bgRgb.b * a1 * (1 - a0)) / outA
          );
        }
        data[p + 3] = Math.round(255 * outA);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Pass 2: Radial fog + 3 radial light leaks
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const fogAlpha = (POND_PARAMS.fog / 100) * 0.35;
  const fogGrad = ctx.createRadialGradient(cx, cy, 0.05 * width, cx, cy, maxR);
  fogGrad.addColorStop(0, `rgba(240, 235, 228, ${fogAlpha})`);
  fogGrad.addColorStop(0.5, `rgba(240, 235, 228, ${0.6 * fogAlpha})`);
  fogGrad.addColorStop(1, `rgba(220, 215, 210, ${0.8 * fogAlpha})`);
  ctx.fillStyle = fogGrad;
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillRect(0, 0, width, height);

  const leakAlpha = (POND_PARAMS.lightLeak / 100) * 0.35;
  const leaks = [
    { x: 0.15 * width, y: 0.2 * height, r: 0.5 * width },
    { x: 0.85 * width, y: 0.7 * height, r: 0.4 * width },
    { x: 0.5 * width, y: 0.1 * height, r: 0.35 * width },
  ];
  for (const leak of leaks) {
    const grad = ctx.createRadialGradient(
      leak.x,
      leak.y,
      0,
      leak.x,
      leak.y,
      leak.r
    );
    grad.addColorStop(0, `rgba(255, 252, 245, ${leakAlpha})`);
    grad.addColorStop(0.4, `rgba(255, 250, 240, ${0.4 * leakAlpha})`);
    grad.addColorStop(1, "rgba(255, 250, 240, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.globalCompositeOperation = "source-over";

  // Pass 3: Outer SDF mask outside the pond boundary
  const finalImg = ctx.getImageData(0, 0, width, height);
  applyOuterMask(
    finalImg.data,
    sdf,
    bgRgb.r === 0
      ? (POND_PARAMS.edgeFade / 100) * Math.min(width, height) * 0.45
      : 0,
    bgRgb
  );
  ctx.putImageData(finalImg, 0, 0);
}

/* ============================================================================
 * 2. WEBGL SEASCAPE WATER SHADER + INTERACTIVE RIPPLES (Canvas Layer 1)
 * ============================================================================ */

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_ripples[12]; // xy = pixel pos, z = drop time, w = amplitude

float hash(vec2 p) {
  float h = dot(p, vec2(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return -1.0 + 2.0 * mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Seascape wave octave: 1.0 - abs(sin()) creates sharp crests
float sea_octave(vec2 uv, float choppy) {
  uv += noise(uv);
  vec2 wv = 1.0 - abs(sin(uv));
  vec2 swv = abs(cos(uv));
  wv = mix(wv, swv, wv);
  return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
}

// Rotation between octaves kills axis-aligned banding
const mat2 octave_m = mat2(1.6, 1.2, -1.2, 1.6);

float getHeight(vec2 uv) {
  float SEA_TIME = u_time * 0.8;
  float freq = 0.16;
  float amp = 0.6;
  float choppy = 4.0;
  float h = 0.0;

  for (int i = 0; i < 5; i++) {
    float d  = sea_octave((uv + SEA_TIME) * freq, choppy);
          d += sea_octave((uv - SEA_TIME) * freq, choppy);
    h += d * amp;
    uv *= octave_m;
    freq *= 1.9;
    amp *= 0.22;
    choppy = mix(choppy, 1.0, 0.2);
  }
  return h;
}

vec3 getNormal(vec2 uv, float eps) {
  float h  = getHeight(uv);
  float hx = getHeight(uv + vec2(eps, 0.0));
  float hy = getHeight(uv + vec2(0.0, eps));
  return normalize(vec3(h - hx, eps * 8.0, h - hy));
}

// Ripple that warps and stretches with the underlying wave surface
float ripple(vec2 pos, vec2 center, float time, float dropTime) {
  float age = time - dropTime;
  if (age < 0.0 || age > 4.0) return 0.0;

  // Wave surface gradient — how the water slopes at this point
  float eps = 0.04;
  float hc = getHeight(pos);
  float hx = getHeight(pos + vec2(eps, 0.0));
  float hy = getHeight(pos + vec2(0.0, eps));
  vec2 grad = vec2(hx - hc, hy - hc) / eps;

  // Strong gradient warp — ripple stretches along wave slopes
  vec2 diff = pos - center + grad * 1.2;

  // Add organic noise distortion to break perfect circles
  float n = noise(pos * 3.0 + time * 0.5) * 0.15;
  diff += vec2(n, -n);

  float dist = length(diff);

  // Tighter wavefront ring, speed affected by local wave height
  float speedMod = 1.0 + hc * 0.3;
  float wavefront = age * 4.5 * speedMod;
  float envelope = exp(-pow(dist - wavefront, 2.0) / 1.5);
  float decay = exp(-age * 1.4);

  // Higher frequency rings
  return 0.45 * envelope * decay * cos(dist * 5.0 - time * 6.0);
}

vec3 getWaterColor(vec2 uv, vec3 normal, float height) {
  vec3 deepColor = vec3(0.02, 0.18, 0.32);
  vec3 waterColor = vec3(0.25, 0.65, 0.60);
  vec3 skyColor = vec3(0.50, 0.82, 0.88);

  vec3 lightDir = normalize(vec3(0.4, 0.7, 0.3));
  vec3 eye = vec3(0.0, 1.0, 0.0);

  // Fresnel
  float fresnel = 1.0 - max(dot(normal, eye), 0.0);
  fresnel = clamp(pow(fresnel, 3.0) * 0.65, 0.0, 1.0);

  // Diffuse subsurface
  float diff = pow(dot(normal, lightDir) * 0.4 + 0.6, 80.0);
  vec3 refracted = deepColor + diff * waterColor * 0.12;

  vec3 color = mix(refracted, skyColor, fresnel);

  // Height variation
  color += waterColor * (height - 0.6) * 0.18;

  // Specular
  vec3 refl = reflect(-eye, normal);
  float spec = pow(max(dot(refl, lightDir), 0.0), 60.0);
  float nrm = (60.0 + 8.0) / (3.14159 * 8.0);
  color += vec3(spec * nrm * 0.15);

  return color;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  px.y = u_resolution.y - px.y;
  vec2 res = u_resolution;

  float scale = 30.0;
  vec2 uv = (px / min(res.x, res.y)) * scale;

  float height = getHeight(uv);

  for (int i = 0; i < 12; i++) {
    vec2 mouseUV = (u_ripples[i].xy / min(res.x, res.y)) * scale;
    float dropTime = u_ripples[i].z;
    float amp = u_ripples[i].w;
    height += ripple(uv, mouseUV, u_time, dropTime) * amp;
  }

  vec3 normal = getNormal(uv, 0.01);
  vec3 color = getWaterColor(uv, normal, height);

  // Height tint and ripples can push a channel below zero. Fractional pow of
  // a negative value is undefined in GLSL and turns red on some GPU drivers.
  color = pow(max(color, vec3(0.0)), vec3(0.75));

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }
  console.error("Shader error:", gl.getShaderInfoLog(shader));
  return null;
}

function sizeCanvasToRect(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width);
  canvas.height = Math.round(rect.height);
}

interface RippleEntry {
  x: number;
  y: number;
  time: number;
  amp: number;
}

function useWaterWebGL(
  waterCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  visRef: React.RefObject<boolean>,
  bgRgb: { r: number; g: number; b: number }
) {
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const timeRef = useRef(0);
  const pausedAtRef = useRef(0);
  const ripplesRef = useRef<RippleEntry[]>([]);
  const tickRef = useRef<() => void>(() => {});
  const sdfCacheRef = useRef<Float32Array | null>(null);
  const bgRgbRef = useRef(bgRgb);

  useEffect(() => {
    bgRgbRef.current = bgRgb;
  }, [bgRgb]);

  const pushRipple = useCallback((x: number, y: number, amp = 1) => {
    const now = (performance.now() - startTimeRef.current) / 1000;
    const arr = ripplesRef.current;
    let writeIdx = 0;
    for (let i = 0; i < arr.length; i++) {
      if (now - arr[i].time < 4) {
        arr[writeIdx++] = arr[i];
      }
    }
    arr.length = writeIdx;
    if (arr.length >= 12) arr.shift();
    arr.push({ x, y, time: now, amp });
  }, []);

  const triggerRippleAt = useCallback(
    (nx: number, ny: number, amp = 1) => {
      const canvas = waterCanvasRef.current;
      if (canvas) {
        pushRipple(nx * canvas.width, ny * canvas.height, amp);
      }
    },
    [waterCanvasRef, pushRipple]
  );

  // Re-render overlay when theme background changes
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    const sdf = sdfCacheRef.current;
    if (overlay && sdf) {
      renderOverlayCanvas(overlay, sdf, bgRgb);
    }
  }, [bgRgb, overlayCanvasRef]);

  useEffect(() => {
    const waterCanvas = waterCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!waterCanvas || !overlayCanvas) return;

    sizeCanvasToRect(waterCanvas);
    const rect = waterCanvas.getBoundingClientRect();
    overlayCanvas.width = Math.round(rect.width);
    overlayCanvas.height = Math.round(rect.height);

    startTimeRef.current = performance.now();

    const initialSdf = computeSdfGrid(overlayCanvas.width, overlayCanvas.height);
    sdfCacheRef.current = initialSdf;
    renderOverlayCanvas(overlayCanvas, initialSdf, bgRgbRef.current);

    const gl = waterCanvas.getContext("webgl", {
      antialias: false,
      alpha: false,
    });
    if (!gl) return;

    // If a prior HMR cycle lost context, restore it
    if (gl.isContextLost()) {
      gl.getExtension("WEBGL_lose_context")?.restoreContext();
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRipples: (WebGLUniformLocation | null)[] = [];
    for (let i = 0; i < 12; i++) {
      uRipples.push(gl.getUniformLocation(program, `u_ripples[${i}]`));
    }
    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");

    gl.viewport(0, 0, waterCanvas.width, waterCanvas.height);
    gl.uniform2f(uRes, waterCanvas.width, waterCanvas.height);

    for (let i = 0; i < 12; i++) {
      gl.uniform4f(uRipples[i], 0, 0, -10, 0);
    }

    const renderLoop = () => {
      if (!visRef.current) {
        if (pausedAtRef.current === 0) {
          pausedAtRef.current = performance.now();
        }
        return;
      }
      if (pausedAtRef.current > 0) {
        startTimeRef.current += performance.now() - pausedAtRef.current;
        pausedAtRef.current = 0;
      }
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      timeRef.current = elapsed;
      gl.uniform1f(uTime, elapsed);

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
      rafRef.current = requestAnimationFrame(renderLoop);
    };

    tickRef.current = renderLoop;
    rafRef.current = requestAnimationFrame(renderLoop);

    let resizeTimer = 0;
    const handleResize = () => {
      sizeCanvasToRect(waterCanvas);
      gl.viewport(0, 0, waterCanvas.width, waterCanvas.height);
      gl.uniform2f(uRes, waterCanvas.width, waterCanvas.height);
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const r = waterCanvas.getBoundingClientRect();
        overlayCanvas.width = Math.round(r.width);
        overlayCanvas.height = Math.round(r.height);
        const nextSdf = computeSdfGrid(
          overlayCanvas.width,
          overlayCanvas.height
        );
        sdfCacheRef.current = nextSdf;
        renderOverlayCanvas(overlayCanvas, nextSdf, bgRgbRef.current);
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [waterCanvasRef, overlayCanvasRef, visRef]);

  const resume = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => tickRef.current());
  }, []);

  return { timeRef, triggerRippleAt, resume };
}

/* ============================================================================
 * 3. WIND-SWAYING CATTAILS & REEDS AROUND POND BANK (Canvas Layer 3)
 * ============================================================================ */

const REED_COLORS = [
  "rgba(120, 160, 105, 0.72)",
  "rgba(130, 168, 112, 0.68)",
  "rgba(112, 152, 100, 0.65)",
  "rgba(135, 172, 118, 0.62)",
  "rgba(125, 164, 108, 0.68)",
];

interface ReedClusterSpec {
  edge: "bottom" | "left" | "right" | "top";
  along: number;
  bladeCount: number;
  spread: number;
  heightRange: [number, number];
  cattailChance: number;
}

const REED_CLUSTER_SPECS: ReedClusterSpec[] = [
  { edge: "bottom", along: 0.06, bladeCount: 12, spread: 0.03, heightRange: [80, 150], cattailChance: 0.25 },
  { edge: "bottom", along: 0.12, bladeCount: 10, spread: 0.025, heightRange: [70, 130], cattailChance: 0.2 },
  { edge: "bottom", along: 0.18, bladeCount: 8, spread: 0.025, heightRange: [55, 110], cattailChance: 0.15 },
  { edge: "bottom", along: 0.24, bladeCount: 6, spread: 0.02, heightRange: [42, 90], cattailChance: 0.1 },
  { edge: "bottom", along: 0.3, bladeCount: 4, spread: 0.018, heightRange: [35, 70], cattailChance: 0.1 },
  { edge: "bottom", along: 0.42, bladeCount: 3, spread: 0.02, heightRange: [28, 55], cattailChance: 0.15 },
  { edge: "bottom", along: 0.55, bladeCount: 3, spread: 0.018, heightRange: [25, 50], cattailChance: 0.2 },
  { edge: "bottom", along: 0.7, bladeCount: 4, spread: 0.018, heightRange: [35, 70], cattailChance: 0.1 },
  { edge: "bottom", along: 0.76, bladeCount: 5, spread: 0.02, heightRange: [38, 85], cattailChance: 0.1 },
  { edge: "bottom", along: 0.82, bladeCount: 7, spread: 0.025, heightRange: [52, 105], cattailChance: 0.15 },
  { edge: "bottom", along: 0.88, bladeCount: 9, spread: 0.025, heightRange: [62, 125], cattailChance: 0.2 },
  { edge: "bottom", along: 0.94, bladeCount: 11, spread: 0.03, heightRange: [75, 145], cattailChance: 0.25 },
  { edge: "left", along: 0.22, bladeCount: 3, spread: 0.01, heightRange: [32, 62], cattailChance: 0.3 },
  { edge: "left", along: 0.35, bladeCount: 3, spread: 0.012, heightRange: [35, 70], cattailChance: 0.3 },
  { edge: "left", along: 0.5, bladeCount: 4, spread: 0.012, heightRange: [42, 84], cattailChance: 0.35 },
  { edge: "left", along: 0.65, bladeCount: 5, spread: 0.015, heightRange: [48, 98], cattailChance: 0.3 },
  { edge: "left", along: 0.8, bladeCount: 6, spread: 0.018, heightRange: [55, 110], cattailChance: 0.3 },
  { edge: "right", along: 0.25, bladeCount: 3, spread: 0.01, heightRange: [32, 62], cattailChance: 0.3 },
  { edge: "right", along: 0.38, bladeCount: 3, spread: 0.012, heightRange: [35, 70], cattailChance: 0.35 },
  { edge: "right", along: 0.52, bladeCount: 4, spread: 0.012, heightRange: [38, 76], cattailChance: 0.3 },
  { edge: "right", along: 0.68, bladeCount: 5, spread: 0.015, heightRange: [45, 90], cattailChance: 0.3 },
  { edge: "right", along: 0.82, bladeCount: 6, spread: 0.018, heightRange: [52, 105], cattailChance: 0.25 },
  { edge: "top", along: 0.08, bladeCount: 6, spread: 0.02, heightRange: [48, 98], cattailChance: 0.2 },
  { edge: "top", along: 0.15, bladeCount: 4, spread: 0.018, heightRange: [38, 76], cattailChance: 0.15 },
  { edge: "top", along: 0.35, bladeCount: 3, spread: 0.018, heightRange: [28, 55], cattailChance: 0.2 },
  { edge: "top", along: 0.6, bladeCount: 3, spread: 0.018, heightRange: [25, 52], cattailChance: 0.25 },
  { edge: "top", along: 0.85, bladeCount: 4, spread: 0.018, heightRange: [35, 70], cattailChance: 0.15 },
  { edge: "top", along: 0.92, bladeCount: 5, spread: 0.02, heightRange: [45, 90], cattailChance: 0.2 },
];

interface ReedBlade {
  baseX: number;
  baseY: number;
  height: number;
  lean: number;
  curve: number;
  width: number;
  color: string;
  windPhase: number;
  windFlex: number;
  type: "cattail" | "reed";
  headHeight?: number;
}

interface ReedCluster {
  x: number;
  y: number;
  blades: ReedBlade[];
}

function findEdgeCoordinate(
  edge: ReedClusterSpec["edge"],
  along: number,
  width: number,
  height: number
): number {
  let lo: number;
  let hi: number;
  if (edge === "bottom") {
    const px = along * width;
    lo = 0.5 * height;
    hi = height;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (evalSinglePointSDF(px, mid, width, height) < -20) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2 / height;
  }
  if (edge === "top") {
    const px = along * width;
    lo = 0;
    hi = 0.5 * height;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (evalSinglePointSDF(px, mid, width, height) < -20) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2 / height;
  }
  if (edge === "left") {
    const py = along * height;
    lo = 0;
    hi = 0.5 * width;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (evalSinglePointSDF(mid, py, width, height) < -20) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2 / width;
  }
  const py = along * height;
  lo = 0.5 * width;
  hi = width;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (evalSinglePointSDF(mid, py, width, height) < -20) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2 / width;
}

function generateReedClusters(
  pondWidth: number,
  pondHeight: number,
  seed = 42
): { clusters: ReedCluster[] } {
  let state = seed | 0;
  const rand = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };

  return {
    clusters: REED_CLUSTER_SPECS.map((spec) => {
      const edgeCoord = findEdgeCoordinate(
        spec.edge,
        spec.along,
        pondWidth,
        pondHeight
      );
      const cx =
        spec.edge === "bottom" || spec.edge === "top" ? spec.along : edgeCoord;
      const cy =
        spec.edge === "bottom" || spec.edge === "top" ? edgeCoord : spec.along;

      const blades: ReedBlade[] = [];
      for (let i = 0; i < spec.bladeCount; i++) {
        const frac = spec.bladeCount > 1 ? i / (spec.bladeCount - 1) : 0.5;
        const isCattail = rand() < spec.cattailChance;
        const baseLean = (frac - 0.5) * 0.8;
        let dx = (rand() - 0.5) * spec.spread;
        let dy = (rand() - 0.5) * spec.spread * 0.3;
        if (spec.edge === "left" || spec.edge === "right") {
          [dx, dy] = [dy, dx];
        }
        const h =
          spec.heightRange[0] +
          rand() * (spec.heightRange[1] - spec.heightRange[0]);
        blades.push({
          baseX: cx + dx,
          baseY: cy + dy,
          height: h,
          lean: baseLean + (rand() - 0.5) * 0.3,
          curve: 0.15 + 0.35 * rand(),
          width: isCattail ? 1.2 + 0.6 * rand() : 0.6 + 0.9 * rand(),
          color: REED_COLORS[Math.floor(rand() * REED_COLORS.length)],
          windPhase: rand() * Math.PI * 2,
          windFlex: 0.3 + 0.5 * rand(),
          type: isCattail ? "cattail" : "reed",
          headHeight: isCattail ? 8 + 7 * rand() : undefined,
        });
      }
      blades.sort((a, b) => b.height - a.height);
      return { x: cx, y: cy, blades };
    }),
  };
}

function drawReedBlade(
  ctx: CanvasRenderingContext2D,
  blade: ReedBlade,
  pondW: number,
  pondH: number,
  time: number
) {
  const bx = blade.baseX * pondW;
  const by = blade.baseY * pondH;
  const wind =
    8 * Math.sin(0.8 * time + blade.windPhase) * blade.windFlex +
    3 * Math.sin(0.3 * time + 0.7 * blade.windPhase + 0.01 * bx) * blade.windFlex;
  const angle = blade.lean + (wind / blade.height) * 0.5;
  const tipX = bx + Math.sin(angle) * blade.height + wind * blade.curve;
  const tipY = by - Math.cos(angle) * blade.height;
  const midX =
    bx + Math.sin(0.4 * angle) * blade.height * 0.55 + wind * blade.curve * 0.3;
  const midY = by - Math.cos(0.4 * angle) * blade.height * 0.55;
  const halfW = 0.5 * blade.width;
  const nx = Math.cos(0.3 * angle);
  const ny = Math.sin(0.3 * angle);

  ctx.beginPath();
  ctx.moveTo(bx - nx * halfW, by - ny * halfW);
  ctx.quadraticCurveTo(midX - nx * halfW * 0.5, midY, tipX, tipY);
  ctx.quadraticCurveTo(midX + nx * halfW * 0.5, midY, bx + nx * halfW, by + ny * halfW);
  ctx.closePath();
  ctx.fillStyle = blade.color;
  ctx.fill();

  if (blade.type === "cattail" && blade.headHeight) {
    const hx =
      bx +
      Math.sin(0.72 * angle) * blade.height * 0.72 +
      wind * blade.curve * 0.36;
    const hy = by - Math.cos(0.72 * angle) * blade.height * 0.72;
    const headAngle = 0.6 * angle;
    const ry = 0.55 * blade.headHeight;
    const rx = 1.3 * blade.width;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(headAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx + 1.2, ry + 1.5, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(140, 118, 98, 0.25)";
    ctx.fill();

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
    grad.addColorStop(0, "rgba(95, 68, 52, 0.75)");
    grad.addColorStop(0.6, "rgba(120, 92, 72, 0.55)");
    grad.addColorStop(1, "rgba(125, 108, 92, 0.08)");
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(65, 48, 38, 0.12)";
    ctx.lineWidth = 0.3;
    for (let y = -0.6 * ry; y < 0.6 * ry; y += 3.5) {
      const halfSpan = rx * Math.sqrt(1 - (y / ry) * (y / ry)) * 0.85;
      ctx.beginPath();
      ctx.moveTo(-halfSpan, y);
      ctx.lineTo(halfSpan, y);
      ctx.stroke();
    }

    const spikeLen = 0.8 * blade.headHeight;
    ctx.beginPath();
    ctx.moveTo(0, -ry);
    ctx.lineTo(-0.35, -ry - 0.35 * spikeLen);
    ctx.lineTo(0, -ry - spikeLen);
    ctx.lineTo(0.35, -ry - 0.35 * spikeLen);
    ctx.closePath();
    ctx.fillStyle = "rgba(125, 160, 108, 0.6)";
    ctx.fill();
    ctx.restore();
  }
}

function useReedsCanvas(
  reedsCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  timeRef: React.RefObject<number>,
  visRef: React.RefObject<boolean>
) {
  const clustersDataRef = useRef<{ clusters: ReedCluster[] } | null>(null);
  const rafRef = useRef(0);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = reedsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      if (canvas.width > 400 && canvas.height > 400) {
        clustersDataRef.current = generateReedClusters(
          canvas.width - 400,
          canvas.height - 400
        );
      }
    };
    rebuild();

    let resizeTimer = 0;
    const renderLoop = () => {
      if (!visRef.current) return;
      const data = clustersDataRef.current;
      if (data) {
        const t = timeRef.current ?? 0;
        const pondW = canvas.width - 400;
        const pondH = canvas.height - 400;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(200, 200);
        for (const cluster of data.clusters) {
          for (const blade of cluster.blades) {
            drawReedBlade(ctx, blade, pondW, pondH, t);
          }
        }
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(renderLoop);
    };

    tickRef.current = renderLoop;
    rafRef.current = requestAnimationFrame(renderLoop);

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [reedsCanvasRef, timeRef, visRef]);

  const resume = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => tickRef.current());
  }, []);

  return { resume };
}

/* ============================================================================
 * 4. CPU WAVE HEIGHT & DUCK / FISH / FOOD SIMULATION
 * ============================================================================ */

function cpuHash(x: number, y: number): number {
  const s = 43758.5453123 * Math.sin(127.1 * x + 311.7 * y);
  return s - Math.floor(s);
}

function cpuSeaOctave(u: number, v: number, choppy: number): number {
  const ix = Math.floor(u);
  const iy = Math.floor(v);
  const fx = u - ix;
  const fy = v - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = cpuHash(ix, iy);
  const b = cpuHash(ix + 1, iy);
  const c = cpuHash(ix, iy + 1);
  const d = cpuHash(ix + 1, iy + 1);
  const n = -1 + 2 * ((a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy);

  const u2 = u + n;
  const v2 = v + n;
  let wvx = 1 - Math.abs(Math.sin(u2));
  let wvy = 1 - Math.abs(Math.sin(v2));
  const swvx = Math.abs(Math.cos(u2));
  const swvy = Math.abs(Math.cos(v2));
  wvx += (swvx - wvx) * wvx;
  wvy += (swvy - wvy) * wvy;
  return Math.pow(1 - Math.pow(wvx * wvy, 0.65), choppy);
}

function cpuGetHeight(u: number, v: number, time: number, octaves = 5): number {
  const seaTime = 0.8 * time;
  let freq = 0.16;
  let amp = 0.6;
  let choppy = 4;
  let h = 0;
  let cu = u;
  let cv = v;
  for (let i = 0; i < octaves; i++) {
    let d = cpuSeaOctave((cu + seaTime) * freq, (cv + seaTime) * freq, choppy);
    d += cpuSeaOctave((cu - seaTime) * freq, (cv - seaTime) * freq, choppy);
    h += d * amp;
    const nu = 1.6 * cu + 1.2 * cv;
    const nv = -1.2 * cu + 1.6 * cv;
    cu = nu;
    cv = nv;
    freq *= 1.9;
    amp *= 0.22;
    choppy += (1 - choppy) * 0.2;
  }
  return h;
}

function getCpuHeightAndSlope(
  u: number,
  v: number,
  time: number,
  octaves = 2
) {
  const h = cpuGetHeight(u, v, time, octaves);
  return {
    height: h,
    slopeX: (cpuGetHeight(u + 0.05, v, time, octaves) - h) / 0.05,
    slopeY: (cpuGetHeight(u, v + 0.05, time, octaves) - h) / 0.05,
  };
}

const FLOAT_COLORS: FloatColor[] = ["pink", "yellow", "green", "blue"];
const FLOCK_RADIUS_SQ = 0.2 * 0.2;

function lerpAngleDeg(current: number, target: number, factor: number): number {
  let diff = target - current;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return current + diff * factor;
}

interface FloatEntity {
  id: number;
  variant: FloatVariant;
  nx: number;
  ny: number;
  offsetY: number;
  rotation: number;
  spawnTime: number;
  scale: number;
  phase: number;
  heading: number;
  actionEnd: number;
  action: "float" | "paddle" | "leaving" | "drowning";
  paddleIntensity: number;
  turnRate: number;
  speed: number;
  lastRipple: number;
  drowning: boolean;
  opacity: number;
  speedBoost: number;
  waveVx: number;
  waveVy: number;
}

interface FoodCluster {
  id: number;
  nx: number;
  ny: number;
  startTime: number;
  arrivedTime: number | null;
}

interface VisualPellet {
  x: number;
  y: number;
  size: number;
  hue: number;
  blur: number;
}

interface VisualFoodGroup {
  foodId: number;
  pellets: VisualPellet[];
}

function clampEntityInsidePond(entity: FloatEntity) {
  if (entity.action === "leaving") return;
  const hitWall =
    entity.nx < 0.03 || entity.nx > 0.97 || entity.ny < 0.03 || entity.ny > 0.97;
  entity.nx = Math.max(0.03, Math.min(0.97, entity.nx));
  entity.ny = Math.max(0.03, Math.min(0.97, entity.ny));
  if (
    hitWall &&
    (entity.variant.kind === "duck" || entity.variant.kind === "fish")
  ) {
    entity.heading =
      Math.atan2(0.5 - entity.ny, 0.5 - entity.nx) +
      (Math.random() - 0.5) * 0.6;
  }
}

let nextFloatId = 0;

/* ============================================================================
 * 5. FEED MODE CRUMB BUTTON & DUCK SPEECH BUBBLE QUOTES
 * ============================================================================ */

const CRUMB_DOTS = [
  { x: 22, y: 20, s: 8, h: 34 },
  { x: 15, y: 16, s: 7, h: 30 },
  { x: 29, y: 17, s: 7.5, h: 38 },
  { x: 18, y: 26, s: 6.5, h: 32 },
  { x: 27, y: 25, s: 7, h: 36 },
  { x: 24, y: 12, s: 5.5, h: 29 },
  { x: 11, y: 21, s: 5, h: 31 },
  { x: 35, y: 23, s: 5.5, h: 33 },
  { x: 13, y: 28, s: 4.5, h: 28 },
  { x: 32, y: 29, s: 5, h: 35 },
  { x: 9, y: 14, s: 4, h: 30 },
  { x: 37, y: 15, s: 4.2, h: 32 },
];

function FeedButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        sfx.toggle(!active);
        onClick();
      }}
      aria-label={active ? "Exit feed mode" : "Feed the ducks"}
      title={active ? "Exit feed mode" : "Feed the ducks"}
      className="group relative flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      style={{ width: 46, height: 46 }}
    >
      {active ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="4"
            y1="4"
            x2="16"
            y2="16"
            stroke="rgba(42,37,32,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="16"
            y1="4"
            x2="4"
            y2="16"
            stroke="rgba(42,37,32,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <div
          className="relative"
          style={{ width: 46, height: 46, filter: "blur(0.4px)" }}
        >
          {CRUMB_DOTS.map((dot, idx) => (
            <div
              key={idx}
              className="absolute rounded-full"
              style={{
                left: dot.x,
                top: dot.y,
                width: dot.s,
                height: dot.s,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, hsla(${dot.h}, 45%, 60%, 0.5) 0%, hsla(${dot.h}, 40%, 45%, 0.3) 50%, hsla(${dot.h}, 35%, 35%, 0.1) 100%)`,
                filter: `blur(${0.6 + (idx % 3) * 0.3}px)`,
                boxShadow: `0 0 ${1.5 * dot.s}px hsla(${dot.h}, 35%, 50%, 0.15)`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

const DUCK_QUOTES = [
  "hi :)",
  "u clicked me!",
  "hey! that tickles",
  "do u think they'll feed us",
  "i think they like us",
  "psst... scroll down",
  "we see u",
  "stop poking me",
  "filbert made this pond for us :)",
  "filbert hasn't fed us today smh",
  "i can't feel my feet actually",
  "we don't get paid for this",
  "i peaked at birth honestly",
  "this water isn't even real",
  "nice weather today",
  "quack",
  "QUACK QUACK QUACK",
  "quack",
  "...",
  "u ever wonder what's below the water",
  "stop following me",
  "race u to the other side",
  "i think i'm the favorite duck",
  "don't tell filbert i said this but the pond is kinda small",
];

const FISH_QUOTES = [
  "YO IS THAT A FISH",
  "omg a fish!!",
  "bro there's a FISH",
  "FISH FISH FISH",
  "wait... do fish even live here",
  "GET IT GET IT",
  "dibs on the fish",
  "that fish is MINE",
  "yo who invited the fish",
  "a fish?? in THIS economy?",
  "nature is healing 🐟",
];

function pickRandomQuote(list: string[], exclude?: string): string {
  const candidates = exclude ? list.filter((item) => item !== exclude) : list;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* ============================================================================
 * 6. MAIN DUCK POND COMPONENT
 * ============================================================================ */

export interface DuckPondProps {
  fill?: boolean;
  duckStyle?: DuckVisualStyle;
  isDark?: boolean;
}

export function DuckPond({
  fill = false,
  duckStyle = "rubber",
  isDark = false,
}: DuckPondProps) {
  const waterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const reedsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visRef = useRef(true);

  const bgRgb = isDark ? DARK_BG_RGB : LIGHT_BG_RGB;

  const {
    timeRef,
    triggerRippleAt,
    resume: resumeWater,
  } = useWaterWebGL(waterCanvasRef, overlayCanvasRef, visRef, bgRgb);

  const { resume: resumeReeds } = useReedsCanvas(
    reedsCanvasRef,
    timeRef,
    visRef
  );

  // Speech bubble state
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const lastQuoteRef = useRef<string | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDuckClick = useCallback((idx: number) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    const quote = pickRandomQuote(DUCK_QUOTES, lastQuoteRef.current ?? undefined);
    lastQuoteRef.current = quote;
    setBubbleText(quote);
    setSpeakerIndex(idx);
    bubbleTimerRef.current = setTimeout(
      () => setBubbleText(null),
      4000 + 1500 * Math.random()
    );
  }, []);

  const onFishSpawn = useCallback((idx: number) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setBubbleText(pickRandomQuote(FISH_QUOTES));
    setSpeakerIndex(idx);
    bubbleTimerRef.current = setTimeout(
      () => setBubbleText(null),
      3500 + 1500 * Math.random()
    );
  }, []);

  const bubbleNode = (
    <AnimatePresence>
      {bubbleText && (
        <motion.div
          key="duck-bubble"
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="relative px-3 py-1 bg-white rounded-xl shadow-sm border border-black/[0.06] max-w-[200px] whitespace-normal">
            <p className="text-[10px] sm:text-[11px] text-[#2a2520]/70 font-sans leading-relaxed m-0">
              {bubbleText}
            </p>
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-black/[0.06] rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Aspect ratio tracking
  const aspectRef = useRef(1.5);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateAspect = () => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        aspectRef.current = el.offsetWidth / el.offsetHeight;
      }
    };
    updateAspect();
    const ro = new ResizeObserver(updateAspect);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Floats simulation state
  const floatsRef = useRef<FloatEntity[]>([]);
  const nextBoostTimeRef = useRef(0);
  const vortexRef = useRef<{
    start: number;
    end: number;
    cx: number;
    cy: number;
  } | null>(null);
  const nextVortexTimeRef = useRef(0);
  const foodsRef = useRef<FoodCluster[]>([]);
  const nextFoodIdRef = useRef(0);
  const feedClickCountRef = useRef(0);
  const onRippleRef = useRef(triggerRippleAt);

  useEffect(() => {
    onRippleRef.current = triggerRippleAt;
  }, [triggerRippleAt]);

  const addFloat = useCallback((nx: number, ny: number, now: number) => {
    const active = floatsRef.current.filter(
      (f) => f.action !== "drowning" && f.action !== "leaving"
    );
    if (active.length >= 15) {
      const oldest = active[0];
      oldest.action = "leaving";
      const dLeft = oldest.nx;
      const dRight = 1 - oldest.nx;
      const dTop = oldest.ny;
      const dBottom = 1 - oldest.ny;
      const minD = Math.min(dLeft, dRight, dTop, dBottom);
      if (minD === dLeft) oldest.heading = Math.PI;
      else if (minD === dRight) oldest.heading = 0;
      else if (minD === dTop) oldest.heading = -Math.PI / 2;
      else oldest.heading = Math.PI / 2;
      oldest.heading += (Math.random() - 0.5) * 0.3;
      oldest.speed = 1.2;
      oldest.speedBoost = 1.5;
      oldest.actionEnd = now + 4;
    }

    const heading = Math.random() * Math.PI * 2;
    const turnRate = (Math.random() - 0.5) * 0.6;
    floatsRef.current.push({
      id: nextFloatId++,
      variant: {
        kind: "duck",
        color: FLOAT_COLORS[Math.floor(Math.random() * FLOAT_COLORS.length)],
        mallard: Math.random() < 0.06,
      },
      nx,
      ny,
      offsetY: 0,
      rotation: (180 / Math.PI) * heading,
      spawnTime: now,
      scale: 0,
      phase: 100 * Math.random(),
      heading,
      actionEnd: now + 1 + 2 * Math.random(),
      action: "float",
      paddleIntensity: 0,
      turnRate,
      speed: 0,
      lastRipple: 0,
      drowning: false,
      opacity: 1,
      speedBoost: 1,
      waveVx: 0,
      waveVy: 0,
    });
  }, []);

  const addFish = useCallback((nx: number, ny: number, now: number) => {
    const heading = Math.random() * Math.PI * 2;
    floatsRef.current.push({
      id: nextFloatId++,
      variant: { kind: "fish", color: "yellow" },
      nx,
      ny,
      offsetY: 0,
      rotation: (180 / Math.PI) * heading,
      spawnTime: now,
      scale: 0,
      phase: 100 * Math.random(),
      heading,
      actionEnd: now + 1 + 2 * Math.random(),
      action: "paddle",
      paddleIntensity: 0,
      turnRate: 0,
      speed: 0,
      lastRipple: 0,
      drowning: false,
      opacity: 1,
      speedBoost: 1,
      waveVx: 0,
      waveVy: 0,
    });
  }, []);

  const dropFood = useCallback(
    (nx: number, ny: number, now: number) => {
      feedClickCountRef.current++;
      if (feedClickCountRef.current % 4 === 0) {
        addFish(nx, ny, now);
        onRippleRef.current?.(nx, ny, 0.5);
        return { id: -1, spawnedFish: true };
      }
      const id = nextFoodIdRef.current++;
      foodsRef.current.push({
        id,
        nx,
        ny,
        startTime: now,
        arrivedTime: null,
      });
      return { id, spawnedFish: false };
    },
    [addFish]
  );

  const ducksBufRef = useRef<FloatEntity[]>([]);
  const fishBufRef = useRef<FloatEntity[]>([]);
  const fishChasersRef = useRef<Map<number, number>>(new Map());

  // DOM synchronization loop
  const floatRafRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const floatDomMapRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const foodDomMapRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const speechDomRef = useRef<HTMLDivElement | null>(null);
  const speakerIdxRef = useRef(speakerIndex);

  useEffect(() => {
    speakerIdxRef.current = speakerIndex;
  }, [speakerIndex]);

  const [renderedFloats, setRenderedFloats] = useState<
    {
      id: number;
      variant: FloatVariant;
      paddling: boolean;
      eating: boolean;
      burst: boolean;
    }[]
  >([]);
  const stateHashRef = useRef("");

  const [feedMode, setFeedMode] = useState(false);
  const [foodGroups, setFoodGroups] = useState<VisualFoodGroup[]>([]);
  const foodGroupsRef = useRef<VisualFoodGroup[]>([]);
  const floatTickRef = useRef<() => void>(() => {});

  useEffect(() => {
    foodGroupsRef.current = foodGroups;
  }, [foodGroups]);

  useEffect(() => {
    if (nextVortexTimeRef.current === 0) {
      nextVortexTimeRef.current = 12 + 4 * Math.random();
    }

    const updateFloats = (now: number, dt: number) => {
      const ducks = ducksBufRef.current;
      ducks.length = 0;
      const fishes = fishBufRef.current;
      fishes.length = 0;

      for (const f of floatsRef.current) {
        if (f.variant.kind === "duck") ducks.push(f);
        else if (f.variant.kind === "fish") fishes.push(f);
      }

      // Random paddle speed boost
      if (now >= nextBoostTimeRef.current && ducks.length > 0) {
        const paddlingDucks = ducks.filter((d) => d.action === "paddle");
        if (paddlingDucks.length > 0) {
          const chosen =
            paddlingDucks[Math.floor(Math.random() * paddlingDucks.length)];
          chosen.speedBoost = Math.random() < 0.2 ? 3.2 : 1.6;
        }
        nextBoostTimeRef.current = now + 1.5 + Math.random();
      }

      // Group whirlpool / circle swim
      const vortex = vortexRef.current;
      if (vortex && now > vortex.end) {
        vortexRef.current = null;
        nextVortexTimeRef.current = now + 10 + 6 * Math.random();
      }
      if (
        !vortexRef.current &&
        now >= nextVortexTimeRef.current &&
        ducks.length >= 3
      ) {
        const centerDucks = ducks.filter(
          (d) =>
            d.action !== "drowning" &&
            Math.abs(d.nx - 0.5) < 0.25 &&
            Math.abs(d.ny - 0.5) < 0.25
        );
        if (centerDucks.length >= 2) {
          vortexRef.current = {
            start: now,
            end: now + 4,
            cx:
              centerDucks.reduce((sum, d) => sum + d.nx, 0) /
              centerDucks.length,
            cy:
              centerDucks.reduce((sum, d) => sum + d.ny, 0) /
              centerDucks.length,
          };
          for (const d of centerDucks) {
            if (d.action === "float") {
              d.action = "paddle";
              d.actionEnd = now + 5;
            }
          }
        }
      }

      // Expire eaten food clusters
      foodsRef.current = foodsRef.current.filter(
        (f) => f.arrivedTime === null || now - f.arrivedTime < 2.5
      );

      // Assign 1 chaser duck per fish
      const chasers = fishChasersRef.current;
      const aliveFishIds = new Set(
        fishes
          .filter(
            (f) =>
              f.action !== "drowning" &&
              f.action !== "leaving" &&
              f.opacity !== -1
          )
          .map((f) => f.id)
      );
      for (const fishId of chasers.keys()) {
        if (!aliveFishIds.has(fishId)) chasers.delete(fishId);
      }
      const assignedDucks = new Set(chasers.values());
      for (const fishId of aliveFishIds) {
        if (
          chasers.has(fishId) &&
          ducks.some(
            (d) =>
              d.id === chasers.get(fishId) &&
              d.action !== "drowning" &&
              d.action !== "leaving"
          )
        ) {
          continue;
        }
        const fish = fishes.find((f) => f.id === fishId);
        if (!fish) continue;
        let bestDist = Infinity;
        let bestDuckId = -1;
        for (const d of ducks) {
          if (
            d.action === "drowning" ||
            d.action === "leaving" ||
            assignedDucks.has(d.id)
          ) {
            continue;
          }
          const dx = fish.nx - d.nx;
          const dy = fish.ny - d.ny;
          const distSq = dx * dx + dy * dy;
          if (distSq < bestDist) {
            bestDist = distSq;
            bestDuckId = d.id;
          }
        }
        if (bestDuckId >= 0) {
          chasers.set(fishId, bestDuckId);
          assignedDucks.add(bestDuckId);
        }
      }

      const smoothFactor = 1 - Math.pow(0.01, dt);
      let needsCleanup = false;

      for (const entity of floatsRef.current) {
        // Pop-in spawn animation
        if (entity.action !== "drowning" && entity.action !== "leaving") {
          const age = now - entity.spawnTime;
          if (age < 0.35) {
            const t = age / 0.35;
            entity.scale =
              t < 0.6 ? (t / 0.6) * 1.15 : 1.15 - ((t - 0.6) / 0.4) * 0.15;
          } else {
            entity.scale = 1;
          }
        }

        // Sample wave height & slope at entity's UV
        const aspect = aspectRef.current;
        const uvX = aspect >= 1 ? entity.nx * aspect * 30 : 30 * entity.nx;
        const uvY = aspect >= 1 ? 30 * entity.ny : (entity.ny / aspect) * 30;
        const { height, slopeX, slopeY } = getCpuHeightAndSlope(uvX, uvY, now);

        entity.offsetY += (0.8 * height - entity.offsetY) * smoothFactor;
        const targetWaveVx = -0.006 * slopeX;
        const targetWaveVy = -0.006 * slopeY;
        const waveBlend = Math.min(1, 3 * dt);
        entity.waveVx += (targetWaveVx - entity.waveVx) * waveBlend;
        entity.waveVy += (targetWaveVy - entity.waveVy) * waveBlend;

        const isDuck = entity.variant.kind === "duck";

        // Fish behavior
        if (
          entity.variant.kind === "fish" &&
          entity.action !== "drowning" &&
          entity.action !== "leaving"
        ) {
          let fleeX = 0;
          let fleeY = 0;
          let nearestDuckSq = Infinity;
          for (const d of ducks) {
            if (
              d.variant.kind !== "duck" ||
              d.action === "drowning" ||
              d.action === "leaving"
            ) {
              continue;
            }
            const dx = entity.nx - d.nx;
            const dy = entity.ny - d.ny;
            const dSq = dx * dx + dy * dy;
            if (dSq < nearestDuckSq) {
              nearestDuckSq = dSq;
              fleeX = dx;
              fleeY = dy;
            }
          }
          const isBurst = ((now + entity.phase) % 1.3) / 1.3 < 0.62;
          const cx = 0.5 - entity.nx;
          const cy = 0.5 - entity.ny;
          const centerDist = Math.sqrt(cx * cx + cy * cy);
          const centerAngle = Math.atan2(cy, cx);

          if (nearestDuckSq < 0.0625) {
            const fleeAngle = Math.atan2(fleeY, fleeX);
            const blended =
              fleeAngle +
              Math.atan2(
                Math.sin(centerAngle - fleeAngle),
                Math.cos(centerAngle - fleeAngle)
              ) *
                Math.min(1, 4 * centerDist) *
                0.5;
            const wiggle = 0.2 * Math.sin(3 * now + entity.phase);
            entity.heading +=
              (blended + wiggle - entity.heading) *
              Math.min(1, dt * (isBurst ? 12 : 4));
            entity.action = "paddle";
          } else {
            entity.heading +=
              (centerAngle +
                0.5 * Math.sin(2 * now + entity.phase) -
                entity.heading) *
              Math.min(1, dt * (centerDist > 0.15 ? 6 : 2));
          }

          entity.speed +=
            ((isBurst ? 1.8 : 0.3) - entity.speed) *
            Math.min(1, dt * (isBurst ? 8 : 3));
          const vx = 0.06 * Math.cos(entity.heading) * entity.speed;
          const vy = 0.06 * Math.sin(entity.heading) * entity.speed;
          entity.nx += (entity.waveVx + vx) * dt;
          entity.ny += (entity.waveVy + vy) * dt;
          entity.nx = Math.max(0.12, Math.min(0.88, entity.nx));
          entity.ny = Math.max(0.12, Math.min(0.88, entity.ny));

          if (Math.sqrt(vx * vx + vy * vy) > 0.0003) {
            const targetRot = (180 / Math.PI) * Math.atan2(vx, -vy);
            entity.rotation = lerpAngleDeg(
              entity.rotation,
              targetRot,
              smoothFactor * (isBurst ? 0.85 : 0.3)
            );
          }
          entity.paddleIntensity = isBurst ? 1 : 0.2;
          if (
            onRippleRef.current &&
            isBurst &&
            entity.speed > 0.5 &&
            now - entity.lastRipple > 0.2
          ) {
            const rx = entity.nx - 0.015 * Math.cos(entity.heading);
            const ry = entity.ny - 0.015 * Math.sin(entity.heading);
            if (rx > 0.02 && rx < 0.98 && ry > 0.02 && ry < 0.98) {
              onRippleRef.current(rx, ry, 0.35);
              entity.lastRipple = now;
            }
          }
          clampEntityInsidePond(entity);
          continue;
        }

        // Duck behavior
        if (
          isDuck &&
          entity.action !== "drowning" &&
          entity.action !== "leaving"
        ) {
          // Flocking forces
          let sepX = 0;
          let sepY = 0;
          let cohX = 0;
          let cohY = 0;
          let sinSum = 0;
          let cosSum = 0;
          let neighborCount = 0;

          for (const other of ducks) {
            if (other.id === entity.id) continue;
            const dx = other.nx - entity.nx;
            const dy = other.ny - entity.ny;
            const dSq = dx * dx + dy * dy;
            if (dSq <= FLOCK_RADIUS_SQ && dSq >= 1e-6) {
              neighborCount++;
              cohX += other.nx;
              cohY += other.ny;
              sinSum += Math.sin(other.heading);
              cosSum += Math.cos(other.heading);
              if (dSq < 0.0036) {
                const d = Math.sqrt(dSq);
                const push = (0.06 - d) / 0.06;
                sepX -= (dx / d) * push;
                sepY -= (dy / d) * push;
              }
            }
          }

          const flockFx =
            neighborCount === 0
              ? 0
              : 0.03 * sepX + 0.008 * (cohX / neighborCount - entity.nx);
          const flockFy =
            neighborCount === 0
              ? 0
              : 0.03 * sepY + 0.008 * (cohY / neighborCount - entity.ny);
          const alignHeading =
            neighborCount === 0
              ? null
              : Math.atan2(sinSum / neighborCount, cosSum / neighborCount);
          const hasFlock = alignHeading !== null;

          let targetFish: FloatEntity | undefined;
          if (fishes.length > 0) {
            for (const [fId, dId] of chasers.entries()) {
              if (dId === entity.id) {
                targetFish = fishes.find((f) => f.id === fId);
                break;
              }
            }
          }

          let targetFood: FoodCluster | null = null;
          if (!targetFish && foodsRef.current.length > 0) {
            let bestSq = Infinity;
            for (const fc of foodsRef.current) {
              const dx = fc.nx - entity.nx;
              const dy = fc.ny - entity.ny;
              const dSq = dx * dx + dy * dy;
              if (dSq < bestSq) {
                bestSq = dSq;
                targetFood = fc;
              }
            }
          }

          if (targetFood) {
            const dx = targetFood.nx - entity.nx;
            const dy = targetFood.ny - entity.ny;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.045) {
              if (entity.action === "paddle") {
                entity.action = "float";
                entity.actionEnd = now + 10;
                entity.speed *= 0.3;
              }
              if (targetFood.arrivedTime === null) {
                targetFood.arrivedTime = now;
                sfx.nibble(entity.nx);
              }
            } else {
              entity.heading =
                Math.atan2(dy, dx) + 0.12 * Math.sin(entity.phase + 2 * now);
              entity.action = "paddle";
              entity.actionEnd = now + 2;
              const factor = Math.min(1, dist / 0.3);
              entity.speed += (0.6 + 0.4 * factor - entity.speed) * 0.1;
            }
          } else if (targetFish) {
            if (
              targetFish.action !== "drowning" &&
              targetFish.action !== "leaving" &&
              targetFish.opacity !== -1
            ) {
              const dx = targetFish.nx - entity.nx;
              const dy = targetFish.ny - entity.ny;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 0.035) {
                targetFish.opacity = -1;
                onRippleRef.current?.(targetFish.nx, targetFish.ny, 0.5);
                sfx.chomp(targetFish.nx);
                needsCleanup = true;
              } else {
                entity.heading =
                  Math.atan2(dy, dx) + 0.08 * Math.sin(entity.phase + 2 * now);
                entity.action = "paddle";
                entity.actionEnd = now + 1;
                entity.speed +=
                  (1 + 0.3 * Math.min(1, dist / 0.2) - entity.speed) * 0.15;
              }
            }
          } else {
            // Autonomous state transitions
            if (now > entity.actionEnd) {
              if (entity.action === "float") {
                entity.action = "paddle";
                entity.turnRate = hasFlock
                  ? (Math.random() - 0.5) * 0.1
                  : (Math.random() - 0.5) * 0.5;
                const cx = 0.5 - entity.nx;
                const cy = 0.5 - entity.ny;
                if (Math.sqrt(cx * cx + cy * cy) > 0.25) {
                  entity.heading =
                    Math.atan2(cy, cx) + (Math.random() - 0.5) * 0.8;
                } else if (
                  hasFlock &&
                  alignHeading !== null &&
                  Math.random() < 0.6
                ) {
                  entity.heading = alignHeading + (Math.random() - 0.5) * 0.4;
                } else {
                  entity.heading += (Math.random() - 0.5) * Math.PI * 0.7;
                }
                entity.actionEnd = hasFlock
                  ? now + 4 + 4 * Math.random()
                  : now + 2 + 3 * Math.random();
              } else {
                entity.action = "float";
                entity.turnRate = (Math.random() - 0.5) * 0.15;
                const longRest = !hasFlock && Math.random() < 0.3;
                entity.actionEnd = hasFlock
                  ? now + 1 + 2 * Math.random()
                  : longRest
                    ? now + 6 + 8 * Math.random()
                    : now + 2 + 4 * Math.random();
              }
            }

            // Social contagion: join nearby paddling ducks
            if (entity.action === "float") {
              const nearbyPaddling = ducks.some((other) => {
                if (
                  other.id === entity.id ||
                  other.action !== "paddle" ||
                  other.speed <= 0.3
                ) {
                  return false;
                }
                const dx = other.nx - entity.nx;
                const dy = other.ny - entity.ny;
                return dx * dx + dy * dy < FLOCK_RADIUS_SQ;
              });
              if (nearbyPaddling && Math.random() < 0.05) {
                entity.action = "paddle";
                entity.turnRate = (Math.random() - 0.5) * 0.1;
                entity.heading =
                  (alignHeading ?? 0) + (Math.random() - 0.5) * 0.2;
                entity.actionEnd = now + 3 + 3 * Math.random();
              }
            }
          }

          // Speed & paddle intensity update
          if (entity.action === "paddle") {
            const base = 0.8 + 0.2 * Math.sin(entity.phase);
            entity.speed +=
              ((hasFlock ? 1.15 * base : base) - entity.speed) *
              Math.min(1, 2.5 * dt);
          } else {
            entity.speed *= Math.pow(0.15, dt);
            if (entity.speed < 0.005) entity.speed = 0;
          }
          const targetIntensity = entity.action === "paddle" ? 1 : 0;
          entity.paddleIntensity +=
            (targetIntensity - entity.paddleIntensity) * Math.min(1, 3 * dt);
          entity.speedBoost += (1 - entity.speedBoost) * Math.min(1, 1.5 * dt);

          // Steering & boundary avoidance
          let turn = entity.turnRate;
          if (alignHeading !== null && entity.paddleIntensity > 0.1) {
            const diff = alignHeading - entity.heading;
            turn +=
              1.2 *
              Math.atan2(Math.sin(diff), Math.cos(diff)) *
              entity.paddleIntensity;
          }
          let wallX = 0;
          let wallY = 0;
          if (entity.nx < 0.15) wallX = (0.15 - entity.nx) / 0.15;
          if (entity.nx > 0.85) wallX = -(entity.nx - 0.85) / 0.15;
          if (entity.ny < 0.15) wallY = (0.15 - entity.ny) / 0.15;
          if (entity.ny > 0.85) wallY = -(entity.ny - 0.85) / 0.15;
          if (wallX !== 0 || wallY !== 0) {
            const wallAngle = Math.atan2(wallY, wallX);
            turn +=
              Math.atan2(
                Math.sin(wallAngle - entity.heading),
                Math.cos(wallAngle - entity.heading)
              ) *
              Math.sqrt(wallX * wallX + wallY * wallY) *
              2.5;
          }
          const activeVortex = vortexRef.current;
          if (activeVortex) {
            const dx = entity.nx - activeVortex.cx;
            const dy = entity.ny - activeVortex.cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.25) {
              const tangentAngle = Math.atan2(dx, -dy);
              const diff = Math.atan2(
                Math.sin(tangentAngle - entity.heading),
                Math.cos(tangentAngle - entity.heading)
              );
              const env = Math.sin(
                ((now - activeVortex.start) /
                  (activeVortex.end - activeVortex.start)) *
                  Math.PI
              );
              const falloff = 1 - dist / 0.25;
              turn += diff * falloff * env * 3;
              const inwardAngle = Math.atan2(-dy, -dx);
              turn +=
                Math.atan2(
                  Math.sin(inwardAngle - entity.heading),
                  Math.cos(inwardAngle - entity.heading)
                ) *
                falloff *
                env *
                0.4;
            }
          }
          entity.heading += turn * dt;

          // Position & rotation integration
          const speedScale = hasFlock ? 0.06 : 0.05;
          const selfVx =
            Math.cos(entity.heading) *
            speedScale *
            entity.speed *
            entity.speedBoost;
          const selfVy =
            Math.sin(entity.heading) *
            speedScale *
            entity.speed *
            entity.speedBoost;
          const waddleDeg =
            entity.paddleIntensity > 0.1
              ? 0.8 * Math.sin(5 * now + entity.phase) * entity.paddleIntensity
              : 0;
          const totalVx = entity.waveVx + selfVx + flockFx;
          const totalVy = entity.waveVy + selfVy + flockFy;
          entity.nx += totalVx * dt;
          entity.ny += totalVy * dt;

          const intentVx = selfVx + flockFx;
          const intentVy = selfVy + flockFy;
          const intentMag = Math.sqrt(intentVx * intentVx + intentVy * intentVy);
          if (Math.sqrt(totalVx * totalVx + totalVy * totalVy) > 0.0003) {
            const targetRot =
              (180 / Math.PI) *
                Math.atan2(
                  intentMag > 0.0002 ? intentVx : totalVx,
                  -(intentMag > 0.0002 ? intentVy : totalVy)
                ) +
              waddleDeg;
            const rotRate = entity.speed > 0.1 ? 0.18 : 0.04;
            entity.rotation = lerpAngleDeg(
              entity.rotation,
              targetRot,
              smoothFactor * rotRate
            );
          }

          // Wake ripples
          if (
            onRippleRef.current &&
            entity.speed > 0.15 &&
            now - entity.lastRipple > 0.3
          ) {
            const rx = entity.nx - 0.02 * Math.cos(entity.heading);
            const ry = entity.ny - 0.02 * Math.sin(entity.heading);
            if (rx > 0.02 && rx < 0.98 && ry > 0.02 && ry < 0.98) {
              onRippleRef.current(rx, ry, 0.55);
              entity.lastRipple = now;
            }
          }
        } else if (entity.action === "leaving") {
          const progress = Math.min(1, (now - (entity.actionEnd - 4)) / 4);
          const vx =
            0.08 * Math.cos(entity.heading) * entity.speed * entity.speedBoost;
          const vy =
            0.08 * Math.sin(entity.heading) * entity.speed * entity.speedBoost;
          entity.nx += vx * dt;
          entity.ny += vy * dt;
          const targetRot = (180 / Math.PI) * Math.atan2(vx, -vy);
          entity.rotation = lerpAngleDeg(
            entity.rotation,
            targetRot,
            Math.min(1, 3 * dt)
          );
          entity.speedBoost += (1 - entity.speedBoost) * Math.min(1, 0.8 * dt);
          if (
            onRippleRef.current &&
            entity.speed > 0.1 &&
            now - entity.lastRipple > 0.25
          ) {
            onRippleRef.current(
              entity.nx - 0.02 * Math.cos(entity.heading),
              entity.ny - 0.02 * Math.sin(entity.heading),
              0.4
            );
            entity.lastRipple = now;
          }
          if (progress > 0.5) {
            const fade = (progress - 0.5) / 0.5;
            entity.scale = Math.max(0, 1 - 0.7 * fade);
            entity.opacity = Math.max(0, 1 - fade);
          }
          if (
            progress >= 1 ||
            entity.nx < -0.02 ||
            entity.nx > 1.02 ||
            entity.ny < -0.02 ||
            entity.ny > 1.02
          ) {
            entity.opacity = -1;
            needsCleanup = true;
          }
        }

        clampEntityInsidePond(entity);
      }

      if (needsCleanup) {
        floatsRef.current = floatsRef.current.filter((f) => f.opacity !== -1);
      }
    };

    const loop = () => {
      if (!visRef.current) return;
      const now = timeRef.current ?? 0;
      const dt =
        lastFrameTimeRef.current > 0
          ? Math.min(now - lastFrameTimeRef.current, 0.05)
          : 0.016;
      lastFrameTimeRef.current = now;
      updateFloats(now, dt);

      const list = floatsRef.current;
      let hash = list.length;
      for (const f of list) {
        hash =
          31 * (31 * hash + f.id) +
          (f.action === "paddle"
            ? 1
            : f.action === "drowning"
              ? 2
              : f.action === "leaving"
                ? 3
                : 0);
        if (f.variant.kind === "fish") {
          hash = 31 * hash + (f.paddleIntensity > 0.5 ? 5 : 6);
        }
      }
      const hashStr = String(hash);
      if (hashStr !== stateHashRef.current) {
        stateHashRef.current = hashStr;
        setRenderedFloats(
          list.map((f) => ({
            id: f.id,
            variant: f.variant,
            paddling: f.action === "paddle" || f.action === "leaving",
            eating: false,
            burst: f.variant.kind === "fish" && f.paddleIntensity > 0.5,
          }))
        );
      }

      for (const f of list) {
        const el = floatDomMapRef.current.get(f.id);
        if (el) {
          el.style.left = `${100 * f.nx}%`;
          el.style.top = `${100 * f.ny}%`;
          el.style.transform = `translate(-50%,-50%) translateY(${-f.offsetY}px) rotate(${f.rotation}deg) scale(${f.scale})`;
          el.style.opacity = String(f.opacity);
        }
      }

      const bubbleEl = speechDomRef.current;
      if (bubbleEl && list.length > 0) {
        const speaker = list[speakerIdxRef.current % list.length];
        bubbleEl.style.left = `${100 * speaker.nx}%`;
        bubbleEl.style.top = `${100 * speaker.ny}%`;
        bubbleEl.style.transform =
          "translate(-50%, -100%) translateY(-28px)";
        bubbleEl.style.opacity = String(speaker.opacity);
      }

      if (foodGroupsRef.current.length > 0) {
        const activeFoods = foodsRef.current;
        for (const [id, el] of foodDomMapRef.current.entries()) {
          const fc = activeFoods.find((item) => item.id === id);
          if (fc) {
            if (fc.arrivedTime !== null) {
              const t = (now - fc.arrivedTime) / 2.5;
              el.style.opacity = String(Math.max(0, 1 - t * t));
            } else {
              el.style.opacity = "1";
            }
          } else {
            el.style.opacity = "0";
          }
        }
        const aliveIds = new Set(activeFoods.map((item) => item.id));
        setFoodGroups((prev) => {
          const filtered = prev.filter((g) => aliveIds.has(g.foodId));
          if (filtered.length !== prev.length) {
            foodGroupsRef.current = filtered;
          }
          return filtered.length === prev.length ? prev : filtered;
        });
      }

      floatRafRef.current = requestAnimationFrame(loop);
    };

    floatTickRef.current = loop;
    floatRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(floatRafRef.current);
  }, [timeRef, visRef]);

  const resumeFloats = useCallback(() => {
    cancelAnimationFrame(floatRafRef.current);
    floatRafRef.current = requestAnimationFrame(() => floatTickRef.current());
  }, []);

  // IntersectionObserver to pause/resume when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasHidden = !visRef.current;
        visRef.current = entry.isIntersecting;
        if (wasHidden && entry.isIntersecting) {
          resumeWater();
          resumeReeds();
          resumeFloats();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [resumeWater, resumeReeds, resumeFloats]);

  // Spawn initial 2 ducks on mount (StrictMode-safe)
  const didInitialSpawnRef = useRef(false);
  useEffect(() => {
    if (didInitialSpawnRef.current || floatsRef.current.length > 0) return;
    let raf = 0;
    let t1 = 0;
    let t2 = 0;
    const checkReady = () => {
      if (timeRef.current && timeRef.current > 0) {
        const spawnAt = (nx: number, ny: number, markSpawned?: boolean) => () => {
          if (markSpawned) didInitialSpawnRef.current = true;
          addFloat(nx, ny, timeRef.current ?? 0);
          triggerRippleAt(nx, ny);
        };
        t1 = window.setTimeout(
          spawnAt(0.35 + 0.1 * Math.random(), 0.4 + 0.1 * Math.random(), true),
          200
        );
        t2 = window.setTimeout(
          spawnAt(0.55 + 0.1 * Math.random(), 0.55 + 0.1 * Math.random(), false),
          800
        );
      } else {
        raf = requestAnimationFrame(checkReady);
      }
    };
    raf = requestAnimationFrame(checkReady);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [addFloat, timeRef, triggerRippleAt]);

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;

      if (feedMode) {
        const { id, spawnedFish } = dropFood(nx, ny, timeRef.current ?? 0);
        if (spawnedFish) {
          sfx.surface(nx);
          const nonFish = floatsRef.current
            .map((f, idx) => ({ f, idx }))
            .filter(({ f }) => f.variant?.kind !== "fish");
          let closestIdx = -1;
          let closestDist = Infinity;
          for (const { f, idx } of nonFish) {
            const dx = f.nx - nx;
            const dy = f.ny - ny;
            const dSq = dx * dx + dy * dy;
            if (dSq < closestDist) {
              closestDist = dSq;
              closestIdx = idx;
            }
          }
          if (closestIdx >= 0) {
            onFishSpawn(closestIdx);
            const speakerNx = floatsRef.current[closestIdx]?.nx ?? nx;
            setTimeout(() => sfx.chirp(closestIdx, speakerNx), 190);
          }
        } else {
          sfx.pellets(nx);
          triggerRippleAt(nx, ny);
          setFoodGroups((prev) => {
            const next: VisualFoodGroup[] = [
              ...prev,
              {
                foodId: id,
                pellets: Array.from(
                  { length: 5 + Math.floor(4 * Math.random()) },
                  () => ({
                    x: nx + (Math.random() - 0.5) * 0.08,
                    y: ny + (Math.random() - 0.5) * 0.08,
                    size: 5 + 6 * Math.random(),
                    hue: 28 + 16 * Math.random(),
                    blur: 2 + 2 * Math.random(),
                  })
                ),
              },
            ];
            foodGroupsRef.current = next;
            return next;
          });
        }
      } else {
        addFloat(nx, ny, timeRef.current ?? 0);
        triggerRippleAt(nx, ny);
        sfx.plop(nx);
      }
    },
    [addFloat, dropFood, feedMode, onFishSpawn, timeRef, triggerRippleAt]
  );

  const toggleFeedMode = useCallback(() => {
    setFeedMode((prev) => !prev);
  }, []);

  const setFloatRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      if (el) floatDomMapRef.current.set(id, el);
      else floatDomMapRef.current.delete(id);
    },
    []
  );

  const setFoodRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      if (el) foodDomMapRef.current.set(id, el);
      else foodDomMapRef.current.delete(id);
    },
    []
  );

  return (
    <div
      className="relative flex flex-col items-center"
      style={fill ? { width: "100%", height: "100%" } : undefined}
    >
      {!fill && (
        <div className="h-6 mb-1.5 flex items-center justify-center">
          {feedMode && (
            <span
              className="font-sans text-[11px] tracking-wide text-[#2a2520]/40 dark:text-white/40"
              style={{ letterSpacing: "0.06em" }}
            >
              tap anywhere to feed the ducks
            </span>
          )}
        </div>
      )}

      <div
        className={
          fill
            ? "relative w-full h-full"
            : "relative w-[88vw] h-[45dvh] sm:w-[70vw] sm:h-[65vh] max-w-[900px] max-h-[600px]"
        }
      >
        <div
          ref={containerRef}
          className="relative w-full h-full border-0 outline-none rounded-sm overflow-hidden"
          style={{ cursor: feedMode ? "crosshair" : "pointer" }}
          onClick={handleTap}
        >
          <div className="absolute inset-[1.25px] overflow-hidden">
            {/* Layer 1: WebGL Seascape Water & Ripples */}
            <canvas
              key="water-webgl-canvas-v3"
              ref={waterCanvasRef}
              className="absolute pointer-events-none"
              style={{
                inset: "-1.25px",
                width: "calc(100% + 2.5px)",
                height: "calc(100% + 2.5px)",
              }}
            />

            {/* Layer 2: Food Pellets & Floating Ducks / Fish */}
            {foodGroups.map((group) => (
              <div
                key={`food-${group.foodId}`}
                ref={setFoodRef(group.foodId)}
                className="absolute inset-0 pointer-events-none"
                style={{
                  transition: "opacity 0.8s ease-out",
                  willChange: "opacity",
                }}
              >
                {group.pellets.map((pellet, idx) => (
                  <div
                    key={idx}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${100 * pellet.x}%`,
                      top: `${100 * pellet.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: pellet.size,
                        height: pellet.size,
                        background: `radial-gradient(circle, hsla(${pellet.hue}, 45%, 60%, 0.5) 0%, hsla(${pellet.hue}, 40%, 45%, 0.3) 50%, hsla(${pellet.hue}, 35%, 35%, 0.1) 100%)`,
                        filter: `blur(${pellet.blur}px)`,
                        boxShadow: `0 0 ${2 * pellet.size}px hsla(${pellet.hue}, 35%, 50%, 0.2)`,
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}

            {renderedFloats.map((item, idx) => (
              <div
                key={item.id}
                ref={setFloatRef(item.id)}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  willChange: "transform, opacity",
                  overflow: item.eating ? "visible" : undefined,
                  filter:
                    "blur(0.45px) drop-shadow(0 0 3px rgba(42,37,32,0.08))",
                }}
                onClick={(ev) => {
                  ev.stopPropagation();
                  sfx.chirp(idx, floatsRef.current[idx]?.nx ?? 0.5);
                  onDuckClick(idx);
                }}
              >
                <FloatSprite
                  variant={item.variant}
                  size={item.variant.kind === "fish" ? 48 : 72}
                  paddling={item.paddling}
                  eating={item.eating}
                  burst={item.burst}
                  duckStyle={duckStyle}
                />
              </div>
            ))}

            {/* Layer 3: Film Grain, Radial Fog, Light Leaks & Soft SDF Bank Mask */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute pointer-events-none"
              style={{
                inset: "-1.25px",
                width: "calc(100% + 2.5px)",
                height: "calc(100% + 2.5px)",
              }}
            />
          </div>
        </div>

        {/* Speech Bubble Overlay */}
        <div
          ref={speechDomRef}
          className="absolute pointer-events-none"
          style={{ willChange: "transform, opacity", zIndex: 50 }}
        >
          {bubbleNode}
        </div>

        {/* Layer 4: Wind-Swaying Cattails & Reeds around the Pond Bank */}
        <canvas
          ref={reedsCanvasRef}
          className="absolute pointer-events-none"
          style={{
            inset: "-200px",
            width: "calc(100% + 400px)",
            height: "calc(100% + 400px)",
            zIndex: 7,
          }}
        />
      </div>

      {!fill && (
        <div className="mt-2" style={{ zIndex: 20 }}>
          <FeedButton active={feedMode} onClick={toggleFeedMode} />
        </div>
      )}
    </div>
  );
}
