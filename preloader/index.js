const { contextBridge, ipcRenderer } = require('electron')
const {
    loadModel,
    reloadSession,
    clearHistory,
    chatCompletions,
    abortCompletion
} = require("./node-llama-cpp-preloader.js")

contextBridge.exposeInMainWorld('node-llama-cpp', {
    loadModel, reloadSession, chatCompletions, clearHistory, abortCompletion
})

ipcRenderer.send('preload-complete')