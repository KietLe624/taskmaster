// tailwind.config.js
module.exports = {
  // mode: 'jit', // Tùy chọn, bật JIT mode nếu bạn muốn tốc độ build nhanh hơn (từ Tailwind 2.1)
  purge: {
    enabled: process.env.NODE_ENV === "production", // Chỉ kích hoạt purge trong môi trường production
    content: [
      "./src/**/*.{html,ts}", // Đường dẫn để quét các class Tailwind
    ],
  },
  darkMode: false, // hoặc 'media' hoặc 'class'
  theme: {
    extend: {
      animation: {
        "bounce-1": "bounce 1.5s infinite",
        "bounce-2": "bounce 1.5s infinite 0.2s",
        "bounce-3": "bounce 1.5s infinite 0.4s",
      },
      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(-25%)" },
          "50%": { transform: "translateY(0)" },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
