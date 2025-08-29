import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        muted: "hsl(var(--muted))",
        "muted-fg": "hsl(var(--muted-fg))",
        card: "hsl(var(--card))",
        "card-fg": "hsl(var(--card-fg))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        primary: "hsl(var(--primary))",
        "primary-fg": "hsl(var(--primary-fg))",
        accent: "hsl(var(--accent))",
        "accent-fg": "hsl(var(--accent-fg))",
        // Raretés
        "rarity-rare": "#0070dd",
        "rarity-epic": "#a335ee",
        "rarity-legendary": "#ff8000",
        "rarity-artifact": "#e5cc80",
      },
      boxShadow: {
        glass: "0 0 0 1px hsl(var(--border)) / 0.8, 0 8px 30px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1280px" },
      },
    },
  },
  plugins: [],
};
export default config;
