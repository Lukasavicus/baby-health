export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C6FEB',
          light: '#EDE9FF',
        },
        secondary: '#FF8FAB',
        accent: '#6DD5C4',
        warning: '#FFB86C',
        success: '#8BD5A0',
        background: '#F8F7FC',
        surface: '#FFFFFF',
        'text-primary': '#2D2B3D',
        'text-secondary': '#8E8CA0',
        border: '#E8E6F0',
      },
      borderRadius: {
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(45, 43, 61, 0.08)',
        'soft-lg': '0 4px 16px rgba(45, 43, 61, 0.12)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          'from': { transform: 'translateY(100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
