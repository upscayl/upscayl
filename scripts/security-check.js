// Starts the app and tries, one by one, the attacks that the hardening is there to stop. A check that FAILS means
// the weakness is still in the build it ran against; on a build without the fixes several of them fail.
// No dependencies; needs Node 22 (global fetch and WebSocket).
//
//   node scripts/security-check.js --project <folder>     a built project, started with `electron .`
//   node scripts/security-check.js <app executable>       a packaged app (the window settings can't be read there)
//
// It needs the ports 9227 (DevTools of the page) and 9231 (inspector of the main process) to be free.
//
// The page is treated as taken over: every check talks to the main process the way a script injected into the page
// could, through the DevTools protocol. Exit status 1 if any check fails.
//
// Some checks start something on this machine on purpose when the weakness is there (Calculator.app on macOS, a
// file written next to the temp folder, an engine run on a 16 px picture); they clean up after themselves.
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const zlib = require("zlib");

const args = process.argv.slice(2);
const projectIndex = args.indexOf("--project");
const project = projectIndex >= 0 ? path.resolve(args[projectIndex + 1] ?? ".") : null;
const exe = project ? null : args.find((a) => !a.startsWith("--"));
if (!project && !(exe && fs.existsSync(exe))) {
  console.error("usage: node scripts/security-check.js --project <folder> | <app executable>");
  process.exit(2);
}

const root = path.join(__dirname, "..");
const PORT = 9227;
const REQUEST_TIMEOUT = 30000;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const INSPECT_PORT = 9231;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "upscayl-security-")));
const results = [];
// the temporary folders of the app that the pastes went to: the app is killed at the end and cannot remove them
const pasteFolders = new Set();

// The channel names and the first bundled model are read from the sources, so the script follows them.
const commandsSource = fs.readFileSync(path.join(root, "common", "electron-commands.ts"), "utf8");
const C = Object.fromEntries([...commandsSource.matchAll(/^\s*([A-Z_]+):\s*"([^"]+)"/gm)].map((m) => [m[1], m[2]]));
const modelsSource = fs.readFileSync(path.join(root, "common", "models-list.ts"), "utf8");
const bundledModel = modelsSource.match(/^\s*"?([a-z0-9-]+)"?:\s*\{/m)?.[1];

const required = [
  "UPSCAYL", "FOLDER_UPSCAYL", "UPSCAYL_ERROR", "UPSCAYL_DONE", "STOP", "PASTE_IMAGE", "PASTE_IMAGE_SAVE_SUCCESS",
  "PASTE_IMAGE_SAVE_ERROR", "OPEN_FOLDER", "GET_MODELS_LIST", "CUSTOM_MODEL_FILES_LIST", "SELECT_CUSTOM_MODEL_FOLDER",
];
const missing = required.filter((key) => !C[key]);
if (!bundledModel) missing.push("a bundled model in common/models-list.ts");
if (missing.length) {
  console.error(`FAIL  the checks cannot be built, the sources have no: ${missing.join(", ")}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(2);
}

/** Runs one check and prints PASS, or FAIL with what was wrong. */
const check = async (name, fn) => {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`PASS  ${name}${detail ? "  " + detail : ""}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name}  ${error.message || error}`);
  }
};
/** Prints a check that cannot run here, with the reason. */
const skip = (name, why) => console.log(`SKIP  ${name}  ${why}`);

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
/** The CRC-32 of a buffer (zlib.crc32 only exists from Node 22.2). */
const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** Writes a small RGB picture by hand, so that the test needs no packages. */
const makePng = (file, size) => {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(8 + data.length + 4);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), 8 + data.length);
    return out;
  };
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    for (let x = 0; x < size; x++) {
      row[1 + x * 3] = (x * 255) / size;
      row[2 + x * 3] = (y * 255) / size;
      row[3 + x * 3] = 128;
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", header),
      chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
};
/** The width of a PNG file, from its header. */
const pngWidth = (file) => fs.readFileSync(file).readUInt32BE(16);

/** Writes a GIF, to be named like a PNG: the engine decodes a file by what is in it, not by its name. */
const makeDisguisedGif = (file) =>
  fs.writeFileSync(file, Buffer.from("474946383961010001008000000000000000ff00ff00002c00000000010001000002024401003b", "hex"));

/** Calls `fn` until it returns something true, or throws when `ms` have passed. */
const waitFor = async (fn, ms, what) => {
  const end = Date.now() + ms;
  for (;;) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {
      // not ready yet, try again
    }
    if (Date.now() > end) throw new Error(`timed out waiting for ${what}`);
    await sleep(300);
  }
};

/** Opens a DevTools protocol connection; `evaluate` runs an expression there and returns its value. */
const connect = async (wsUrl) => {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("DevTools connection failed"));
  });
  let id = 0;
  const pending = new Map();
  const events = [];
  /** Fails every request that has not been answered, because no answer is coming any more. */
  const failPending = (reason) => {
    for (const { reject, timer } of pending.values()) {
      clearTimeout(timer);
      reject(new Error(reason));
    }
    pending.clear();
  };
  ws.onclose = () => failPending("the DevTools connection was closed");
  ws.onerror = () => failPending("the DevTools connection failed");
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    const request = data.id && pending.get(data.id);
    if (request) {
      clearTimeout(request.timer);
      pending.delete(data.id);
      request.resolve(data);
    } else if (data.method) events.push(data);
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      if (ws.readyState !== WebSocket.OPEN) return reject(new Error("the DevTools connection is not open"));
      const i = ++id;
      const timer = setTimeout(() => {
        pending.delete(i);
        reject(new Error(`${method} got no answer in ${REQUEST_TIMEOUT / 1000} s`));
      }, REQUEST_TIMEOUT);
      pending.set(i, { resolve, reject, timer });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, includeCommandLineAPI: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  return { send, evaluate, events, close: () => ws.close() };
};

/** The debugging targets (pages, or the main process) that the app lists on a port. */
const targets = async (port) => (await fetch(`http://127.0.0.1:${port}/json`)).json();

(async () => {
  console.log(`security check on ${process.platform}/${process.arch}, node ${process.version}`);

  const command = project ? require(path.join(project, "node_modules", "electron")) : exe;
  const appArgs = [
    ...(project ? [project] : []),
    `--user-data-dir=${path.join(tmp, "profile")}`,
    `--remote-debugging-port=${PORT}`,
    ...(project ? [`--inspect=${INSPECT_PORT}`] : []),
  ];
  // what the app prints is kept: it shows the arguments the engine was started with
  let appLog = "";
  const child = spawn(command, appArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    // a project run unpackaged would look for the dev server of its renderer
    env: { ...process.env, ELECTRON_IS_DEV: "0" },
  });
  child.stdout.on("data", (chunk) => (appLog += chunk));
  child.stderr.on("data", (chunk) => (appLog += chunk));
  let exited = false;
  child.on("exit", () => (exited = true));
  /** Ends the app and what it started. */
  const stopApp = () => {
    if (exited) return;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    else child.kill("SIGKILL");
  };

  // whatever ends the run, the app is stopped and the temporary files are removed
  process.on("exit", () => {
    stopApp();
    for (const folder of [tmp, ...pasteFolders]) fs.rmSync(folder, { recursive: true, force: true });
  });

  let page;
  let main = null;
  try {
    const target = await waitFor(async () => (await targets(PORT)).find((t) => t.type === "page" && /index\.html$/.test(t.url)), 90000, "the main page");
    page = await connect(target.webSocketDebuggerUrl);
    await waitFor(() => page.evaluate("!!window.electron"), 60000, "the bridge");
    if (project) main = await connect((await targets(INSPECT_PORT))[0].webSocketDebuggerUrl);
  } catch (error) {
    console.log(`FAIL  the app starts and shows its page  ${error.message}`);
    stopApp();
    process.exit(1);
  }

  // what the main process sends back is collected in the page
  const watched = [C.UPSCAYL_ERROR, C.UPSCAYL_DONE, C.PASTE_IMAGE_SAVE_SUCCESS, C.PASTE_IMAGE_SAVE_ERROR, C.CUSTOM_MODEL_FILES_LIST].filter(Boolean);
  await page.evaluate(`(() => {
    window.__events = [];
    for (const channel of ${JSON.stringify(watched)}) {
      try { window.electron.on(channel, (...a) => window.__events.push({ channel, data: a[a.length - 1] })); } catch { /* a channel this build does not have */ }
    }
    return true;
  })()`);
  /**
   * The input files and folders (-i) that the engine was started with, after the first `mark` characters of the
   * log. The command is printed when the engine starts; the list of child processes only shows the first one.
   */
  const engineInputs = (mark) => {
    const text = appLog.slice(mark);
    return [
      ...[...text.matchAll(/'-i',\s*'([^']*)'/g)].map((m) => m[1]),
      ...[...text.matchAll(/"-i","((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)),
    ];
  };
  /** How many events from the main process the page has collected so far. */
  const eventCount = () => page.evaluate("window.__events.length");
  /** The events collected after the first `count`. */
  const eventsSince = (count) => page.evaluate(`window.__events.slice(${count})`);
  /** The first event on one of the channels after `count`, or null when `ms` pass without one. */
  const nextEvent = async (count, channels, ms) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const found = (await eventsSince(count)).find((e) => channels.includes(e.channel));
      if (found) return found;
      await sleep(150);
    }
    return null;
  };
  /** Sends a message to the main process the way the page does. */
  const sendToMain = (channel, payload) => page.evaluate(`(() => { window.electron.send(${JSON.stringify(channel)}, ${JSON.stringify(payload)}); return true; })()`);

  const picture = path.join(tmp, "picture.png");
  makePng(picture, 16);
  const output = path.join(tmp, "output");
  fs.mkdirSync(output);
  /** A valid upscale request for the picture made above, with `overrides` on top. */
  const upscaleRequest = (overrides) => ({
    imagePath: picture,
    batchFolderPath: "",
    outputPath: output,
    model: bundledModel,
    scale: 2,
    saveImageAs: "png",
    compression: 0,
    overwrite: true,
    tileSize: null,
    gpuId: null,
    ttaMode: false,
    useCustomWidth: false,
    customWidth: "",
    copyMetadata: false,
    engine: "ncnn",
    ...overrides,
  });
  /** A file as base64, the way the page sends a pasted picture. */
  const pictureBase64 = (file) => fs.readFileSync(file).toString("base64");
  /** What the page sends for a pasted picture. */
  const pastePayload = (name, file, extra = {}) => ({
    name,
    extension: "png",
    type: "image/png",
    size: fs.statSync(file).size,
    encodedBuffer: pictureBase64(file),
    ...extra,
  });
  /** The picture as bytes in the page (some builds take bytes, others base64). */
  const pasteBytes = (file) => `Uint8Array.from(atob(${JSON.stringify(pictureBase64(file))}), (c) => c.charCodeAt(0))`;
  /** Pastes a picture and returns the answer of the main process. */
  const paste = async (payload, file) => {
    const count = await eventCount();
    await page.evaluate(`(() => { window.electron.send(${JSON.stringify(C.PASTE_IMAGE)}, { ...${JSON.stringify(payload)}, buffer: ${pasteBytes(file)} }); return true; })()`);
    const event = await nextEvent(count, [C.PASTE_IMAGE_SAVE_SUCCESS, C.PASTE_IMAGE_SAVE_ERROR], 6000);
    if (event?.channel === C.PASTE_IMAGE_SAVE_SUCCESS) {
      // <temp>/upscayl-paste-XXXX/paste-YYYY/<name> in the hardened builds
      const session = path.dirname(path.dirname(String(event.data)));
      if (path.basename(session).startsWith("upscayl-paste")) pasteFolders.add(session);
    }
    return event;
  };
  /** The error text a request is refused with, or null when nothing refused it in time. */
  const refusal = async (channel, payload, ms = 3500) => {
    const count = await eventCount();
    await sendToMain(channel, payload);
    const event = await nextEvent(count, [C.UPSCAYL_ERROR], ms);
    if (C.STOP) await sendToMain(C.STOP, null);
    await sleep(500);
    return event ? String(event.data) : null;
  };

  // --- the window and the bridge -------------------------------------------------------------------------------
  await check("the page has no Node of its own", async () => {
    const found = await page.evaluate(`[typeof require, typeof process, typeof module].filter((t) => t !== "undefined").length`);
    if (found) throw new Error("require, process or module is reachable from the page");
  });

  await check("a script injected into the page does not run", async () => {
    const ran = await page.evaluate(`(async () => {
      window.__injected = false;
      const script = document.createElement("script");
      script.textContent = "window.__injected = true";
      document.head.appendChild(script);
      await new Promise((r) => setTimeout(r, 300));
      return window.__injected;
    })()`);
    if (ran) throw new Error("an inline script was run (no Content-Security-Policy, or it allows 'unsafe-inline')");
  });

  await check("the bridge still gives the version and the system information", async () => {
    const info = await page.evaluate(`(async () => {
      const system = await window.electron.getSystemInfo();
      return { version: await window.electron.getAppVersion(), platform: window.electron.platform, cpus: system.cpuCount, system: system.platform };
    })()`);
    if (!info.version || !info.platform || !(info.cpus > 0) || !info.system) throw new Error(`incomplete: ${JSON.stringify(info)}`);
  });

  await check("a channel that is not on the list is refused", async () => {
    const accepted = await page.evaluate(`(() => { try { window.electron.send("not-a-channel"); return true; } catch { return false; } })()`);
    if (accepted) throw new Error("the bridge passes any channel on to the main process");
  });

  if (main) {
    await check("the window settings: no Node, context isolation, web security, sandbox", async () => {
      const prefs = await main.evaluate(`(() => {
        const { webContents } = require("electron");
        const page = webContents.getAllWebContents().find((w) => /index\\.html$/.test(w.getURL()));
        return page.getLastWebPreferences();
      })()`);
      const wrong = [];
      if (prefs.nodeIntegration) wrong.push("nodeIntegration is on");
      if (prefs.nodeIntegrationInWorker) wrong.push("nodeIntegrationInWorker is on");
      if (!prefs.contextIsolation) wrong.push("contextIsolation is off");
      if (prefs.webSecurity === false) wrong.push("webSecurity is off");
      if (!prefs.sandbox) wrong.push("the renderer is not sandboxed");
      if (wrong.length) throw new Error(wrong.join(", "));
    });
  } else {
    skip("the window settings: no Node, context isolation, web security, sandbox", "needs --project (a packaged app does not allow the inspector)");
  }

  // --- what the main process does with what the page sends ---------------------------------------------------
  await check("a pasted picture is written to the temp folder, not where the page says", async () => {
    const escapeFolder = path.join(tmp, "escape");
    fs.mkdirSync(escapeFolder);
    const event = await paste(pastePayload("../evil.png", picture, { path: escapeFolder }), picture);
    if (!event) throw new Error("no answer");
    if (event.channel !== C.PASTE_IMAGE_SAVE_SUCCESS) throw new Error(`the paste itself was refused (${event.data}), so this cannot be judged`);
    const written = path.resolve(String(event.data));
    if (written.startsWith(tmp + path.sep)) throw new Error(`the file was written at ${written}, in the folder the page chose`);
    if (path.basename(written) !== "evil.png") throw new Error(`the name was not cut to its last part: ${written}`);
    if (fs.existsSync(path.join(tmp, "evil.png")) || fs.existsSync(path.join(escapeFolder, "evil.png"))) throw new Error("a file was written next to the folder the page chose");
  });

  await check("two pastes with the same name do not overwrite each other", async () => {
    const small = path.join(tmp, "small.png");
    const large = path.join(tmp, "large.png");
    makePng(small, 16);
    makePng(large, 32);
    const first = await paste(pastePayload("image.png", small, { path: path.join(tmp, "escape") }), small);
    const second = await paste(pastePayload("image.png", large, { path: path.join(tmp, "escape") }), large);
    if (first?.channel !== C.PASTE_IMAGE_SAVE_SUCCESS || second?.channel !== C.PASTE_IMAGE_SAVE_SUCCESS) throw new Error("a paste was refused");
    if (first.data === second.data) throw new Error("both pictures were written to the same file");
    if (pngWidth(first.data) !== 16 || pngWidth(second.data) !== 32) throw new Error("a pasted picture was changed by the next paste");
  });

  if (process.platform === "darwin") {
    await check("opening a folder does not start an application", async () => {
      if (spawnSync("pgrep", ["-x", "Calculator"]).status === 0) throw new Error("Calculator is already running, close it and run again");
      await sendToMain(C.OPEN_FOLDER, "/System/Applications/Calculator.app");
      await sleep(2500);
      if (spawnSync("pgrep", ["-x", "Calculator"]).status === 0) {
        spawnSync("pkill", ["-x", "Calculator"]);
        throw new Error("Calculator.app was started (an application is a folder on macOS)");
      }
    });
  } else {
    skip("opening a folder does not start an application", "macOS only");
  }

  await check("the models folder is the one the user chose, not the one the page names", async () => {
    const models = path.join(tmp, "models");
    fs.mkdirSync(models);
    fs.writeFileSync(path.join(models, "planted.param"), "7767517\n");
    fs.writeFileSync(path.join(models, "planted.bin"), "x");
    const count = await eventCount();
    await sendToMain(C.GET_MODELS_LIST, models);
    const event = await nextEvent(count, [C.CUSTOM_MODEL_FILES_LIST], 2500);
    if (event && JSON.stringify(event.data).includes("planted")) throw new Error("the main process listed the models of a folder that only the page named");
  });

  if (main) {
    await check("a models folder chosen in the dialog is used", async () => {
      const models = path.join(tmp, "models");
      // the dialog is answered from here, the way a user would
      await main.evaluate(`(() => {
        const { dialog } = require("electron");
        dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [${JSON.stringify(models)}], bookmarks: [] });
        return true;
      })()`);
      const count = await eventCount();
      await page.evaluate(`window.electron.invoke(${JSON.stringify(C.SELECT_CUSTOM_MODEL_FOLDER)})`);
      await sendToMain(C.GET_MODELS_LIST, models);
      const event = await nextEvent(count, [C.CUSTOM_MODEL_FILES_LIST], 4000);
      if (!event || !JSON.stringify(event.data).includes("planted")) throw new Error("the folder the user chose was not used");
    });
  }

  // --- what an upscale request may ask for ------------------------------------------------------------------
  await check("a normal upscale request is not refused", async () => {
    const text = await refusal(C.UPSCAYL, upscaleRequest({}));
    // what the engine itself says (it may not run here) is not a refusal of the request
    if (text && /Invalid request/.test(text)) throw new Error(text);
  });

  for (const model of ["constructor", "__proto__", "../../etc/passwd"]) {
    await check(`a model that is not bundled is refused: ${model}`, async () => {
      const text = await refusal(C.UPSCAYL, upscaleRequest({ model }));
      if (!text || !/Invalid request/.test(text)) throw new Error(text ? `answered "${text}" instead of refusing it` : "not refused, the request went on");
    });
  }

  await check("an output folder that does not exist is refused", async () => {
    const text = await refusal(C.UPSCAYL, upscaleRequest({ outputPath: path.join(tmp, "nowhere") }));
    if (!text || !/Invalid request/.test(text)) throw new Error("not refused");
  });

  await check("a GIF with a .png name is refused", async () => {
    const disguised = path.join(tmp, "disguised.png");
    makeDisguisedGif(disguised);
    const text = await refusal(C.UPSCAYL, upscaleRequest({ imagePath: disguised }));
    if (!text || !/Invalid request/.test(text)) throw new Error("not refused, the engine would decode it by what is inside");
  });

  await check("a folder with a GIF named like a PNG inside is refused", async () => {
    const folder = path.join(tmp, "batch");
    fs.mkdirSync(folder);
    makePng(path.join(folder, "fine.png"), 16);
    makeDisguisedGif(path.join(folder, "disguised.png"));
    const text = await refusal(C.FOLDER_UPSCAYL, upscaleRequest({ batchFolderPath: folder, imagePath: "" }));
    if (!text || !/Invalid request/.test(text)) throw new Error("not refused, the engine would decode every file by what is inside");
  });

  // What is checked has to be what the engine reads. These two put a different file behind the name once the
  // path is decoded a second time, or when only one side decodes it; the log of the app shows what the engine got.
  await check("the engine reads the picture that was checked, not another one", async () => {
    // decoded once the name is a PNG; decoded twice it is the GIF in the folder a
    makePng(path.join(tmp, "a%2Fevil.png"), 16);
    fs.mkdirSync(path.join(tmp, "a"));
    const hidden = path.join(tmp, "a", "evil.png");
    makeDisguisedGif(hidden);
    const mark = appLog.length;
    await refusal(C.UPSCAYL, upscaleRequest({ imagePath: path.join(tmp, "a%252Fevil.png") }));
    if (engineInputs(mark).includes(hidden)) throw new Error("the engine was given a file that nobody checked");
  });

  await check("the engine reads the folder that was checked, not another one", async () => {
    // the folder safe/er has a PNG, the folder that is really called safe%2Fer has a GIF
    fs.mkdirSync(path.join(tmp, "safe", "er"), { recursive: true });
    makePng(path.join(tmp, "safe", "er", "fine.png"), 16);
    const gifFolder = path.join(tmp, "safe%2Fer");
    fs.mkdirSync(gifFolder);
    makeDisguisedGif(path.join(gifFolder, "disguised.png"));
    const mark = appLog.length;
    await refusal(C.FOLDER_UPSCAYL, upscaleRequest({ batchFolderPath: gifFolder, imagePath: "" }));
    if (engineInputs(mark).includes(gifFolder)) throw new Error("the engine was given a folder that nobody checked");
  });

  // --- what the page loads (last: it reloads the page) ---------------------------------------------------------
  await check("no script is loaded from another host", async () => {
    await page.send("Network.enable");
    page.events.length = 0;
    await page.send("Page.reload");
    await sleep(7000);
    const foreign = page.events
      .filter((e) => e.method === "Network.requestWillBeSent" && e.params.type === "Script")
      .map((e) => e.params.request.url)
      .filter((url) => /^https?:/.test(url) && !LOCAL_HOSTS.has(new URL(url).hostname));
    if (foreign.length) throw new Error(`scripts from ${[...new Set(foreign.map((u) => new URL(u).host))].join(", ")}`);
  });

  page.close();
  main?.close();
  stopApp();
  // the helper processes of the app write to its profile until they are gone; the files are removed at exit
  await sleep(1500);

  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `\n${failed} of ${results.length} checks failed` : `\nall ${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})();
