import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { devtools } from "@tanstack/devtools-vite";
import tailwindcss from "@tailwindcss/vite";
import { createHash } from "crypto";
import type { Plugin } from "vite";

// What the page is allowed to load. The built app only runs its own scripts, plus the one inline script of
// index.html (allowed by its hash). The dev server also needs inline scripts and eval for hot reload.
//
// Other hosts are the ones the app talks to: PostHog, the news file, the log upload. The Firebase hosts of the
// cloud sign-in are not listed, it is switched off (FEATURE_FLAGS.SHOW_UPSCAYL_CLOUD_INFO).
// PostHog's own extra scripts are not allowed either (disable_external_dependency_loading in its setup).
const buildContentSecurityPolicy = (dev: boolean, inlineScripts: string[]) => {
  const hashes = inlineScripts.map(
    (code) => `'sha256-${createHash("sha256").update(code).digest("base64")}'`,
  );
  const scripts = dev ? ["'unsafe-inline'", "'unsafe-eval'"] : hashes;
  const connect = [
    "https://us.i.posthog.com",
    "https://us-assets.i.posthog.com",
    "https://raw.githubusercontent.com",
    "https://termbin.com:9999",
    ...(dev ? ["http://localhost:*", "ws://localhost:*"] : []),
  ];

  return [
    "default-src 'self'",
    `script-src 'self' ${scripts.join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    // https: is for the pictures in the news
    "img-src 'self' data: blob: https: upscayl-file: public:",
    "font-src 'self' data:",
    `connect-src 'self' ${connect.join(" ")}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join("; ");
};

const contentSecurityPolicy = (): Plugin => ({
  name: "upscayl-content-security-policy",
  transformIndexHtml: {
    order: "post",
    handler(html, context) {
      const inlineScripts = [
        ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
      ].map((match) => match[1]);
      return {
        html,
        tags: [
          {
            tag: "meta",
            attrs: {
              "http-equiv": "Content-Security-Policy",
              content: buildContentSecurityPolicy(!!context.server, inlineScripts),
            },
            injectTo: "head-prepend",
          },
        ],
      };
    },
  },
});

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
    plugins: [
      react(),
      contentSecurityPolicy(),
      devtools({
        injectSource: {
          enabled: true,
          ignore: {
            files: ["node_modules", /.*\.test\.(js|ts|jsx|tsx)$/],
            components: ["InternalComponent", /.*Provider$/],
          },
        },
        logging: true,
        enhancedLogs: {
          enabled: true,
        },
      }),
      tailwindcss(),
    ],
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
