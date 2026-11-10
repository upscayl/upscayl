# upscayl-coreml

A small command line engine for Apple Silicon Macs. It takes the same arguments as `upscayl-bin` and runs the
same ncnn models through Core ML, on the GPU and the Neural Engine at the same time.

The app starts it before `upscayl-bin`. If it can't handle a request (a layer or an option it doesn't know,
WebP output, a file it can't decode) it exits with status 3 before writing anything, prints a line starting with
`coreml-fallback:` and the app runs `upscayl-bin` with the same arguments instead.

## Usage

```
upscayl-coreml -i <image|folder> -o <image|folder> -m <models folder> -n <model>
               [-s scale] [-w width] [-f png|jpg] [-c compression] [-x]
               [--cache <folder>] [--units hybrid|gpu|ane]
```

| flag | meaning |
| --- | --- |
| `-i`, `-o` | input and output, a picture or a folder (the output folder must exist) |
| `-m`, `-n` | folder with the models and the model name, without extension |
| `-s`, `-w` | resize the 4x result to a scale or to a width |
| `-f`, `-c` | `png` or `jpg`, and the JPEG compression (0-100) |
| `-x` | test time augmentation: every tile runs through the model in all eight orientations |
| `--cache` | where the converted models are kept (default `~/Library/Caches/Upscayl/coreml`) |
| `--units` | `hybrid` (GPU and Neural Engine, default), `gpu` or `ane` |

`-t`, `-g` and the other ncnn flags are accepted and ignored.

Progress and errors go to stderr in the same format `upscayl-bin` uses, the app parses them the same way.

## How it works

1. `NCNNModel` reads the `.param` and `.bin` files.
2. `ModelConverter` turns the graph into a Core ML neural network (fp16 weights, 256 px tiles) and
   `ModelCache` compiles it once and keeps it. Nothing is shipped twice, the models stay ncnn files.
3. `TileUpscaler` cuts the picture into tiles with a 16 px overlap. One thread per compute unit takes tiles
   from a shared `TileQueue`, so the faster unit simply does more of them. If the Neural Engine refuses a tile
   while running, it goes back to the queue for the GPU.
4. `ImageWriter` saves the result through a temporary file, so a stopped run never leaves a broken picture.

Layers the converter knows: `Convolution` (3x3, stride 1, with ReLU or leaky ReLU), `ReLU`, `PReLU`, `Concat`
(channels), `Eltwise` sum, `BinaryOp` add and scalar add or multiply, `Interp` (nearest, whole factors) and
`PixelShuffle`. That covers every model in `resources/models`. Anything else makes the engine fall back.

Differences from ncnn that are on purpose: the tile size is fixed (`-t` is ignored), the picture keeps its own
RGB profile, the alpha channel is stretched by CoreGraphics and not by the model, JPEG quality is
`100 - compression`.

## Building and testing

From the repository root:

```
npm run build:coreml    # writes resources/mac/bin/upscayl-coreml
npm run test:coreml     # unit tests, including a conversion of every bundled model
```

`npm run build` and `npm run dev` call the first one. It needs the Xcode command line tools. Without them it
prints a warning and the app simply uses ncnn.

If you change what `ModelConverter` writes, bump `version` in `ModelCache`, otherwise old converted models
stay in the cache.
