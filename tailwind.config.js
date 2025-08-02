export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#111827',
        'panel-bg': 'rgba(31, 41, 55, 0.5)',
        'panel-border': 'rgba(255, 255, 255, 0.1)',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'text-muted': '#4B5563',
        'accent-primary': '#3B82F6',
        'accent-primary-hover': '#2563EB',
        'accent-success': '#10B981',
        'accent-error': '#EF4444',
        'accent-warning': '#F59E0B',
        'node-bg': '#1F2937',
        'node-border': '#374151',
        'node-border-selected': 'var(--accent-primary)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      spacing: {
        '24': '6rem',
      },
    },
  },
  plugins: [],
}
