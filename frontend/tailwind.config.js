/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Brand Colors - Elevare NeuroVendas (Lilac/Purple warm palette)
        brand: {
          // Primary lilac/purple
          indigo: {
            900: '#3b1f5e',
            800: '#4c2875',
            700: '#5e358c',
            600: '#7c4dbd',
            500: '#9061c2',
            400: '#a87dd4',
          },
          // Warm slate with lilac undertones
          slate: {
            900: '#1a1625',
            800: '#252131',
            700: '#3d3650',
            600: '#544d68',
            500: '#6b6480',
            400: '#9490a3',
            300: '#c4c0d0',
            200: '#e5e3ec',
            100: '#f3f2f7',
            50: '#faf9fc',
          },
          // Elevare accent colors
          lavanda: {
            dark: '#9b7fd4',
            DEFAULT: '#b094e0',
            light: '#d4c8f0',
            soft: '#ece6f8',
          },
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#f5f0ff',
          100: '#ebe0ff',
          200: '#d6c2ff',
          300: '#b894f6',
          400: '#9b6ce8',
          500: '#7c4dbd',
          600: '#6b3fa8',
          700: '#5a3490',
          800: '#4c2875',
          900: '#3b1f5e',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: '#faf9fc',
          100: '#f3f2f7',
          200: '#e5e3ec',
          300: '#d4c8f0',
          400: '#b094e0',
          500: '#9b7fd4',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
}
