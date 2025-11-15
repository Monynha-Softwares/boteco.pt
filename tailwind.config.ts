import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./hooks/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
    "./legacy/src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        boteco: {
          primary: "var(--boteco-primary)",
          "primary-strong": "var(--boteco-primary-strong)",
          secondary: "var(--boteco-secondary)",
          "secondary-strong": "var(--boteco-secondary-strong)",
          emerald: "var(--boteco-emerald)",
          rose: "var(--boteco-rose)",
          highlight: "var(--boteco-highlight)",
          neutral: {
            0: "var(--boteco-neutral-0)",
            100: "var(--boteco-neutral-100)",
            300: "var(--boteco-neutral-300)",
            500: "var(--boteco-neutral-500)",
            700: "var(--boteco-neutral-700)",
            900: "var(--boteco-neutral-900)",
          },
        },
        depth: {
          surface: "var(--depth-surface)",
          raised: "var(--depth-raised)",
          elevated: "var(--depth-elevated)",
          sunken: "var(--depth-sunken)",
          overlay: "var(--depth-overlay)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        '2xs': "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        '2xl': "var(--shadow-2xl)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
