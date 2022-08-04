import { exportedForTests } from '_main/main';
import { BrowserWindow } from 'electron';

jest.mock('electron', () => ({
  app: {
    on: jest.fn(),
    whenReady: jest.fn(() => Promise.resolve()),
  },
  ipcMain: { on: jest.fn() },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadFile: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
  })),
}));

test('Private props exported for unit tests', () => {
  expect(exportedForTests).toBeDefined();
});

test('func createWindow()', () => {
  const { createWindow } = exportedForTests!;

  createWindow();
  expect(BrowserWindow).toHaveBeenCalledTimes(1);
});
