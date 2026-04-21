const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('susu', {
  openMenu: () => ipcRenderer.send('buddy:open-menu'),
  dragMove: (dx, dy) => ipcRenderer.send('buddy:drag-move', { dx, dy }),
  closeWindow: () => ipcRenderer.send('window:close'),
  addNote: (text, tags) => ipcRenderer.invoke('archive:add-note', { text, tags }),
  listArchive: () => ipcRenderer.invoke('archive:list'),
});
