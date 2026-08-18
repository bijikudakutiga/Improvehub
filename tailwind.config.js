/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#251A3F',
          50: '#F3F0F9',
          100: '#E4DDF1',
          400: '#5C4A87',
          600: '#3A2A5C',
          900: '#251A3F'
        },
        lavender: {
          DEFAULT: '#9B87C4',
          50: '#F5F2FB',
          100: '#EFEAF9',
          200: '#DCD1F0',
          300: '#C4B4E3',
          400: '#9B87C4',
          500: '#7E67AC'
        },
        tint: '#EFEAF9',
        mint: '#C9EAD8',
        peach: '#F6DCC6',
        blush: '#F3D2DA',
        sky: '#CFE3F5'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
      },
      animation: {
        fadeIn: 'fadeIn 0.45s ease-out both'
      }
    }
  },
  plugins: []
}
