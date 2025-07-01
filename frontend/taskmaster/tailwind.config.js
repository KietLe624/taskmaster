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
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
