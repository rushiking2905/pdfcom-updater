const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log'); // ✅ Added logger

// ✅ Configure logging for autoUpdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'PDF Scroller',
    icon: path.join(__dirname, 'assets', 'logo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    win.show();
  });

  // ✅ Check for updates after window is loaded
  win.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// ✅ Show update available dialog
autoUpdater.on('update-available', () => {
  log.info('Update available');
});

// ✅ Show update downloaded and ask to restart
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart the app to install it now?',
    buttons: ['Restart', 'Later']
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
