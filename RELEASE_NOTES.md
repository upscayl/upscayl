# Release Notes – Batch & Progress Improvements

## Overview

This release adds major improvements to the batch upscaling workflow: recursive folder handling, multi-folder queues, time and storage estimates, pause/resume, overwrite option, and a corrected stop behaviour. The Batch Progress dialog now shows the current folder, sub-folder (if any), and filename being processed, with a clearer layout and wider overlay.

---

## New Features

### 1. Recursive subfolders

- **Before:** Only image files in the top-level selected folder were processed.
- **Now:** When you select a folder, **all images in that folder and all subfolders** are included in the batch.
- Supported formats: PNG, JPG, JPEG, JFIF, WebP.
- A short hint in the UI explains that subfolders are included.

### 2. Preserved folder structure in output

- **Before:** All upscaled images were written into a single flat output folder.
- **Now:** The **same folder and subfolder structure** as the source is recreated in the output folder.
  - Example: `Source/Projects/2024/img.png` → `Output/Projects/2024/img_upscayl_2x_model.png`
- Target directories are created automatically with `mkdirSync(..., { recursive: true })`.
- Already existing output files are skipped (supports resume after pause).

### 3. Time and storage estimates in Batch Progress dialog

- **Estimated total time (all images):** Shows the approximate time to process the full batch (e.g. “Estimated total time (all 100 images): 2 h 30 min”).
- **Estimated time remaining:** Updates as images complete (e.g. “Estimated time remaining: 1 h 15 min”).
- **Estimated total storage (all images):** Shows the expected total size of all output files in MB or GB (e.g. “Estimated total storage (all 100 images): 1.25 GB”).
- Estimates are derived from the first processed image(s) and refined as the batch runs.
- Display uses “X of Y images remaining” for clarity.

### 4. Pause and resume batch

- A **Pause** button in the Batch Progress dialog pauses the batch after the current image.
- A **Resume** button continues from where it was paused.
- Pause/resume state is handled in the main process; the queue and progress are preserved.
- **Stop** still aborts the batch and closes the progress UI.

### 5. Multiple folders in batch queue

- **Before:** Only one folder could be selected per batch run.
- **Now:** You can **select multiple folders** in one go (e.g. via Ctrl/Cmd + click in the folder picker).
- Folders are processed **one after another** in the order they were selected.
- **Output layout for multiple folders:** Each source folder gets its own subfolder under the output path, named after the source folder (e.g. `Output/Photos/...`, `Output/Videos/...`), so outputs do not overwrite each other.
- The Batch Progress dialog shows **“Folder X of Y”** when more than one folder is in the queue.
- Folders that contain no supported images are skipped automatically.
- The main content area shows either “Selected folder” or “Selected folders (N)” and a scrollable list of paths.

### 6. Current folder, sub-folder, and file in progress dialog

- The Batch Progress overlay now shows **which folder and which file** are currently being processed.
- **Current folder:** Name of the source folder being processed.
- **Sub-folder:** Shown only when the current image lies in a subfolder (e.g. `Holiday/2024`); hidden when the file is in the root of the selected folder.
- **Current file:** Only the **filename** is shown (e.g. `image.png`), not the full path.
- Labels (Folder, Sub-folder, Current file) are **bold** and displayed in a two-column layout with a subtle box for better readability.
- Long paths are truncated with a tooltip showing the full path.

### 7. Overwrite option for batch

- A batch run can optionally **overwrite existing output files** instead of skipping them.
- When the option is disabled (default), already existing upscaled files are skipped (useful for resuming or re-runs).
- When enabled, every image is processed and existing files with the same name are overwritten.

### 8. Progress dialog layout

- The Batch Progress overlay is **wider** (minimum width 420px, max 90% of viewport) so that folder and file names fit better.
- Slightly increased padding for a clearer layout.

---

## Bug fixes

### Stop button and Batch Progress dialog

- **Before:** Clicking **Stop** in the Batch Progress dialog did not always close the dialog; sometimes the app behaved as if the batch had finished successfully.
- **Now:** When the user stops the batch (including when stopping between folders or between images), the main process sends **BATCH_STOPPED** and the dialog closes correctly. Completion logic and **FOLDER_UPSCAYL_DONE** are only used when the batch actually finishes without being stopped.

---

## Technical summary

| Area | Change |
|------|--------|
| **Electron – folder selection** | `showOpenDialog` uses `multiSelections`; handler returns `string[]` (or `null` if cancelled). |
| **Electron – batch command** | Payload uses `batchFolderPaths: string[]`. Batch loop runs over folders, then over images per folder. |
| **Electron – progress** | `BATCH_PROGRESS` includes `folderIndex`, `folderTotal`, `currentFolderName`, `currentFileRelativePath`, `estimatedTotalTimeMs`, and existing ETA/size fields. |
| **Electron – pause/resume** | `batchPaused` and `batchPauseResolve` in config; IPC handlers and commands for **BATCH_PAUSE** / **BATCH_RESUME**. |
| **Renderer – state** | Single `batchFolderPath` replaced by `batchFolderPaths: string[]` where needed. |
| **Renderer – UI** | Batch Progress shows current folder, sub-folder (if any), current filename, folder progress, total/remaining time, total storage; Pause/Resume and Stop buttons; wider overlay with bold labels. |
| **Locales** | New/updated keys for batch progress, folder list, and multi-folder labels in all locale files. |

---

## Translations

New or updated translation keys (examples in English):

- `APP.PROGRESS_BAR.PAUSE_BUTTON_TITLE` – “PAUSE”
- `APP.PROGRESS_BAR.RESUME_BUTTON_TITLE` – “RESUME”
- `APP.PROGRESS_BAR.REMAINING_IMAGES` – “{remaining} of {total} images remaining”
- `APP.PROGRESS_BAR.ESTIMATED_TIME_REMAINING` – “Estimated time remaining: {time}”
- `APP.PROGRESS_BAR.ESTIMATED_TOTAL_TIME` – “Estimated total time (all {total} images): {time}”
- `APP.PROGRESS_BAR.ESTIMATED_STORAGE` – “Estimated total storage (all {total} images): {size}”
- `APP.PROGRESS_BAR.FOLDER_PROGRESS` – “Folder {current} of {total}”
- `APP.PROGRESS_BAR.CURRENT_FOLDER` – “Current folder:”
- `APP.PROGRESS_BAR.SUB_FOLDER` – “Sub-folder:”
- `APP.PROGRESS_BAR.CURRENT_FILE` – “Current file:”
- `APP.RIGHT_PANE_INFO.SELECT_FOLDER_SUBFOLDERS_HINT` – “All subfolders will be included.”
- `APP.PROGRESS.BATCH.SELECTED_FOLDERS_TITLE` – “Selected folders:”

All PROGRESS_BAR keys above are fully translated in every supported locale (ar, ca-val, de, es, fr, hu, id, it, ja, ms, pl, pt-br, pt, ru, th, tr, uk, vi, zh). Placeholders `{remaining}`, `{total}`, `{time}`, `{size}`, and `{current}` are preserved in all languages for correct display in the progress bar and folder/file labels.

---

*These release notes describe the batch and progress improvements implemented in this version.*
