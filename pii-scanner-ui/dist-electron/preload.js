"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    selectDirectory: () => electron_1.ipcRenderer.invoke('select-directory'),
});
//# sourceMappingURL=preload.js.map