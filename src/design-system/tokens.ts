/**
 * Portfolio Design System — Color & Font Tokens
 * Extracted from https://www.filbert.design/
 *
 * Structure:
 * - Portfolio > Color:
 *   1. Global: Surface > Content > Stroke
 *   2. Project: Float > 7shifts > Sonnet > Teck > WillowTree > Visier > Gojek
 *   3. Scales: Raw color ramps (Slate, Amber, Forest, Cyan, Berry, Royal)
 * - Portfolio > Font:
 *   1. Typefaces & Weights (Plus Jakarta Sans, Inter)
 *   2. Typography Scale (Display, Headings, Body, Navigation, Labels & Badges)
 */

// ============================================================================
// COLOR SCALES
// ============================================================================

export const colorScales = {
  // Brand Ice / Slate Scale (Filbert's signature cool canvas & text)
  slate: {
    50: "#f9fcff",  // Canvas background (pure cool ice)
    100: "#f2f7fa", // Subtle surface / card hover
    200: "#e6ecf0", // Subtle border / active surface
    300: "#d3dce3", // Divider / mute hairline
    400: "#b0becc", // Signature steel blue (metadata, badges, secondary headers)
    500: "#8294a6", // Medium slate
    600: "#525862", // Neutral secondary text
    700: "#484c52", // Deep charcoal body text
    800: "#1b1d1f", // Near-black slate
    900: "#0d1926", // Signature primary midnight navy
    950: "#070e17", // Abyss navy
  },

  // Pure Neutrals
  neutral: {
    white: "#ffffff",
    black: "#000000",
    translucent: {
      light10: "rgba(249, 252, 255, 0.1)",
      light60: "rgba(250, 252, 255, 0.6)",
      dark10: "rgba(13, 25, 38, 0.1)",
      dark20: "rgba(13, 25, 38, 0.2)",
      dark60: "rgba(13, 25, 38, 0.6)",
      slate20: "rgba(176, 190, 204, 0.2)",
      slate40: "rgba(176, 190, 204, 0.4)",
    },
  },

  // Amber / Terracotta Scale (7shifts)
  amber: {
    50: "#fdf1ea",  // Apricot badge surface
    100: "#f8e9e0", // Soft warm tint
    200: "#fadcca", // Card hover gradient start
    300: "#e5c8b6", // Soft warm border
    400: "#c37342", // Terracotta card outline
    500: "#ff6808", // Vibrant flame orange accent
    700: "#994e1f", // Deep terracotta text & border
    900: "#5a2a0c", // Dark shade
  },

  // Royal / Indigo Scale (Teck)
  royal: {
    50: "#fdfeff",  // Tint
    100: "#edeafd", // Badge surface (Periwinkle)
    200: "#e6e8fa", // Soft indigo surface
    300: "#beb6e5", // Tag outline
    400: "#5842c3", // Card hover outline & highlight
    500: "#0e107c", // Deep royal navy accent
    700: "#331f99", // Deep indigo contrast text
    800: "#223547", // Midnight text
    900: "#222347", // Dark shade
  },

  // Berry / Magenta Scale (WillowTree)
  berry: {
    50: "#fffbfe",  // Tint
    100: "#fdeafa", // Badge surface
    200: "#f7e9f4", // Soft berry surface
    300: "#e5b6de", // Tag outline
    400: "#c342ad", // Card hover outline
    500: "#df0173", // Vibrant magenta accent
    700: "#991f6e", // Deep berry contrast text
    800: "#65305a", // Muted berry text
    900: "#472240", // Dark shade
  },

  // Cyan / Teal Scale (Visier)
  cyan: {
    50: "#fbffff",  // Tint
    100: "#f0feff", // Badge surface
    200: "#e9f7f7", // Soft cyan surface
    300: "#b6e4e5", // Tag outline
    500: "#2dccd3", // Vibrant cyan accent & hover border
    700: "#0a7c80", // Deep teal text
    800: "#306365", // Muted teal text
    900: "#224647", // Dark shade
  },

  // Forest / Emerald Scale (Gojek)
  forest: {
    50: "#fbfffb",  // Tint
    100: "#eafdef", // Badge surface
    200: "#e9f7ed", // Soft green surface
    300: "#b6e5c3", // Tag outline
    400: "#42c364", // Card hover outline
    500: "#00880f", // Vibrant emerald accent & text
    700: "#306539", // Deep forest contrast text
    900: "#224728", // Dark shade
  },
} as const;

// Backwards-compatible alias
export const primitives = colorScales;

// ============================================================================
// GLOBAL & PROJECT COLOR TOKENS
// ============================================================================

export interface ProjectColorToken {
  id: string;
  project: "Float" | "7shifts" | "Sonnet" | "Teck" | "WillowTree" | "Visier" | "Gojek";
  tokenName: string;
  role: string;
  tags: string[];
  badgeLabel: string;
  bg: string;
  text: string;
  border: string;
  accent: string;
}

export const projectColors: ProjectColorToken[] = [
  {
    id: "float",
    project: "Float",
    tokenName: "project.float",
    role: "Current Role · Canadian Spend Management",
    tags: ["Currently at Float", "Fintech", "Spend Management"],
    badgeLabel: "Currently at Float",
    bg: "#f2f7fa",
    text: "#0d1926",
    border: "#b0becc",
    accent: "#0d1926",
  },
  {
    id: "7shifts",
    project: "7shifts",
    tokenName: "project.7shifts",
    role: "Product Designer, Integrations · Restaurant Platform",
    tags: ["Integration", "Team Management", "Webhooks"],
    badgeLabel: "Integration",
    bg: "#fdf1ea",
    text: "#994e1f",
    border: "#c37342",
    accent: "#ff6808",
  },
  {
    id: "sonnet",
    project: "Sonnet",
    tokenName: "project.sonnet",
    role: "Product Designer · Online Insurance & Design Systems",
    tags: ["❖ Design Systems", "Finance", "CMS"],
    badgeLabel: "❖ Design Systems",
    bg: "#e6ecf0",
    text: "#0d1926",
    border: "#5e6e6e",
    accent: "#2f3737",
  },
  {
    id: "teck",
    project: "Teck",
    tokenName: "project.teck",
    role: "Product Designer, Design Systems · Mining & Sustainability",
    tags: ["❖ Design Systems", "Mining", "Accessibility"],
    badgeLabel: "❖ Design Systems",
    bg: "#edeafd",
    text: "#331f99",
    border: "#5842c3",
    accent: "#0e107c",
  },
  {
    id: "willowtree",
    project: "WillowTree",
    tokenName: "project.willowtree",
    role: "Product Designer · Digital Product Agency",
    tags: ["✦ AI", "Digital Agency", "Internal Tool"],
    badgeLabel: "✦ AI",
    bg: "#fdeafa",
    text: "#991f6e",
    border: "#c342ad",
    accent: "#df0173",
  },
  {
    id: "visier",
    project: "Visier",
    tokenName: "project.visier",
    role: "UX Designer · Workforce Analytics Platform",
    tags: ["✦ AI", "Dashboard", "Data & Analytics"],
    badgeLabel: "Data & Analytics",
    bg: "#f0feff",
    text: "#0a7c80",
    border: "#2dccd3",
    accent: "#2dccd3",
  },
  {
    id: "gojek",
    project: "Gojek",
    tokenName: "project.gojek",
    role: "Product Designer · Consumer Super-App",
    tags: ["Ride Sharing", "B2C", "Interactions"],
    badgeLabel: "Ride Sharing",
    bg: "#eafdef",
    text: "#00880f",
    border: "#42c364",
    accent: "#00880f",
  },
];

export const semanticTokens = {
  light: {
    // Global > Surface
    surface: {
      canvas: colorScales.slate[50],          // #f9fcff (Page canvas)
      elevated: colorScales.neutral.white,    // #ffffff (Cards, dialogs)
      muted: colorScales.slate[100],          // #f2f7fa (Secondary surface)
      active: colorScales.slate[200],         // #e6ecf0 (Active / Pressed surface)
      overlay: colorScales.neutral.translucent.dark60,
    },

    // Global > Content
    content: {
      primary: colorScales.slate[900],        // #0d1926 (Headlines, titles, hero)
      secondary: colorScales.slate[700],      // #484c52 (Body text, descriptions)
      tertiary: colorScales.slate[600],       // #525862 (Secondary links, timestamps)
      subtle: colorScales.slate[400],         // #b0becc (Metadata, tags, captions)
      inverse: colorScales.neutral.white,    // #ffffff (On dark buttons/surfaces)
    },

    // Global > Stroke
    stroke: {
      subtle: colorScales.neutral.translucent.slate20, // Ultra-light divider
      default: colorScales.slate[400],                 // #b0becc (Standard card/section border)
      strong: colorScales.slate[900],                  // #0d1926 (High contrast outline)
      active: colorScales.slate[600],                  // #525862
    },

    // Interactive States
    interactive: {
      default: colorScales.slate[900],
      hover: colorScales.royal[500],
      active: colorScales.slate[950],
      focusRing: colorScales.slate[400],
    },

    // Project Badges
    badge: {
      forest: {
        bg: colorScales.forest[100],
        text: colorScales.forest[500],
        border: colorScales.forest[400],
      },
      cyan: {
        bg: colorScales.cyan[100],
        text: colorScales.cyan[700],
        border: colorScales.cyan[500],
      },
      berry: {
        bg: colorScales.berry[100],
        text: colorScales.berry[700],
        border: colorScales.berry[400],
      },
      royal: {
        bg: colorScales.royal[100],
        text: colorScales.royal[700],
        border: colorScales.royal[400],
      },
      amber: {
        bg: colorScales.amber[50],
        text: colorScales.amber[700],
        border: colorScales.amber[400],
      },
      neutral: {
        bg: colorScales.slate[100],
        text: colorScales.slate[900],
        border: colorScales.slate[400],
      },
    },
  },

  dark: {
    // Global > Surface
    surface: {
      canvas: colorScales.slate[950],          // #070e17 (Deep midnight abyss)
      elevated: colorScales.slate[900],        // #0d1926 (Elevated cards)
      muted: colorScales.slate[800],           // #1b1d1f (Muted containers)
      active: colorScales.slate[700],          // #484c52 (Active / pressed surface)
      overlay: "rgba(0, 0, 0, 0.75)",
    },

    // Global > Content
    content: {
      primary: colorScales.slate[50],          // #f9fcff (High contrast crisp white)
      secondary: colorScales.slate[200],       // #e6ecf0 (Readable body text)
      tertiary: colorScales.slate[400],        // #b0becc (Secondary labels)
      subtle: colorScales.slate[500],          // #8294a6 (Muted metadata)
      inverse: colorScales.slate[950],         // #070e17
    },

    // Global > Stroke
    stroke: {
      subtle: "rgba(176, 190, 204, 0.15)",
      default: "rgba(176, 190, 204, 0.3)",
      strong: colorScales.slate[400],
      active: colorScales.slate[200],
    },

    // Interactive States
    interactive: {
      default: colorScales.slate[50],
      hover: colorScales.cyan[500],
      active: colorScales.neutral.white,
      focusRing: colorScales.slate[400],
    },

    // Project Badges (Dark Mode calibrated contrast)
    badge: {
      forest: {
        bg: "rgba(0, 136, 15, 0.18)",
        text: "#74e283",
        border: "rgba(0, 136, 15, 0.4)",
      },
      cyan: {
        bg: "rgba(45, 204, 211, 0.18)",
        text: "#62e4ea",
        border: "rgba(45, 204, 211, 0.4)",
      },
      berry: {
        bg: "rgba(223, 1, 115, 0.18)",
        text: "#f972b2",
        border: "rgba(223, 1, 115, 0.4)",
      },
      royal: {
        bg: "rgba(14, 16, 124, 0.3)",
        text: "#a4abff",
        border: "rgba(14, 16, 124, 0.5)",
      },
      amber: {
        bg: "rgba(255, 104, 8, 0.18)",
        text: "#ffaa70",
        border: "rgba(255, 104, 8, 0.4)",
      },
      neutral: {
        bg: colorScales.slate[800],
        text: colorScales.slate[200],
        border: colorScales.slate[700],
      },
    },
  },
} as const;

// ============================================================================
// PORTFOLIO > FONT (Extracted from https://www.filbert.design/)
// ============================================================================

export interface FontTypefaceToken {
  id: string;
  name: string;
  token: string;
  cssFamily: string;
  weights: { weight: number; label: string }[];
  usage: string;
}

export interface FontStyleToken {
  id: string;
  category: "Display & Headings" | "Body & Navigation" | "Labels & Badges";
  name: string;
  token: string;
  fontFamily: "Plus Jakarta Sans" | "Inter";
  size: string;
  responsive?: string;
  weight: 400 | 500 | 600 | 700;
  weightLabel: "Regular" | "Medium" | "SemiBold" | "Bold";
  lineHeight: string;
  letterSpacing: string;
  textTransform?: "none" | "uppercase";
  usage: string;
  sample: string;
}

export const portfolioTypefaces: FontTypefaceToken[] = [
  {
    id: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    token: "font.family.display",
    cssFamily: '"Plus Jakarta Sans", sans-serif',
    weights: [
      { weight: 500, label: "Medium" },
      { weight: 600, label: "SemiBold" },
      { weight: 700, label: "Bold" },
    ],
    usage: "Primary typeface across all headings, project cards, navigation, body copy, and badges",
  },
  {
    id: "inter",
    name: "Inter",
    token: "font.family.sans",
    cssFamily: '"Inter", sans-serif',
    weights: [
      { weight: 400, label: "Regular" },
      { weight: 500, label: "Medium" },
    ],
    usage: "System fallback & rich-text base container typeface",
  },
];

export const portfolioFontStyles: FontStyleToken[] = [
  // Display & Headings
  {
    id: "display-hero",
    category: "Display & Headings",
    name: "Display Hero (H1)",
    token: "font.display.hero",
    fontFamily: "Plus Jakarta Sans",
    size: "48px",
    responsive: "48px Desktop · 40px Tablet · 36px Mobile",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "56px",
    letterSpacing: "-2px",
    usage: "Hero bio statement & brand wordmark",
    sample: "Senior product designer with four years of experience",
  },
  {
    id: "heading-xl",
    category: "Display & Headings",
    name: "Heading XL (H2)",
    token: "font.heading.xl",
    fontFamily: "Plus Jakarta Sans",
    size: "36px",
    responsive: "36px Desktop · 28px Tablet · 24px Mobile",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "44px",
    letterSpacing: "-2px",
    usage: "Background statements, role titles & section headlines",
    sample: "3 years of experience designing for B2C & B2B SaaS.",
  },
  {
    id: "heading-lg",
    category: "Display & Headings",
    name: "Heading LG / Prompt (H3)",
    token: "font.heading.lg",
    fontFamily: "Plus Jakarta Sans",
    size: "24px",
    responsive: "24px Desktop · 20px Tablet · 16px Mobile",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "32px",
    letterSpacing: "-0.5px",
    usage: "Case study 'How might we' problem statements & philosophy subheads",
    sample: "How might we create a scalable and accessible design system?",
  },
  {
    id: "title-project",
    category: "Display & Headings",
    name: "Project Card Title",
    token: "font.title.project",
    fontFamily: "Plus Jakarta Sans",
    size: "24px",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "32px",
    letterSpacing: "0px",
    usage: "Company & project card titles (7shifts, Sonnet, Teck, WillowTree, Visier, Gojek)",
    sample: "7shifts · Sonnet · Teck · WillowTree",
  },
  {
    id: "heading-sm",
    category: "Display & Headings",
    name: "Heading SM (H4)",
    token: "font.heading.sm",
    fontFamily: "Plus Jakarta Sans",
    size: "16px",
    weight: 700,
    weightLabel: "Bold",
    lineHeight: "24px",
    letterSpacing: "0px",
    usage: "Case study feature headings, read time & bold callouts",
    sample: "ADP Workforce Now Integration · 8 minute read",
  },

  // Body & Navigation
  {
    id: "body-default",
    category: "Body & Navigation",
    name: "Body Default",
    token: "font.body.md",
    fontFamily: "Plus Jakarta Sans",
    size: "16px",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "24px",
    letterSpacing: "0px",
    usage: "Primary long-form body copy, metadata rows ('Currently at Float', 'Based in Toronto')",
    sample: "Currently at Float · Based in Toronto",
  },
  {
    id: "body-compact",
    category: "Body & Navigation",
    name: "Body Compact (Card Summary)",
    token: "font.body.compact",
    fontFamily: "Plus Jakarta Sans",
    size: "16px",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "20px",
    letterSpacing: "0px",
    usage: "Project card descriptions & concise summaries",
    sample: "Full-stack restaurant management platform with over 1.5M+ users.",
  },
  {
    id: "nav-active",
    category: "Body & Navigation",
    name: "Navigation Active",
    token: "font.nav.active",
    fontFamily: "Plus Jakarta Sans",
    size: "16px",
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "1.2em",
    letterSpacing: "0px",
    usage: "Active sidebar & top navigation links (Home, Overview, Contact)",
    sample: "Home · Overview · Contact",
  },
  {
    id: "nav-default",
    category: "Body & Navigation",
    name: "Navigation Default",
    token: "font.nav.default",
    fontFamily: "Plus Jakarta Sans",
    size: "16px",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "1.2em",
    letterSpacing: "0px",
    usage: "Inactive navigation items (Work, Playground, Background, Adventures)",
    sample: "Work · Playground · Background · Adventures",
  },
  {
    id: "body-sm",
    category: "Body & Navigation",
    name: "Body SM / Utility Link",
    token: "font.body.sm",
    fontFamily: "Plus Jakarta Sans",
    size: "14px",
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "24px",
    letterSpacing: "-0.5px",
    usage: "Back navigation button & contact drawer links",
    sample: "filbertmangundap@gmail.com · /filbertmang",
  },

  // Labels & Badges
  {
    id: "label-overline",
    category: "Labels & Badges",
    name: "Section Overline",
    token: "font.label.overline",
    fontFamily: "Plus Jakarta Sans",
    size: "12px",
    weight: 700,
    weightLabel: "Bold",
    lineHeight: "16px",
    letterSpacing: "0px",
    textTransform: "uppercase",
    usage: "Uppercase section dividers (SELECTED DESIGN WORKS, WORK EXPERIENCE)",
    sample: "SELECTED DESIGN WORKS",
  },
  {
    id: "label-badge",
    category: "Labels & Badges",
    name: "Project Badge / Tag",
    token: "font.label.badge",
    fontFamily: "Plus Jakarta Sans",
    size: "12px",
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "16px",
    letterSpacing: "0px",
    usage: "Project category tags & skill pills (❖ Design Systems, Integration, ✦ AI)",
    sample: "❖ Design Systems · Integration · ✦ AI",
  },
  {
    id: "label-micro",
    category: "Labels & Badges",
    name: "Micro Caption",
    token: "font.label.micro",
    fontFamily: "Plus Jakarta Sans",
    size: "8px",
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "16px",
    letterSpacing: "0px",
    textTransform: "uppercase",
    usage: "Interactive micro-prompts on polaroid cards",
    sample: "DRAG THE CARD",
  },
];

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const componentTokens = {
  navbar: {
    chrome: "var(--ds-surface-canvas)",
    panel: "var(--ds-surface-elevated)",
    border: "var(--ds-stroke-default)",
    text: "var(--ds-content-primary)",
    textMuted: "var(--ds-content-subtle)",
    activePill: "var(--ds-surface-muted)",
  },
  card: {
    bg: "var(--ds-surface-elevated)",
    bgHover: "var(--ds-surface-muted)",
    border: "var(--ds-stroke-default)",
    borderHover: "var(--ds-stroke-strong)",
    title: "var(--ds-content-primary)",
    description: "var(--ds-content-secondary)",
    metadata: "var(--ds-content-subtle)",
  },
  button: {
    primaryBg: "var(--ds-content-primary)",
    primaryText: "var(--ds-surface-elevated)",
    secondaryBg: "var(--ds-surface-muted)",
    secondaryText: "var(--ds-content-primary)",
    secondaryBorder: "var(--ds-stroke-subtle)",
  },
} as const;
