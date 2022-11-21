module.exports = {
  purge: [
    './src/**/*.{js,jsx}',
    './public/index.html',
  ],
  darkMode: false,
  theme: {
    extend: {
      screens: {
        'mobile': { min: '400px', max: '768px' },
        '900': { min: '900px' }
      },
      animation: {
        'fade-in': 'fadeIn .3s ease-out forwards',
        'slide-up': 'slideUp .3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: 0,
          }
        },
        slideUp: {
          from: {
            transform: 'translateY(50px)',
          }
        }
      },
    },
  },
  variants: {
    extend: {
      display: ["group-hover"],
      backgroundColor: ['active'],
    }
  },
  plugins: [],
}
