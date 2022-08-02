// Native
import { join } from 'path'
import { format } from 'url'

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
const { dialog } = require('electron')

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: join(__dirname, 'preload.js'),
    },
  })

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      })

  mainWindow.loadURL(url)
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

// listen the channel `file` and resend the received message to the renderer process
ipcMain.on('file', async (event: IpcMainEvent) => {
  const {canceled, filePaths} = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
  if (canceled) {
    console.log('operation cancelled')
    setTimeout(() => event.sender.send('filename', 'operation cancelled'), 500)
  }
  else {
    console.log(filePaths[0])
    setTimeout(() => event.sender.send('filename', filePaths[0]), 500)
  }
  
})
