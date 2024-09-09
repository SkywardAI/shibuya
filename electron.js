import { app, BrowserWindow } from 'electron';

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        height: 600,
        width: 900,
        minWidth: 560,
        minHeight: 250,
        autoHideMenuBar: true
    })

    win.loadURL("http://localhost:3000");
    win.once("ready-to-show", ()=>{
        win.show();
    })
}

app.whenReady().then(() => {
    createWindow();

    app.on('window-all-closed', () => {
        // eslint-disable-next-line
        process.platform !== 'darwin' && app.quit()
    });

    app.on('activate', () => {
        BrowserWindow.getAllWindows().length === 0 && createWindow()
    })
})
