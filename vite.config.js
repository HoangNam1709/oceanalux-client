import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <-- Đảm bảo đã có dòng này

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Và dòng này phải nằm TRƯỚC các plugin khác về CSS
  ],
});
