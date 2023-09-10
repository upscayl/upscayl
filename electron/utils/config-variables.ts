import { ChildProcessWithoutNullStreams } from "child_process";

let _imagePath: string | undefined = undefined;
let _folderPath: string | undefined = undefined;
let _customModelsFolderPath: string | undefined = undefined;
let _outputFolderPath: string | undefined = undefined;
let _saveOutputFolder = false;
let _quality = 0;
let _overwrite = false;
let _stop = false;
let childProcesses: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}[] = [];

// GETTERS
export function getImagePath(): string | undefined {
  return _imagePath;
}

export function setImagePath(value: string | undefined): void {
  _imagePath = value;
}

export function getFolderPath(): string | undefined {
  return _folderPath;
}

export function setFolderPath(value: string | undefined): void {
  _folderPath = value;
}

export function getCustomModelsFolderPath(): string | undefined {
  return _customModelsFolderPath;
}

export function setCustomModelsFolderPath(value: string | undefined): void {
  _customModelsFolderPath = value;
}

export function getOutputFolderPath(): string | undefined {
  return _outputFolderPath;
}

export function getStop(): boolean {
  return _stop;
}

export function getChildProcesses(): {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}[] {
  return childProcesses;
}

// SETTERS
export function setOutputFolderPath(value: string | undefined): void {
  _outputFolderPath = value;
}

export function getSaveOutputFolder(): boolean {
  return _saveOutputFolder;
}

export function setSaveOutputFolder(value: boolean): void {
  _saveOutputFolder = value;
}

export function getQuality(): number {
  return _quality;
}

export function setQuality(value: number): void {
  _quality = value;
}

export function getOverwrite(): boolean {
  return _overwrite;
}

export function setOverwrite(value: boolean): void {
  _overwrite = value;
}

export function setStop(value: boolean): void {
  _stop = value;
}

export function setChildProcesses(value: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}): void {
  childProcesses.push(value);
}
