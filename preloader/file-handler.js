const { ipcRenderer } = require('electron');
const { join } = require("path")
const { writeFileSync, readFileSync } = require("fs")

let save_path = '.';

async function initer() {
    const {downloads_path} = await ipcRenderer.invoke('os-settings');
    save_path = downloads_path;
}
initer();

async function saveFile(name, content) {
    const { canceled, filePath } = await ipcRenderer.invoke('show-save-dialog', {
        title: "Save Chat History",
        defaultPath: join(save_path, name)
    })

    if(canceled || !filePath) {
        return false;
    } else {
        writeFileSync(filePath, content, 'utf-8');
        return true;
    }
}

async function loadFile() {
    const { canceled, filePaths } = await ipcRenderer.invoke('show-open-dialog', {
        title: "Load Chat History",
        properties: ["openFile"]
    })

    if(canceled || !filePaths) {
        return null;
    } else {
        const content = readFileSync(filePaths[0], 'utf-8');
        return content;
    }
}

module.exports = {
    saveFile,
    loadFile
}