"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface DesignOption {
  id: string;
  label: string;
  description?: string;
}

export interface PrototypeNote {
  id: string;
  text: string;
  approachId: string;
  createdAt: string;
  resolved?: boolean;
}

export interface CustomControlToggle {
  id: string;
  label: string;
  value: boolean;
}

interface PrototypeControlContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleOpen: () => void;
  options: DesignOption[];
  setOptions: React.Dispatch<React.SetStateAction<DesignOption[]>>;
  activeApproach: string;
  setActiveApproach: (id: string) => void;
  notes: PrototypeNote[];
  addNote: (text: string) => void;
  toggleNoteResolved: (id: string) => void;
  deleteNote: (id: string) => void;
  toggles: Record<string, boolean>;
  setToggle: (id: string, value: boolean) => void;
  shadeProgress: number;
  setShadeProgress: (value: number) => void;
  cloudSpeed: "calm" | "cruising" | "fast";
  setCloudSpeed: (speed: "calm" | "cruising" | "fast") => void;
}

const DEFAULT_OPTIONS: DesignOption[] = [
  {
    id: "calendly-flex-bubble",
    label: "Calendly Flex Bubbles · Liquid Tabs",
    description: "Modular squircle capsules connected with concave Bézier bridges & Hairline UI liquid surface tension",
  },
  {
    id: "approach-a",
    label: "Yellow Rubber Duck / Cabin Warm",
    description: "Glossy yellow rubber duck on the Overview pond (#F5F1EC) + warm alabaster cabin on Work tabs",
  },
  {
    id: "approach-b",
    label: "Classic White Duck / Editorial Ice",
    description: "Original white Pekin & mallard ducks on the Overview pond + cool ice canvas on Work tabs",
  },
];

const DEFAULT_NOTES: PrototypeNote[] = [
  {
    id: "note-1",
    text: "Verify contrast of #B0BECC subtle metadata on #F9FCFF ice canvas.",
    approachId: "approach-a",
    createdAt: "Just now",
    resolved: false,
  },
];

const STORAGE_KEY_NOTES = "filbert-prototype-notes-v1";
const STORAGE_KEY_APPROACH = "filbert-prototype-approach-v1";

const PrototypeControlContext = createContext<PrototypeControlContextValue | null>(null);

export function PrototypeControlProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DesignOption[]>(DEFAULT_OPTIONS);
  const [activeApproach, setActiveApproachState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedApproach = localStorage.getItem(STORAGE_KEY_APPROACH);
        if (savedApproach) return savedApproach;
      } catch {
        // Ignore storage errors
      }
    }
    return "approach-a";
  });
  const [notes, setNotes] = useState<PrototypeNote[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
        if (savedNotes) return JSON.parse(savedNotes);
      } catch {
        // Ignore storage errors
      }
    }
    return DEFAULT_NOTES;
  });
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    showGrid: false,
    outlineTokens: false,
  });
  const [shadeProgress, setShadeProgressState] = useState<number>(0);
  const [cloudSpeed, setCloudSpeed] = useState<"calm" | "cruising" | "fast">("cruising");

  const setShadeProgress = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setShadeProgressState(clamped);
  }, []);

  const setActiveApproach = useCallback((id: string) => {
    setActiveApproachState(id);
    try {
      localStorage.setItem(STORAGE_KEY_APPROACH, id);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut to trigger Prototype Control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addNote = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setNotes((prev) => {
        const next: PrototypeNote[] = [
          {
            id: `note-${Date.now()}`,
            text: trimmed,
            approachId: activeApproach,
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            resolved: false,
          },
          ...prev,
        ];
        try {
          localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    [activeApproach]
  );

  const toggleNoteResolved = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, resolved: !n.resolved } : n));
      try {
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const setToggle = useCallback((id: string, value: boolean) => {
    setToggles((prev) => ({ ...prev, [id]: value }));
  }, []);

  return (
    <PrototypeControlContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        options,
        setOptions,
        activeApproach,
        setActiveApproach,
        notes,
        addNote,
        toggleNoteResolved,
        deleteNote,
        toggles,
        setToggle,
        shadeProgress,
        setShadeProgress,
        cloudSpeed,
        setCloudSpeed,
      }}
    >
      {children}
    </PrototypeControlContext.Provider>
  );
}

export function usePrototypeControl() {
  const ctx = useContext(PrototypeControlContext);
  if (!ctx) {
    throw new Error("usePrototypeControl must be used within a PrototypeControlProvider");
  }
  return ctx;
}
