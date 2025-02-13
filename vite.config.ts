import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";

const iconsPath = "node_modules/@shoelace-style/shoelace/dist/assets/icons";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /\/assets\/icons\/(.+)/,
        replacement: `${iconsPath}/$1`,
      },
    ],
  },
  build: {
    rollupOptions: {
      // external: /^lit/,
      plugins: [],
    },
  },
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: iconsPath,
          dest: "assets",
        },
      ],
    }),
  ],
});
