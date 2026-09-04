/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        bg1: '#111118',
        bg2: '#18181F',
        bg3: '#222230',
        or: '#F47521',
        or2: '#FF9040',
        t1: '#FFFFFF',
        t2: 'rgba(255,255,255,.72)',
        t3: 'rgba(255,255,255,.48)',
        t4: 'rgba(255,255,255,.3)',
        green: '#4ADE80',
        red: '#FF5C5C',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 100px 20px rgba(244,117,33,.25)',
      }
    },
  },
  plugins: [],
}
