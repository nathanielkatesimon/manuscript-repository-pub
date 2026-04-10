const config = {
  plugins: {
    "@tailwindcss/postcss": {
      theme: {
        extend: {
          colors: {
            brand: "#563d06", // your custom keyword
          },
        },
      },
    },
  },
};

export default config;
