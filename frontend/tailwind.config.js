/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0B1220",
          900: "#111A2B",
          850: "#141F33",
          800: "#172033",
          700: "#1E2B45",
        },
        electric: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          light: "#60A5FA",
          dim: "rgba(59, 130, 246, 0.15)",
        },
        tealAccent: {
          DEFAULT: "#14B8A6",
          dark: "#0D9488",
          dim: "rgba(20, 184, 166, 0.15)",
        },
        primary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#0b1220",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        btn: "10px",
        panel: "18px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 4px 12px -2px rgba(11, 18, 32, 0.08), 0 2px 4px -2px rgba(11, 18, 32, 0.04)",
        "depth-1": "0 2px 6px -1px rgba(11, 18, 32, 0.06)",
        "depth-2": "0 8px 24px -4px rgba(11, 18, 32, 0.10)",
        "depth-3": "0 16px 36px -6px rgba(11, 18, 32, 0.16)",
        "glow-blue": "0 0 20px -3px rgba(59, 130, 246, 0.35)",
        "glow-teal": "0 0 20px -3px rgba(20, 184, 166, 0.35)",
      },
    },
  },
  plugins: [],
}
