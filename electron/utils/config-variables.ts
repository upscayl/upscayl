import { ChildProcessWithoutNullStreams } from "child_process";

export let imagePath: string | undefined = "";
export let folderPath: string | undefined = undefined;
export let customModelsFolderPath: string | undefined = undefined;
export let outputFolderPath: string | undefined = undefined;
export let saveOutputFolder = false;
export let quality = 0;
export let overwrite = false;
export let stopped = false;
export let childProcesses: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}[] = [];

console.log({
  imagePath,
  folderPath,
  customModelsFolderPath,
  outputFolderPath,
  saveOutputFolder,
  quality,
  overwrite,
  stopped,
  childProcesses,
});

export function setImagePath(value: string | undefined): void {
  imagePath = value;
}

export function setFolderPath(value: string | undefined): void {
  folderPath = value;
}

export function setCustomModelsFolderPath(value: string | undefined): void {
  customModelsFolderPath = value;
}

// SETTERS
export function setOutputFolderPath(value: string | undefined): void {
  outputFolderPath = value;
}

export function setSaveOutputFolder(value: boolean): void {
  saveOutputFolder = value;
}

export function setQuality(value: number): void {
  quality = value;
}

export function setOverwrite(value: boolean): void {
  overwrite = value;
}

export function setStopped(value: boolean): void {
  stopped = value;
}

export function setChildProcesses(value: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}): void {
  childProcesses.push(value);
}
