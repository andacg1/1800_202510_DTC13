import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // root: "src",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        main: resolve(__dirname, "main.html"),
        login: resolve(__dirname, "login.html"),
        create: resolve(__dirname, "create.html"),
      },
      plugins: [],
    },
  },
  optimizeDeps: {
    entries: ["/*.html", "src/**/*{.html,.css,.js}"],
  },
  plugins: [tailwindcss()],
});
