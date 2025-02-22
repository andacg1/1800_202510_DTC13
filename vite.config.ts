import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // root: "src",
  build: {
    rollupOptions: {
      plugins: [],
    },
  },
  optimizeDeps: {
    entries: "src/**/*{.html,.css,.js}",
  },
  plugins: [tailwindcss()],
});
