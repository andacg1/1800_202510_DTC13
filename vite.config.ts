import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, PluginOption } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

const fullReloadAlways: PluginOption = {
  name: "full-reload-always",
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
} as PluginOption;

export default defineConfig({
  root: "./",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        main: resolve(__dirname, "main.html"),
        login: resolve(__dirname, "login.html"),
        create: resolve(__dirname, "create.html"),
        profile: resolve(__dirname, "profile.html"),
        support: resolve(__dirname, "support.html"),
        search: resolve(__dirname, "search.html"),
      },
      plugins: [],
    },
  },
  optimizeDeps: {
    entries: ["*.html", "src/**/*{.html,.css,.js}"],
  },
  plugins: [tailwindcss(), fullReloadAlways, react()],
});
