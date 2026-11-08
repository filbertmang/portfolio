"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Laptop,
  Sparkles,
  ExternalLink,
  Briefcase,
  User,
  FlaskConical,
  ArrowUpRight,
} from "lucide-react";
import { usePrototypeControl } from "@/components/prototype-control";
import { FilbertLogo } from "@/components/CompanyLogos";
import { isHomeExperiencePath } from "@/components/HomeExperienceTabs";

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Experiment", href: "/experiment" },
  { label: "About", href: "/about" },
  { label: "Studio", href: "https://filbert.studio/", external: true },
];

const SEARCH_ITEMS = [
  { group: "Navigation", name: "Home", href: "/", icon: Sparkles, external: false },
  { group: "Navigation", name: "Experiment", href: "/experiment", icon: FlaskConical, external: false },
  { group: "Navigation", name: "About (Flight Plan & Resume)", href: "/about", icon: User, external: false },
  { group: "Navigation", name: "Studio (filbert.studio)", href: "https://filbert.studio/", icon: ExternalLink, external: true },
  { group: "Work Experience", name: "Float — Senior Product Designer", href: "/work/float", icon: Briefcase, external: false },
  { group: "Work Experience", name: "7shifts — Product Designer, Integrations", href: "/work/7shifts", icon: Briefcase, external: false },
  { group: "Work Experience", name: "Sonnet — Product Designer", href: "/work/sonnet", icon: Briefcase, external: false },
  { group: "Work Experience", name: "Teck — Product Designer, Design Systems", href: "/work/teck", icon: Briefcase, external: false },
  { group: "Work Experience", name: "TELUS Digital — Product Designer, Intern", href: "/work/telus-digital", icon: Briefcase, external: false },
  { group: "Work Experience", name: "Visier — UX Designer, Co-Op", href: "/work/visier", icon: Briefcase, external: false },
  { group: "Work Experience", name: "Gojek — Product Designer, Intern", href: "/work/gojek", icon: Briefcase, external: false },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setShadeProgress } = usePrototypeControl();
  const [isDark, setIsDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default state is light mode (open airplane window), and sync with document.documentElement
  useEffect(() => {
    document.documentElement.classList.remove("dark");

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcut for Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    setShadeProgress(next ? 1 : 0);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const setTheme = (theme: "light" | "dark" | "system") => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      setShadeProgress(prefersDark ? 1 : 0);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.removeItem("theme");
    } else if (theme === "dark") {
      setIsDark(true);
      setShadeProgress(1);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setIsDark(false);
      setShadeProgress(0);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setSearchOpen(false);
  };

  const isNavItemActive = (item: NavItem) => {
    if (item.external) return false;
    if (item.href === "/") {
      return isHomeExperiencePath(pathname);
    }
    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  };

  const filteredSearchItems = SEARCH_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="site-header">
        {/* Background cut-out panel */}
        <div className="site-header-panel" aria-hidden="true" />

        {/* Left curved transition SVG join */}
        <svg
          className="site-header-left-join"
          viewBox="-16 0 258 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-16 8H224Q240 8 240 0H242V8H-16Z"
            fill="var(--background)"
          />
          <path
            d="M-16 8H224Q240 8 240 0"
            stroke="var(--border)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Right curved transition SVG */}
        <svg
          className="site-header-curve"
          viewBox="0 0 400 44"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M410 0H1.5"
            stroke="var(--site-chrome)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M0 0q10 0 20 10l24 24q10 10 20 10H410V0Z"
            fill="var(--site-chrome)"
          />
          <path
            d="M0 0q10 0 20 10l24 24q10 10 20 10H410"
            stroke="var(--border)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Brand */}
        <Link
          href="/"
          aria-label="Filbert Mangundap home"
          className="site-brand"
        >
          <FilbertLogo className="w-6 h-6 shrink-0 translate-y-[2px]" />
          <span>Filbert</span>
        </Link>

        {/* Center navigation */}
        <div className="site-header-navigation">
          <nav aria-label="Main navigation">
            {NAV_ITEMS.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isNavItemActive(item) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Search Trigger */}
          <div className="site-header-search">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-foreground/5 cursor-pointer"
              aria-label="Open command menu"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="lucide lucide-search w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-foreground/10 rounded">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </button>
          </div>
        </div>

        {/* Right side actions */}
        <div className="site-header-actions">
          <a
            href="https://linkedin.com/in/filbertmang"
            target="_blank"
            rel="noopener noreferrer"
            className="site-templates"
          >
            LinkedIn
          </a>
          <a
            href="mailto:filbertmangundap@gmail.com"
            className="site-templates"
          >
            Contact
          </a>

          <span className="site-header-divider" aria-hidden="true" />

          {/* Theme Toggle */}
          <button
            type="button"
            className="site-theme-toggle"
            aria-label="Toggle color theme"
            onClick={toggleTheme}
          >
            <Moon className="site-theme-moon" aria-hidden="true" />
            <Sun className="site-theme-sun" aria-hidden="true" />
          </button>

          <span className="site-header-divider" aria-hidden="true" />

          {/* Status / Location link */}
          <Link
            href="/work/float"
            className="site-builder"
          >
            Currently at Float
          </Link>

          {/* Mobile hamburger menu trigger */}
          <button
            type="button"
            className="site-menu-trigger inline-flex items-center justify-center size-9 rounded-full hover:bg-accent text-foreground transition-colors cursor-pointer"
            aria-label="Open site navigation"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Command Palette Modal (Search) */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 border-b border-[var(--border)] gap-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search pages or work experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-4">
              <div>
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Suggestions
                </p>
                <div className="mt-1 space-y-0.5">
                  {filteredSearchItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setSearchOpen(false);
                          if (item.external) {
                            window.open(item.href, "_blank", "noopener,noreferrer");
                          } else {
                            router.push(item.href);
                          }
                        }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-lg text-left text-foreground hover:bg-[var(--accent)] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                          {item.group}
                        </span>
                      </button>
                    );
                  })}
                  {filteredSearchItems.length === 0 && (
                    <p className="px-3 py-6 text-sm text-center text-muted-foreground">
                      No results found for &quot;{searchQuery}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Theme
                </p>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => setTheme("light")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left text-foreground hover:bg-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <Sun className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>Light Theme</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left text-foreground hover:bg-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <Moon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>Dark Theme</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left text-foreground hover:bg-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <Laptop className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>System Preference</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-[var(--background)] text-[var(--foreground)] border-l border-[var(--border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <FilbertLogo className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-semibold text-base">Filbert Mangundap</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Senior Product Designer · Toronto
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="size-8 inline-flex items-center justify-center rounded-full hover:bg-[var(--accent)] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="site-menu-links flex-1 py-4">
              {NAV_ITEMS.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium inline-flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-60" />
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isNavItemActive(link) ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            <div className="site-menu-footer">
              <a
                href="https://linkedin.com/in/filbertmang"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-foreground hover:text-foreground/80"
              >
                <span>/filbertmang</span>
              </a>

              <a
                href="mailto:filbertmangundap@gmail.com"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                filbertmangundap@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
