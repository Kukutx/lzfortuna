import localFont from "next/font/local";

// The original's two families, self-hosted: Inter for text and Cormorant
// Garamond for the wordmark and headings (both SIL Open Font License, variable).
// Each family is split like Google Fonts serves it: the Latin file covers
// Italian and English, the Latin Extended file loads only for pages that use
// those letters. Both declare one family name so CSS sees a single font.
// (Font loader values must be literals, so the ranges are written out.)

export const sans = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--bottega-sans",
  fallback: ["system-ui", "sans-serif"],
  declarations: [
    { prop: "font-family", value: "BottegaSans" },
    { prop: "unicode-range", value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const sansExtended = localFont({
  src: "./fonts/inter-latin-ext.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--bottega-sans-extended",
  declarations: [
    { prop: "font-family", value: "BottegaSans" },
    { prop: "unicode-range", value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

export const serif = localFont({
  src: [
    { path: "./fonts/cormorant-latin.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/cormorant-italic-latin.woff2", weight: "300 700", style: "italic" },
  ],
  display: "swap",
  variable: "--bottega-serif",
  fallback: ["Georgia", "serif"],
  declarations: [
    { prop: "font-family", value: "BottegaSerif" },
    { prop: "unicode-range", value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const serifExtended = localFont({
  src: [
    { path: "./fonts/cormorant-latin-ext.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/cormorant-italic-latin-ext.woff2", weight: "300 700", style: "italic" },
  ],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--bottega-serif-extended",
  declarations: [
    { prop: "font-family", value: "BottegaSerif" },
    { prop: "unicode-range", value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});
