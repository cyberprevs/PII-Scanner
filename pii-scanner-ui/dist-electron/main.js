"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
let mainWindow = null;
let apiProcess = null;
const API_PORT = 5000;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, '../public/icon.png'),
        title: 'PII Scanner',
        autoHideMenuBar: true,
    });
    // En développement, charger depuis Vite
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
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
        apiProcess = (0, child_process_1.spawn)(apiPath, ['--urls', `http://localhost:${API_PORT}`], {
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
            electron_1.dialog.showErrorBox('Erreur de démarrage', `Impossible de démarrer l'API: ${err.message}`);
        });
    }
    catch (error) {
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
electron_1.ipcMain.handle('select-directory', async () => {
    if (!mainWindow)
        return null;
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    });
    if (result.canceled) {
        return null;
    }
    return result.filePaths[0];
});
// Démarrer l'application
electron_1.app.whenReady().then(() => {
    // Ne démarrer l'API que si la variable SKIP_API_START n'est pas définie
    if (!process.env.SKIP_API_START) {
        startApiServer();
    }
    else {
        console.log('API start skipped (SKIP_API_START is set)');
    }
    // Attendre un peu que l'API démarre
    setTimeout(() => {
        createWindow();
    }, 2000);
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    stopApiServer();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    stopApiServer();
});
//# sourceMappingURL=main.js.map