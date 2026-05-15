import { defineConfig } from "electron-vite";
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
    root: resolve(__dirname, "./electron-vite-renderer"),
    build: {
      outDir: resolve(__dirname, "./out/renderer"),
      rollupOptions: {
        input: {
          index: resolve(__dirname, "./electron-vite-renderer/index.html"),
        },
      },
    },
  },
});
