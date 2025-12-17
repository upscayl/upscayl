/**
 * @type {import('electron-vite').UserConfig}
 */

import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    build: {
      outDir: resolve(__dirname, "export/electron"),
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/index.ts"),
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(__dirname, "export/electron/preload"),
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/preload.ts"),
        },
      },
    },
  },
  renderer: {
    root: ".",
    base: "./",
    build: {
      outDir: resolve(__dirname, "renderer/out"),
      rollupOptions: {
        input: {
          index: resolve("index.html"),
        },
      },
    },
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    publicDir: resolve(__dirname, "renderer/public"),
  },
});
