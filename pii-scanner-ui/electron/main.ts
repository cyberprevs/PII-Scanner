import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let apiProcess: ChildProcessWithoutNullStreams | null = null;

const API_PORT = 5000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'PII Scanner',
    autoHideMenuBar: true,
  });

  // En développement, charger depuis Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En production, charger le build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startApiServer() {
  // Chercher le chemin de l'API
  const apiPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../PiiScanner.Api/bin/Debug/net8.0/PiiScanner.Api.exe')
    : path.join(process.resourcesPath, 'api/PiiScanner.Api.exe');

  console.log('Démarrage de l\'API depuis:', apiPath);

  try {
    apiProcess = spawn(apiPath, ['--urls', `http://localhost:${API_PORT}`], {
      cwd: path.dirname(apiPath),
    });

    apiProcess.stdout?.on('data', (data) => {
      console.log(`[API] ${data.toString()}`);
    });

    apiProcess.stderr?.on('data', (data) => {
      console.error(`[API Error] ${data.toString()}`);
    });

    apiProcess.on('close', (code) => {
      console.log(`API process exited with code ${code}`);
      apiProcess = null;
    });

    apiProcess.on('error', (err) => {
      console.error('Failed to start API:', err);
      dialog.showErrorBox(
        'Erreur de démarrage',
        `Impossible de démarrer l'API: ${err.message}`
      );
    });
  } catch (error) {
    console.error('Error starting API:', error);
  }
}

function stopApiServer() {
  if (apiProcess) {
    apiProcess.kill();
    apiProcess = null;
  }
}

// Gestionnaire IPC pour sélectionner un dossier
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

// Démarrer l'application
app.whenReady().then(() => {
  startApiServer();

  // Attendre un peu que l'API démarre
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopApiServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopApiServer();
});
