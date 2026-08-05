/** Central brand identity — every brand string lives here. */
export const brand = {
  name: "INFINITY",
  legalName: "Infinity Horlogerie",
  tagline: "Crafted Beyond Time",
  signature: "Infinity", // signature-style mark rendered with the script font
  description:
    "INFINITY is an independent horology house forging timepieces in small series — cinematic engineering, restraint, and decades of promise in every movement.",
  since: "MMXXIV",
  url: "https://infinity-horlogerie.example",
  social: {
    instagram: "@infinity.horlogerie",
  },
} as const;

/** Design tokens exposed to CSS variable names. */
export const tokens = {
  ink: "#0B0B0C",
  ivory: "#F6F2E9",
  stone: "#E7E1D4",
  midnight: "#101A2B",
  gold: "#B08D57",
  goldLight: "#D4B886",
  smoke: "#8A857C",
} as const;