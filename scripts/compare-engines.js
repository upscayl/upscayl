// Compares upscayl-coreml with upscayl-bin on a small generated picture: the size of the result, how close it
// is to what ncnn makes (PSNR), and the requests the engine has to turn down (exit status 3, nothing written).
// Apple Silicon only. Needs a built engine (npm run build:coreml) and the bundled upscayl-bin. No dependencies,
// the PNGs are read and written here.
//   npm run compare:coreml
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const zlib = require("zlib");

const root = path.join(__dirname, "..");
// UPSCAYL_COREML=<path> tests another build of the engine
const coreml =
  process.env.UPSCAYL_COREML ||
  path.join(root, "resources", "mac", "bin", "upscayl-coreml");
const ncnn = path.join(root, "resources", "mac", "bin", "upscayl-bin");
const models = path.join(root, "resources", "models");

if (
  process.platform !== "darwin" ||
  process.arch !== "arm64" ||
  !fs.existsSync(coreml)
) {
  console.log("skipped: needs an Apple Silicon Mac and a built upscayl-coreml");
  process.exit(0);
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([len, body, crc]);
};

// depth 8 + colour type 2 is RGB, depth 1 + colour type 0 is a black and white bitmap
function writePngRaw(file, w, h, depth, colourType, raw) {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0);
  head.writeUInt32BE(h, 4);
  head[8] = depth;
  head[9] = colourType;
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", head),
      chunk("IDAT", zlib.deflateSync(raw, { level: 1 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

function writePng(file, w, h, rgb) {
  const stride = w * 3 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++)
    rgb.copy(raw, y * stride + 1, y * w * 3, (y + 1) * w * 3);
  writePngRaw(file, w, h, 8, 2, raw);
}

// An empty bitmap: a few hundred KB on disk, but a huge picture once it is upscaled
function writeHugeBlank(file, size) {
  writePngRaw(file, size, size, 1, 0, Buffer.alloc((size / 8 + 1) * size));
}

// 8 bit RGB or RGBA, not interlaced. That is all the two engines write. Returns plain RGB.
function readPng(file) {
  const buf = fs.readFileSync(file);
  let pos = 8;
  let w = 0,
    h = 0,
    type = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const name = buf.toString("latin1", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (name === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      type = data[9];
      if (data[8] !== 8 || data[12] !== 0)
        throw new Error("unexpected PNG layout in " + file);
    } else if (name === "IDAT") {
      idat.push(data);
    }
    pos += 12 + len;
  }
  const bpp = type === 2 ? 3 : type === 6 ? 4 : 0;
  if (!bpp)
    throw new Error("unexpected PNG colour type " + type + " in " + file);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const px = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    const line = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = raw[line + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + x] = v & 255;
    }
  }
  if (bpp === 3) return { w, h, rgb: px };
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) px.copy(rgb, i * 3, i * 4, i * 4 + 3);
  return { w, h, rgb };
}

function psnr(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return sum === 0 ? Infinity : 10 * Math.log10((255 * 255) / (sum / a.length));
}

let failed = 0;
function check(name, ok, detail = "") {
  console.log(
    `${ok ? "ok  " : "FAIL"} ${name}${detail ? " (" + detail + ")" : ""}`,
  );
  if (!ok) failed++;
}
const run = (bin, args) => spawnSync(bin, args, { encoding: "utf8" });
const tail = (r) => (r.stderr || "").trim().split("\n").slice(-2).join(" | ");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "upscayl-coreml-test-"));
const cache = path.join(dir, "cache");
const W = 48,
  H = 40;

// smooth ramps plus some noise, always the same
const rgb = Buffer.alloc(W * H * 3);
let seed = 12345;
const rnd = () =>
  (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    rgb[i] = Math.min(255, x * 5 + rnd() * 20);
    rgb[i + 1] = Math.min(255, y * 6 + rnd() * 20);
    rgb[i + 2] = Math.min(255, 80 + ((x + y) % 24) * 4 + rnd() * 20);
  }
}
const input = path.join(dir, "in.png");
writePng(input, W, H, rgb);

const base = (model, out) => [
  "-i",
  input,
  "-o",
  out,
  "-m",
  models,
  "-n",
  model,
  "--cache",
  cache,
];

try {
  // the result: size, and how close it is to what ncnn makes
  for (const model of ["upscayl-lite-4x", "upscayl-standard-4x"]) {
    const out = path.join(dir, `${model}.png`);
    const r = run(coreml, base(model, out));
    check(
      `${model}: runs`,
      r.status === 0 && r.stderr.includes("Upscayled Successfully!"),
      tail(r),
    );
    if (!fs.existsSync(out)) continue;
    const got = readPng(out);
    check(
      `${model}: size`,
      got.w === W * 4 && got.h === H * 4,
      `${got.w}x${got.h}`,
    );

    const ref = path.join(dir, `${model}-ncnn.png`);
    const n = fs.existsSync(ncnn)
      ? run(ncnn, [
          "-i",
          input,
          "-o",
          ref,
          "-m",
          models,
          "-n",
          model,
          "-f",
          "png",
        ])
      : null;
    if (n && n.status === 0 && fs.existsSync(ref)) {
      const want = readPng(ref);
      const db =
        want.w === got.w && want.h === got.h ? psnr(got.rgb, want.rgb) : 0;
      check(`${model}: close to ncnn`, db >= 30, `${db.toFixed(1)} dB`);
    } else {
      console.log(`skip ${model}: no ncnn result to compare with`);
    }
  }

  // a scale that is not the model's own
  {
    const out = path.join(dir, "scale2.png");
    const r = run(coreml, [...base("upscayl-lite-4x", out), "-s", "2"]);
    const got = fs.existsSync(out) ? readPng(out) : { w: 0, h: 0 };
    check(
      "-s 2 resizes the result",
      r.status === 0 && got.w === W * 2 && got.h === H * 2,
      `${got.w}x${got.h}`,
    );
  }

  // requests it has to turn down: exit 3 and nothing on disk
  {
    const out = path.join(dir, "webp.webp");
    const r = run(coreml, [...base("upscayl-lite-4x", out), "-f", "webp"]);
    check(
      "webp output is turned down",
      r.status === 3 && !fs.existsSync(out),
      `exit ${r.status}`,
    );
  }
  {
    const out = path.join(dir, "nomodel.png");
    const r = run(coreml, base("no-such-model", out));
    check(
      "unknown model is turned down",
      r.status === 3 && !fs.existsSync(out),
      `exit ${r.status}`,
    );
  }

  // flags it does not use must not eat the next flag
  {
    const out = path.join(dir, "flags.png");
    const r = run(coreml, ["-t", "0", "-g", ...base("upscayl-lite-4x", out)]);
    check(
      "-t 0 and a bare -g are skipped",
      r.status === 0 && fs.existsSync(out),
      tail(r),
    );
  }

  // a picture that cannot fit in memory once upscaled gets a clear message and no crash
  {
    const huge = path.join(dir, "huge.png");
    const out = path.join(dir, "huge-out.png");
    writeHugeBlank(huge, 40000);
    const r = run(coreml, [
      "-i",
      huge,
      "-o",
      out,
      "-m",
      models,
      "-n",
      "upscayl-lite-4x",
      "--cache",
      cache,
    ]);
    check(
      "a picture too big for the memory is refused",
      r.stderr.includes("too big for this Mac") && !fs.existsSync(out),
      tail(r).slice(0, 80),
    );
  }

  // a folder: all of it, or if the engine steps aside, nothing written first
  {
    const src = path.join(dir, "folder-ok");
    const out = path.join(dir, "folder-ok-out");
    fs.mkdirSync(src);
    fs.mkdirSync(out);
    fs.copyFileSync(input, path.join(src, "a.png"));
    fs.copyFileSync(input, path.join(src, "b.png"));
    const r = run(coreml, [
      "-i",
      src,
      "-o",
      out,
      "-m",
      models,
      "-n",
      "upscayl-lite-4x",
      "--cache",
      cache,
    ]);
    const files = fs.readdirSync(out).sort().join(",");
    check(
      "folder: every picture is done",
      r.status === 0 && files === "a.png,b.png",
      files,
    );
  }
  {
    const src = path.join(dir, "folder-bad");
    const out = path.join(dir, "folder-bad-out");
    fs.mkdirSync(src);
    fs.mkdirSync(out);
    fs.copyFileSync(input, path.join(src, "a.png"));
    fs.writeFileSync(
      path.join(src, "z.webp"),
      Buffer.from("this is not a picture"),
    );
    const r = run(coreml, [
      "-i",
      src,
      "-o",
      out,
      "-m",
      models,
      "-n",
      "upscayl-lite-4x",
      "--cache",
      cache,
    ]);
    const left = fs.readdirSync(out);
    check(
      "folder with an unreadable webp: turned down before saving anything",
      r.status === 3 && left.length === 0,
      `exit ${r.status}, files: ${left.join(",") || "none"}`,
    );
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log("all good");
