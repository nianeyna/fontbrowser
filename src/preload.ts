import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
    families: (): Promise<[string, Font[]][]> => ipcRenderer.invoke('font-families'),
    details: (fileName: string): Promise<FontDetails> => ipcRenderer.invoke('font-features', fileName),
    getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-store-value'),
    setSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('set-store-value', settings)
});
