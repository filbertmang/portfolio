"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Layers, Palette, Eye, Mail } from "lucide-react";
import Link from "next/link";

const projects = [
  {
    title: "Linear Mobile Redesign",
    category: "Product & Interaction Design",
    year: "2024",
    summary: "Rethinking gesture-driven task management and fluid interactions for high-velocity teams.",
    tags: ["Mobile", "Design Systems", "Prototyping"],
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    title: "AI Co-pilot for Workspace",
    category: "AI / UX Systems",
    year: "2024",
    summary: "Context-aware generative canvas interface reducing cognitive load for document synthesis.",
    tags: ["Generative UI", "Product Strategy", "Research"],
    accent: "from-purple-500/20 to-pink-500/10",
  },
  {
    title: "Prism Design System 2.0",
    category: "Design System Architecture",
    year: "2023",
    summary: "Comprehensive multi-brand tokenized component ecosystem scaled across 40+ engineering squads.",
    tags: ["Tokens", "Figma", "Accessibility"],
    accent: "from-emerald-500/20 to-teal-500/10",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0c0c0e]/75 border-b border-zinc-800/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Product Designer</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="#work" className="hover:text-zinc-100 transition-colors">Work</a>
            <a href="#about" className="hover:text-zinc-100 transition-colors">About</a>
            <a href="#contact" className="hover:text-zinc-100 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 space-y-28">
        {/* Hero Section */}
        <section className="space-y-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs font-medium text-zinc-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Available for select design roles & design advisory</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-medium tracking-tight text-zinc-100 max-w-3xl leading-[1.15]"
          >
            Designing high-craft digital products, design systems, and fluid interfaces.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed"
          >
            I bridge product strategy, system design, and frontend fidelity to build software that feels effortless and delightful.
          </motion.p>
        </section>

        {/* Selected Work */}
        <section id="work" className="space-y-8">
          <div className="flex items-end justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Selected Work</h2>
              <p className="text-sm text-zinc-400 mt-1">Recent case studies and flagship design explorations</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">2023 — Present</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {projects.map((project, idx) => (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all p-7 sm:p-8 overflow-hidden cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${project.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>{project.category}</span>
                    <span>{project.year}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-zinc-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                      {project.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Philosophy / Capabilities */}
        <section id="about" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 space-y-3">
            <Layers className="w-5 h-5 text-zinc-300" />
            <h4 className="font-semibold text-zinc-100 text-base">Systems & Architecture</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Crafting scalable design systems with token foundations, Figma libraries, and code-aligned documentation.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 space-y-3">
            <Palette className="w-5 h-5 text-zinc-300" />
            <h4 className="font-semibold text-zinc-100 text-base">Interaction & Motion</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Designing micro-interactions, spring dynamics, and tactile feedback to give software personality.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 space-y-3">
            <Eye className="w-5 h-5 text-zinc-300" />
            <h4 className="font-semibold text-zinc-100 text-base">Product Strategy</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Partnering deeply with product and engineering to transform ambiguity into intuitive user journeys.
            </p>
          </div>
        </section>

        {/* Footer / Contact */}
        <footer id="contact" className="border-t border-zinc-800/80 pt-10 pb-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-3">
            <span>Get in touch:</span>
            <a href="mailto:hello@example.com" className="text-zinc-200 hover:underline flex items-center gap-1.5 font-medium">
              <Mail className="w-4 h-4" />
              <span>hello@example.com</span>
            </a>
          </div>

          <div className="flex items-center gap-5">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-200 transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-zinc-200 transition-colors">
              LinkedIn
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
