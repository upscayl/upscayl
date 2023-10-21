#!/bin/bash


# Step 1: Download all the zip files from the GitHub releases page
curl -s https://api.github.com/repos/upscayl/upscayl-ncnn/releases/latest | grep "realesrgan-ncnn-vulkan" | cut -d : -f 2,3 | tr -d \" | wget -qi - > /dev/null 2>&1

# Get the latest version number
VERSION=curl -s https://api.github.com/repos/upscayl/upscayl-ncnn/releases/latest | jq -r ".tag_name"
echo "Latest version: $VERSION"

# Step 2: Extract the required zip files to their respective directories
unzip -j ./realesrgan-ncnn-vulkan-$VERSION-ubuntu.zip -d resources/linux/bin
# unzip realesrgan-ncnn-vulkan-$VERSION-macos.zip -d resources/macos/bin
# unzip realesrgan-ncnn-vulkan-$VERSION-windows.zip -d resources/windows/bin

# Step 4: Clean up the zip files
# rm *.zip

echo "Script executed successfully."