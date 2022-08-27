<div align="center">

<a href="https://github.com/upscayl/upscayl/releases/latest">

![New Project (33)](https://user-images.githubusercontent.com/25067102/187029713-6ab7b395-3c10-4f20-882b-0891d1bd1b16.jpg)
</a>

# Upscayl 🆙

#### Free and Open Source AI Image Upscaler

https://user-images.githubusercontent.com/25067102/186332548-0d53f02f-d159-4804-8b0e-887d96651fdb.mp4

**Upscayl is a cross-platform application built with the Linux-first philosophy. This means that we prioritize Linux builds over others but that doesn't mean we'll break things for other OSes :)**

### NOTE: Upscayl does not work without a GPU, sorry. You'll need a Vulkan compatible GPU to upscale images.

</div>

# Installation 👨‍💻

## Linux 🐧👑

1. Go to [releases section](https://github.com/TGS963/upscayl/releases/latest)

2. Download the `.AppImage` file.

3. Right Click AppImage -> Go to Permissions tab -> Check allow file to execute and then double click the file to run Upscayl.

You can also download the flatpak version and double click the flatpak file to install via Store but wait for the full release, we'll be pushing it to Flathub for easy access.

## MacOS 🍎

1. Go to [releases section](https://github.com/TGS963/upscayl/releases/latest)

2. Download the `.dmg` file.

3. Double click dmg, drag Upscayl icon into Applications folder, profit.

## Windows 🐌

1. Go to [releases section](https://github.com/TGS963/upscayl/releases/latest)

2. Download the `.exe` file.

3. Double click exe file, wait for installation, profit.

# Roadmap 🤫

- Allow video upscaling
- 2x, 3x upscaling modes
- More models
- Make the whole world use FOSS

# Comparisons:

![image](https://user-images.githubusercontent.com/25067102/187038206-25d54228-ee95-4167-bda0-5c71259a459e.png)


# Development 🛠

```
git clone https://github.com/TGS963/upscayl
cd upscayl

# INSTALL DEPENDENCIES
npm install

# RUN THE DEVELOPMENT SERVER LOCALLY
npm run start

# PACKAGE THE APP
npm run dist

# PUBLISH THE APP, MAKE SURE TO ADD GH_TOKEN= IN SHELL
npm run publish-app
```

# FAQ 🤓

- How does Upscayl work?
  - Upscayl uses AI models to enhance your images by guessing what the details could be. It uses Real-ESRGAN (and more in the future) model to achieve this.
- Is there a CLI available?
  - The CLI tool is called real-esrgan-ncnn-vulkan and it's available on the Real-ESRGAN repository.
- Do I need a GPU for this to work?
  - Yes, unfortunately. NCNN Vulkan requires a Vulkan compatible GPU. Upscayl won't work on iGPU or CPU.
- How can I contribute?
  - You can donate more NCNN compatible models or fix code by submitting PRs :)
- You are not fully open source!!😡
  - We are, we're using completely free and open source tech. We do ship a binary but that's because not including it would kill the entire purpose of the project. If you want to deal with all those PyTorch, NCNN, and Python errors, you're more than welcome to compile your own binary using the code provided by Real-ESRGAN. The binary is pre-compiled for convenience, if you do not trust it, then you can compile your own since everything is free and open source here :)

Upscayl uses Real-ESRGAN-ncnn-vulkan binaries to upscale images. More models and algorithms will come soon.

# Credits ❤

- Real-ESRGAN for their wonderful research work.\
[Real-ESRGAN: Copyright (c) 2021, Xintao Wang](https://github.com/xinntao/Real-ESRGAN/)

- Microsoft™ for their Fluent Emoji used as our logo.

#

<div align="center">

Copyright © 2022 - **Upscayl**\
By Nayam Amarshe and TGS963\
Made with 🖱 & ⌨

</div>
