import { ipcRenderer, contextBridge, webUtils } from "electron";
import {
  getAppVersion,
  getDeviceSpecs,
  getPlatform,
} from "./utils/get-device-specs";
import { ELECTRON_COMMANDS as C } from "../common/electron-commands";

// The page can only use the channels listed here. Whatever is not on a list is refused, so a page that is
// not ours can't reach the handlers of the main process. When a channel is added to electron/index.ts or
// sent to the page, add it here too.
const SEND = new Set<string>([
  C.STOP,
  C.OPEN_FOLDER,
  C.GET_MODELS_LIST,
  C.UPSCAYL,
  C.FOLDER_UPSCAYL,
  C.DOUBLE_UPSCAYL,
  C.PASTE_IMAGE,
  C.REMOVE_BACKGROUND,
  C.REMOVE_BACKGROUND_STOP,
  C.ONBOARDING_COMPLETE,
  C.QUIT_APP,
  C.SET_VIBRANCY,
  C.GET_IMAGE_PATHS,
]);

const INVOKE = new Set<string>([
  C.SELECT_FILE,
  C.SELECT_FOLDER,
  C.SELECT_CUSTOM_MODEL_FOLDER,
  C.GET_DROPPED_PATH_TYPE,
  C.GET_FILE_SIZE,
  C.EXPORT_REMOVE_BACKGROUND,
  "get-gpu-info",
  "get-app-version",
]);

const ON = new Set<string>([
  C.UPSCAYL_DONE,
  C.UPSCAYL_PROGRESS,
  C.UPSCAYL_WARNING,
  C.UPSCAYL_ERROR,
  C.DOUBLE_UPSCAYL_DONE,
  C.DOUBLE_UPSCAYL_PROGRESS,
  C.FOLDER_UPSCAYL_DONE,
  C.FOLDER_UPSCAYL_PROGRESS,
  C.CUSTOM_MODEL_FILES_LIST,
  C.IMAGE_FILES_LIST,
  C.SCALING_AND_CONVERTING,
  C.METADATA_ERROR,
  C.PASTE_IMAGE_SAVE_SUCCESS,
  C.PASTE_IMAGE_SAVE_ERROR,
  C.REMOVE_BACKGROUND_PROGRESS,
  C.REMOVE_BACKGROUND_DONE,
  C.REMOVE_BACKGROUND_ERROR,
  C.LOG,
  C.OS,
]);

const refuse = (kind: string, command: string): never => {
  throw new Error(`IPC ${kind} on "${command}" is not allowed`);
};

type Listener = (...args: any) => any;

// the page's callbacks and the listeners we registered for them, so off() can take the right one away
const registered = new Map<Listener, Map<string, Listener>>();

contextBridge.exposeInMainWorld("electron", {
  send: (command: string, payload?: any) => {
    if (!SEND.has(command)) refuse("send", command);
    ipcRenderer.send(command, payload);
  },
  // the page gets an empty object in place of the IPC event, nothing of the event itself
  on: (command: string, func: Listener) => {
    if (!ON.has(command)) refuse("on", command);
    const listener: Listener = (_event, ...args) => func({}, ...args);
    ipcRenderer.on(command, listener);

    const byCommand = registered.get(func) ?? new Map<string, Listener>();
    byCommand.set(command, listener);
    registered.set(func, byCommand);

    return () => {
      ipcRenderer.removeListener(command, listener);
    };
  },
  off: (command: string, func: Listener) => {
    const listener = registered.get(func)?.get(command);
    if (listener) ipcRenderer.removeListener(command, listener);
  },
  invoke: (command: string, payload?: any) => {
    if (!INVOKE.has(command)) refuse("invoke", command);
    return ipcRenderer.invoke(command, payload);
  },
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  platform: getPlatform(),
  getSystemInfo: async () => await getDeviceSpecs(),
  getAppVersion: async () => await getAppVersion(),
});
