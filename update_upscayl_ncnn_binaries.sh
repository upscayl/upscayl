#!/bin/bash

# Step 1: Fetch JSON from GitHub API and get assets_url
assets_url=$(curl -s https://api.github.com/repos/upscayl/upscayl-ncnn/releases/latest | jq -r '.assets_url')

# Step 2: Loop through each asset and download the files
curl -s $assets_url | jq -r '.[] | .browser_download_url' | while read -r download_url; do
    filename=$(basename $download_url)
    echo "Downloading $filename..."
    curl -LO $download_url
done

# Step 3: Extract downloaded ZIP files to a specific folder
mkdir -p extracted_files
for file in *.zip; do
    echo "Extracting $file..."
    unzip -q $file -d extracted_files
done

# Step 4: Move files to respective folders
for folder in extracted_files/upscayl-bin-*; do
	if [[ -d $folder ]]; then
		platform=$(echo "extracted_files/$folder" | cut -d '-' -f 5)
		echo "Moving files in $folder to $platform folder..."
		if [[ "$platform" == "linux" ]]; then
			cp "$folder"/upscayl-bin resources/linux/bin/upscayl-bin
		elif [[ "$platform" == "macos" ]]; then
			cp "$folder"/upscayl-bin resources/mac/bin/upscayl-bin
		elif [[ "$platform" == "windows" ]]; then
			cp "$folder"/upscayl-bin.exe resources/win/bin/upscayl-bin.exe
			cp "$folder"/vcomp140.dll resources/win/bin/vcomp140.dll
			cp "$folder"/vcomp140d.dll resources/win/bin/vcomp140d.dll
		fi
	fi
done

echo "All files moved to their respective folders successfully."

# Step 5: Clean up extracted_files folder and downloaded ZIP files
rm -rf extracted_files
rm -f *.zip

echo "Script executed successfully."