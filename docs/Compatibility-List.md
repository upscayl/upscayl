# Upscayl Compatibility

### HELP US EXTEND THIS LIST BY SUBMITTING SUGGESTIONS IN THE [ISSUES TAB](https://github.com/upscayl/upscayl/issues)🙏🏻

## Operating System
- Ubuntu 20.04+
- Windows 10+
- macOS 12+
  - In the next release, we will add back macOS 11 support.

## GPU

Generally, Vulkan 1.3 conformance is required. This means, GPUs of the following architectures: 
- Intel [Gen9](https://en.wikipedia.org/wiki/List_of_Intel_graphics_processing_units#Gen9) - Skylake (mostly 6th gen) on Windows, and Kaby Lake (mostly 7th gen) on Linux, or newer
- NVidia Maxwell (mostly 9xx series) or newer 
- AMD GCN4.0 (mostly Polaris and Arctic Islands/RX 4xx and RX 5xx series) or newer
  
  If you are unsure of your GPU's architecture, you can use [Techpowerup's GPU database](https://www.techpowerup.com/gpu-specs/) to search your model, and confirm what architecture it uses, and the Vulkan conformance.

Working integrated GPUs:
- Intel HD Graphics 620 (credit: [@Axe7bravo](https://github.com/upscayl/upscayl/issues/382))
- Intel Iris Graphics (credit: [@arrhoegs](https://github.com/orgs/upscayl/discussions/571))
- Most AMD Vega GPUs (credit: [@Yaki-0](https://github.com/upscayl/upscayl/issues/448) for Vega 8 Mobile, [@CloakTheLurker](https://github.com/upscayl/upscayl/issues/436) for Vega 10)

All dedicated GPUs are assumed to work, except for the following that have been reported to be not working:
- GTX 7xx series (mostly Kepler chips)
- GT 920M ? (see [comment](https://github.com/upscayl/upscayl/issues/401#issuecomment-1659604580), it's a Kepler chip, despite the model number being on the 900's instead of 700's)
