/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004253',
          container: '#005b71',
          fixed: '#b7eaff',
          'fixed-dim': '#8dd0e9',
        },
        secondary: {
          DEFAULT: '#516164',
          container: '#d4e6e9',
        },
        tertiary: {
          DEFAULT: '#00434a',
          container: '#005c66',
          fixed: '#95f1ff',
          'fixed-dim': '#78d4e2',
        },
        surface: {
          DEFAULT: '#f7f9ff',
          dim: '#d7dae0',
          container: '#ebeef4',
          'container-low': '#f1f4fa',
          'container-high': '#e5e8ee',
          'container-highest': '#dfe3e8',
          'container-lowest': '#ffffff',
        },
        'on-surface': '#181c20',
        'on-surface-variant': '#40484c',
        outline: {
          DEFAULT: '#70787d',
          variant: '#bfc8cc',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0px 4px 16px rgba(24,28,32,0.04)',
        elevated: '0px 12px 32px rgba(24,28,32,0.06)',
      },
    },
  },
  plugins: [],
};
