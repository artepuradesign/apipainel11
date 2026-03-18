
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      screens: {
        'tablet': '768px',
        '3xl': '1600px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          subtle: "hsl(var(--success-subtle))",
          "subtle-foreground": "hsl(var(--success-subtle-foreground))",
          border: "hsl(var(--success-border))",
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          purple: "#9b87f5",
          lightPurple: "#f3f0fe",
          darkPurple: "#7E69AB",
          blue: "#0EA5E9",
          // Tons temáticos para planos
          tone1: "#9b87f5", // Original - Tom mais claro
          tone2: "#8b77e5", // Tom médio-claro
          tone3: "#7b67d5", // Tom médio-escuro
          tone4: "#6b57c5", // Tom mais escuro
          // Additional brand gradient colors
          purpleGradient: "linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // New enhanced animations
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(50px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-50px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-100px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "zoom-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "rotate-in": {
          "0%": { opacity: "0", transform: "rotate(-200deg) scale(0.5)" },
          "100%": { opacity: "1", transform: "rotate(0) scale(1)" },
        },
        "flip-in-x": {
          "0%": { opacity: "0", transform: "perspective(400px) rotateX(-90deg)" },
          "40%": { transform: "perspective(400px) rotateX(-20deg)" },
          "60%": { transform: "perspective(400px) rotateX(10deg)" },
          "80%": { transform: "perspective(400px) rotateX(-5deg)" },
          "100%": { opacity: "1", transform: "perspective(400px) rotateX(0deg)" },
        },
        "pulse-grow": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "glow": {
          "0%": { boxShadow: "0 0 20px rgba(155, 135, 245, 0.4)" },
          "100%": { boxShadow: "0 0 30px rgba(155, 135, 245, 0.8), 0 0 40px rgba(155, 135, 245, 0.3)" },
        },
        "blob": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
          "25%": { transform: "translate(30px, -50px) scale(1.1) rotate(90deg)" },
          "50%": { transform: "translate(-20px, 20px) scale(0.9) rotate(180deg)" },
          "75%": { transform: "translate(20px, -30px) scale(1.05) rotate(270deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
        // New enhanced animations
        "fade-in-up": "fade-in-up 0.8s ease-out",
        "fade-in-down": "fade-in-down 0.8s ease-out",
        "slide-in-left": "slide-in-left 0.8s ease-out",
        "slide-in-right": "slide-in-right 0.8s ease-out",
        "zoom-in": "zoom-in 0.6s ease-out",
        "bounce-in": "bounce-in 0.8s ease-out",
        "rotate-in": "rotate-in 0.8s ease-out",
        "flip-in-x": "flip-in-x 0.8s ease-out",
        "pulse-grow": "pulse-grow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "blob": "blob 12s infinite ease-in-out",
      },
      backgroundImage: {
        "gradient-purple": "linear-gradient(to bottom, rgba(155, 135, 245, 0.8), rgba(26, 31, 44, 1))",
        "gradient-dark": "linear-gradient(to bottom, rgba(81, 33, 177, 0.3), rgba(13, 13, 18, 1))",
        "page-header": "linear-gradient(to bottom, rgba(155, 135, 245, 0.8), rgba(26, 31, 44, 1))",
      },
      animationDelay: {
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s',
        '400': '0.4s',
        '500': '0.5s',
        '600': '0.6s',
        '700': '0.7s',
        '800': '0.8s',
        '2000': '2s',
        '3000': '3s',
        '4000': '4s',
        '5000': '5s',
        '6000': '6s',
        '7000': '7s',
        '8000': '8s',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.animation-delay-100': { 'animation-delay': '0.1s' },
        '.animation-delay-200': { 'animation-delay': '0.2s' },
        '.animation-delay-300': { 'animation-delay': '0.3s' },
        '.animation-delay-400': { 'animation-delay': '0.4s' },
        '.animation-delay-500': { 'animation-delay': '0.5s' },
        '.animation-delay-600': { 'animation-delay': '0.6s' },
        '.animation-delay-700': { 'animation-delay': '0.7s' },
        '.animation-delay-800': { 'animation-delay': '0.8s' },
        '.animation-delay-2000': { 'animation-delay': '2s' },
        '.animation-delay-3000': { 'animation-delay': '3s' },
        '.animation-delay-4000': { 'animation-delay': '4s' },
        '.animation-delay-5000': { 'animation-delay': '5s' },
        '.animation-delay-6000': { 'animation-delay': '6s' },
        '.animation-delay-7000': { 'animation-delay': '7s' },
        '.animation-delay-8000': { 'animation-delay': '8s' },
      }
      addUtilities(newUtilities)
    }
  ],
} satisfies Config;
