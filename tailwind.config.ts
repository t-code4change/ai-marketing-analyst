import type { Config } from "tailwindcss";

/**
 * AI Marketing Analyst — Neo-Brutalism Design System
 * Tailwind CSS v3 configuration
 *
 * Design philosophy:
 *   - Thick black borders (2-4px) on every interactive element
 *   - Hard offset box-shadows with zero blur (the Neo-Brutalism signature)
 *   - Bold saturated accent colors on a white/off-white base
 *   - Zero border radius — sharp corners everywhere
 *   - Heavy typography weights (700–800) dominate
 *   - Hover: translate(-2px, -2px) + shadow grows
 *   - Active: translate(2px, 2px) + shadow collapses to none
 *
 * Google Fonts required (add to layout.tsx or globals.css):
 *   https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800
 *     &family=Space+Grotesk:wght@300;400;500;600;700
 *     &family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500
 *     &display=swap
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    // ─── Reset Tailwind defaults that conflict with Neo-Brutalism ───────────
    borderRadius: {
      // Neo-Brutalism uses ZERO radius. All values here are intentionally minimal.
      none: "0px",
      xs: "2px", // Maximum allowed — only for checkboxes/tiny chips
      DEFAULT: "0px",
    },

    // ─── Extend with custom Neo-Brutalism tokens ─────────────────────────────
    extend: {
      // ── Colors ──────────────────────────────────────────────────────────────
      colors: {
        // CSS variable bridge (globals.css defines these)
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Pure black/white
        black: "#000000",
        white: "#FFFFFF",

        // Accent palette — the 6 Neo-Brutalism signature colors
        // Usage: bg-yellow, bg-coral, bg-green, bg-blue, bg-orange, bg-purple
        yellow: {
          DEFAULT: "#FFE500",
          dark: "#D4BE00",
        },
        coral: {
          DEFAULT: "#FF6B6B",
          dark: "#E04545",
        },
        green: {
          DEFAULT: "#4DFFB4",
          dark: "#00D98B",
        },
        blue: {
          DEFAULT: "#4D79FF",
          dark: "#2255DD",
        },
        orange: {
          DEFAULT: "#FF8C00",
          dark: "#CC6F00",
        },
        purple: {
          DEFAULT: "#9B5DE5",
          dark: "#7534C4",
        },

        // Surface / background tokens
        surface: {
          page: "#FAFAFA",    // App-level background
          canvas: "#FFFFFF",  // Card, panel, modal background
          subtle: "#F5F5F5",  // Table rows, code blocks
          muted: "#EBEBEB",   // Disabled states, dividers
        },

        // Sidebar tokens
        sidebar: {
          bg: "#0A0A0A",
          hover: "#1A1A1A",
          active: "#FFE500", // Electric yellow active state
          border: "#2A2A2A",
          label: "#4A4A4A",
          text: "#A3A3A3",
        },

        // Text tokens
        text: {
          primary: "#0A0A0A",
          secondary: "#3D3D3D",
          muted: "#737373",
          inverse: "#FFFFFF",
          "on-accent": "#000000", // Black text on any accent background
          link: "#4D79FF",
        },

        // Semantic colors — mapped from accent palette
        success: {
          DEFAULT: "#4DFFB4",
          text: "#006644",
        },
        warning: {
          DEFAULT: "#FF8C00",
          text: "#7A3E00",
        },
        error: {
          DEFAULT: "#FF6B6B",
          text: "#7A0000",
        },
        info: {
          DEFAULT: "#4D79FF",
          text: "#00217A",
        },

        // Chart color sequence (use chart-1 through chart-6 in order)
        chart: {
          "1": "#FFE500",
          "2": "#4D79FF",
          "3": "#FF6B6B",
          "4": "#4DFFB4",
          "5": "#FF8C00",
          "6": "#9B5DE5",
        },
      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        // font-display → Syne — uses Next.js CSS variable
        display: ["var(--font-syne)", "sans-serif"],
        // font-body → Space Grotesk — uses Next.js CSS variable
        body: ["var(--font-space-grotesk)", "sans-serif"],
        // font-mono → DM Mono — uses Next.js CSS variable
        mono: ["var(--font-dm-mono)", "monospace"],
        // Default sans — Space Grotesk via CSS variable
        sans: ["var(--font-space-grotesk)", "sans-serif"],
      },

      fontSize: {
        // Two-value array: [font-size, { lineHeight, letterSpacing }]
        "2xs": ["0.625rem", { lineHeight: "1.0", letterSpacing: "0" }],     // 10px
        xs:   ["0.75rem",  { lineHeight: "1.3", letterSpacing: "0" }],      // 12px
        sm:   ["0.875rem", { lineHeight: "1.5", letterSpacing: "0" }],      // 14px
        base: ["1rem",     { lineHeight: "1.5", letterSpacing: "0" }],      // 16px
        lg:   ["1.125rem", { lineHeight: "1.5", letterSpacing: "0" }],      // 18px
        xl:   ["1.25rem",  { lineHeight: "1.3", letterSpacing: "-0.01em" }], // 20px
        "2xl": ["1.5rem",  { lineHeight: "1.3", letterSpacing: "-0.01em" }], // 24px
        "3xl": ["1.875rem",{ lineHeight: "1.2", letterSpacing: "-0.02em" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "1.15",letterSpacing: "-0.025em"}], // 36px
        "5xl": ["3rem",    { lineHeight: "1.1", letterSpacing: "-0.03em" }], // 48px
        "6xl": ["3.75rem", { lineHeight: "1.05",letterSpacing: "-0.04em" }], // 60px
        "7xl": ["4.5rem",  { lineHeight: "1.0", letterSpacing: "-0.05em" }], // 72px
      },

      fontWeight: {
        light:     "300",
        regular:   "400",
        medium:    "500",
        semibold:  "600",
        bold:      "700",
        extrabold: "800",
        // Note: 900 (black) is not available in Space Grotesk; use 800 (extrabold)
      },

      lineHeight: {
        none:    "1",
        tight:   "1.15",
        snug:    "1.3",
        normal:  "1.5",
        relaxed: "1.625",
        loose:   "2",
      },

      letterSpacing: {
        tighter: "-0.05em",
        tight:   "-0.025em",
        normal:  "0em",
        wide:    "0.05em",
        wider:   "0.1em",
        widest:  "0.2em",
      },

      // ── Borders ─────────────────────────────────────────────────────────────
      borderWidth: {
        DEFAULT: "2px",
        hairline: "1px",
        thin:     "1.5px",
        "2":      "2px",
        "3":      "3px",
        "4":      "4px",
        "6":      "6px",
      },

      // ── Shadows ─────────────────────────────────────────────────────────────
      // Neo-Brutalism hard offset shadows: X Y BLUR SPREAD COLOR
      // Blur is always 0. No soft shadows allowed.
      boxShadow: {
        none:    "none",
        xs:      "2px 2px 0px 0px #000000",
        sm:      "3px 3px 0px 0px #000000",
        DEFAULT: "4px 4px 0px 0px #000000",
        md:      "4px 4px 0px 0px #000000",
        lg:      "6px 6px 0px 0px #000000",
        xl:      "8px 8px 0px 0px #000000",
        "2xl":   "12px 12px 0px 0px #000000",
        // Hover-state shadows (used after translate(-2px,-2px))
        "hover-xs": "4px 4px 0px 0px #000000",
        "hover-sm": "5px 5px 0px 0px #000000",
        "hover-md": "6px 6px 0px 0px #000000",
        "hover-lg": "8px 8px 0px 0px #000000",
        "hover-xl": "10px 10px 0px 0px #000000",
        // Inset shadow for pressed/active state
        inset:   "inset 3px 3px 0px 0px #000000",
        // Topbar bottom-only shadow
        topbar:  "0px 3px 0px 0px #000000",
        // White shadow variant (for dark backgrounds)
        "white-sm": "3px 3px 0px 0px #FFFFFF",
        "white-md": "4px 4px 0px 0px #FFFFFF",
        "white-lg": "6px 6px 0px 0px #FFFFFF",
      },

      // ── Spacing ─────────────────────────────────────────────────────────────
      // 4px grid — all Tailwind spacing values are already multiples of 4
      // (Tailwind's default spacing scale = 4px base, so no override needed)
      // Adding named semantic aliases:
      spacing: {
        // Standard 4px scale already in Tailwind — keep intact
        // Adding sidebar width as a spacing token
        "sidebar": "256px",
        "sidebar-collapsed": "64px",
        "topbar": "64px",
      },

      // ── Width / Height ───────────────────────────────────────────────────────
      width: {
        sidebar: "256px",
        "sidebar-collapsed": "64px",
      },
      height: {
        topbar: "64px",
      },
      minWidth: {
        sidebar: "256px",
      },

      // ── Animation ───────────────────────────────────────────────────────────
      // Neo-Brutalism interaction: translate + shadow animate together
      transitionProperty: {
        "neo": "transform, box-shadow",
        "neo-border": "transform, box-shadow, border-color",
      },
      transitionDuration: {
        "75":  "75ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
      },
      transitionTimingFunction: {
        "out": "ease-out",
        "in-out": "ease-in-out",
      },

      // ── Z-Index ─────────────────────────────────────────────────────────────
      zIndex: {
        base:    "0",
        above:   "1",
        dropdown: "100",
        sticky:  "200",
        sidebar: "300",
        topbar:  "400",
        overlay: "500",
        modal:   "600",
        toast:   "700",
        tooltip: "800",
      },

      // ── Outline ─────────────────────────────────────────────────────────────
      // Keyboard focus outline — electric blue, distinct from the black border
      outlineWidth: {
        DEFAULT: "2px",
        "2": "2px",
      },
      outlineOffset: {
        DEFAULT: "2px",
        "2": "2px",
      },
      outlineColor: {
        focus: "#4D79FF",
      },
    },
  },

  plugins: [],
};

export default config;
