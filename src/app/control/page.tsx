"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { usePrototypeControl } from "@/components/prototype-control";

export default function ControlPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const router = useRouter();
  const { setIsOpen } = usePrototypeControl();

  useEffect(() => {
    // Open Prototype Control automatically when visiting /control
    setIsOpen(true);
  }, [setIsOpen]);

  return (
    <div className="min-h-screen bg-[#070e17] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-blue-400 border border-white/10">
          <span>Inflight Prototype Control · Active</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Prototype Control Toolkit</h1>
        <p className="text-sm text-slate-400">
          The floating Inflight control panel is mounted and open at the bottom right. Press{" "}
          <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-xs text-white">⌘K</kbd> to toggle it at any time across all routes.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/float-card-v2")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            Go to Float Card v2 (VGPU Holographic) →
          </button>
          <button
            type="button"
            onClick={() => router.push("/float-card")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
          >
            Go to Float Card v1 →
          </button>
          <button
            type="button"
            onClick={() => router.push("/liquid-glass")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            Go to Liquid Glass Prototype →
          </button>
        </div>
      </div>
    </div>
  );
}
