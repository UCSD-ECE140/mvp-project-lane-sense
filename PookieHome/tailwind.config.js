/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#OOC2FF',
        "custom-yellow": '#FFE604',
        "pastel-blue": '#ADD8E6', // Light Blue
      }
    },
    keyframes: {
      shimmer: {
        '0%': { backgroundPosition: '0% 50%' },
        '100%': { backgroundPosition: '100% 50%' },
      },
    },
    animation: {
      shimmer: 'shimmer 2s linear infinite',
    },
    backgroundImage: {
      'gradient-blue-pink': 'linear-gradient(90deg, #0000FF, #FF69B4)',
    },
    fontFamily: {
      pthin: ["Poppins-Thin", "sans-serif"],
      pextralight: ["Poppins-ExtraLight", "sans-serif"],
      plight: ["Poppins-Light", "sans-serif"],
      pregular: ["Poppins-Regular", "sans-serif"],
      pmedium: ["Poppins-Medium", "sans-serif"],
      psemibold: ["Poppins-SemiBold", "sans-serif"],
      pbold: ["Poppins-Bold", "sans-serif"],
      pextrabold: ["Poppins-ExtraBold", "sans-serif"],
      pblack: ["Poppins-Black", "sans-serif"],
    }
  },
  plugins: [],
}

