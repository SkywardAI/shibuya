// eslint-disable-next-line
const { app, Menu, BrowserWindow, ipcMain } = require('electron');
// eslint-disable-next-line
const path = require('path');

app.commandLine.appendSwitch('enable-features','SharedArrayBuffer')

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        height: 600,
        width: 900,
        minWidth: 560,
        minHeight: 250,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preloader', 'index.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    })

    if(app.isPackaged) {
        // eslint-disable-next-line
        win.loadFile(path.join(__dirname, 'dist/index.html'))
        Menu.setApplicationMenu(null);
    } else {
        win.loadURL("http://localhost:3000");
    }

    async function start() {
        await Promise.all([
            new Promise(r=>ipcMain.on('preload-complete', r)),
            new Promise(r=>win.once("ready-to-show", r))
        ])
        win.show();
    }

    start()

    // win.once("ready-to-show", ()=>{
    //     win.show();
    // })
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
