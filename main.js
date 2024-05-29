const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // Add the line below to remove the menu bar
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('select-mod-file', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Minecraft Mods', extensions: ['jar'] }]
  });

  if (result.canceled) {
    event.sender.send('mod-installed', 'Mod installation canceled.');
    return;
  }

  const modFilePath = result.filePaths[0];
  const minecraftModsFolder = path.join(app.getPath('home'), '.minecraft', 'mods');

  if (!fs.existsSync(minecraftModsFolder)) {
    fs.mkdirSync(minecraftModsFolder, { recursive: true });
  }

  const fileName = path.basename(modFilePath);
  const destinationPath = path.join(minecraftModsFolder, fileName);

  fs.copyFile(modFilePath, destinationPath, (err) => {
    if (err) {
      event.sender.send('mod-installed', `Error installing mod: ${err.message}`);
    } else {
      event.sender.send('mod-installed', 'Mod installed successfully!');
    }
  });
});
