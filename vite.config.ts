import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";



export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [],
    },
  },
  plugins: [
    tailwindcss(),
  ],
});
