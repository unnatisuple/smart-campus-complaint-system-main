/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1E',
        primary: '#2563EB',
        'primary-dark': '#1D4ED8',
        accent: '#06B6D4',
        purple: '#7C3AED',
        indigo: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        pending: '#FBBF24',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'card-bg': 'rgba(255,255,255,0.05)',
        'card-border': 'rgba(255,255,255,0.1)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #2563EB, #7C3AED)',
        'card-gradient': 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
        'btn-gradient': 'linear-gradient(90deg, #2563EB, #06B6D4)',
        'highlight-gradient': 'linear-gradient(90deg, #7C3AED, #EC4899)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'counter': 'counter 1s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(37,99,235,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(37,99,235,0.8), 0 0 60px rgba(37,99,235,0.4)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(37,99,235,0.4)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.4)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'glass': '16px',
      },
    },
  },
  plugins: [],
}
