import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#11187e",
          foreground: "#ffffff",
        },
        background: "#ffffff",
        onda: {
          // Paleta principal (manual da marca)
          navy:      "#181e5f",
          blue:      "#11187e",
          midBlue:   "#2027a7",
          electric:  "#1f2bc8",
          bright:    "#2537de",
          offWhite:  "#eeeee7",
          black:     "#161616",
          // Paleta secundária
          darkNavy:  "#10175d",
          vivid:     "#0f18d3",
          medBlue:   "#034bbe",
          steel:     "#365683",
          light:     "#537ae5",
          muted:     "#4980aa",
          sky:       "#5ca3c7",
          teal:      "#64afd1",
          pale:      "#9cc7e4",
          mint:      "#79caab",
          cream:     "#ffffe6",
          // Aliases de compatibilidade (nomes anteriores)
          darkBlue:  "#11187e",
          skyBlue:   "#5ca3c7",
          darkGray:  "#444444",
          lightGray: "#c9ced6",
        },
      },
      fontFamily: {
        // Space Grotesk — fonte principal (títulos, subtítulos, corpo)
        sans: ["var(--font-space-grotesk)", "Arial", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "Arial", "sans-serif"],
        // Right Grotesk — display/impacto (sempre maiúsculo)
        "right-grotesk": ["var(--font-right-grotesk)", "Arial", "sans-serif"],
        // SF Pro Display — legendas e rodapés
        "sf-pro": ["var(--font-sf-pro-display)", "-apple-system", "BlinkMacSystemFont", "Arial", "sans-serif"],
        // Legado
        gotham: ["var(--font-gotham-bold)", "Arial", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config