/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        ripple: {
          'from': {
            opacity: '0.4',
            transform: 'scale(0)',
          },
          'to': {
            opacity: '0',
            transform: 'scale(4)',
          },
        },
      },
      animation: {
        ripple: 'ripple 1s linear',
      },
    },
  },
  plugins: [],
};