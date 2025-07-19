/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Expo-inspired dark theme colors
        expo: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          850: "#172033",
          900: "#0f172a",
          950: "#020617",
        },
        dark: {
          50: "#ffffff",
          100: "#f8fafc",
          200: "#f1f5f9",
          300: "#e2e8f0",
          400: "#cbd5e1",
          500: "#94a3b8",
          600: "#64748b",
          700: "#475569",
          800: "#334155",
          850: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        secondary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
        },
        pink: {
          50: "#fdf2f8",
          100: "#fce7f3",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
        },
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#5b21b6",
          700: "#4c1d95",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "bounce-subtle": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "card-dark":
          "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        "card-dark-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
        button: "0 4px 14px 0 rgba(0, 118, 255, 0.39)",
        "button-dark": "0 4px 14px 0 rgba(59, 130, 246, 0.5)",
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        expo: "0 8px 32px rgba(0, 0, 0, 0.12)",
        "expo-dark": "0 8px 32px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".glass-morphism": {
          background: "rgba(255, 255, 255, 0.25)",
          "backdrop-filter": "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        },
        ".glass-morphism-dark": {
          background: "rgba(15, 23, 42, 0.4)",
          "backdrop-filter": "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
        ".text-shadow": {
          "text-shadow": "0 2px 4px rgba(0,0,0,0.1)",
        },
        ".text-shadow-lg": {
          "text-shadow":
            "0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
