import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@electron": resolve(__dirname, "./electron"),
        "@common": resolve(__dirname, "./common"),
      },
    },
    build: {
      outDir: "out/main",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "./electron/index.ts"),
        },
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@electron": resolve(__dirname, "./electron"),
        "@common": resolve(__dirname, "./common"),
      },
    },
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "./electron/preload.ts"),
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "./renderer"),
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./renderer"),
        "@common": resolve(__dirname, "./common"),
        "@components": resolve(__dirname, "./renderer/components"),
        "@lib/utils": resolve(__dirname, "./renderer/lib/utils"),
      },
    },
    build: {
      outDir: resolve(__dirname, "./out/renderer"),
      rollupOptions: {
        input: {
          index: resolve(__dirname, "./renderer/index.html"),
        },
      },
    },
  },
});
