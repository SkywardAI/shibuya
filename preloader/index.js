const { contextBridge } = require('electron')
const {
    loadModel,
    chatCompletions,
    abortCompletion,
    setClient, 
    downloadModel,
    updateModelSettings,
    formator, deleteModel
} = require("./node-llama-cpp-preloader.js")

const {
    loadFile, saveFile
} = require("./file-handler.js")

contextBridge.exposeInMainWorld('node-llama-cpp', {
    loadModel, chatCompletions, updateModelSettings,
    abortCompletion, setClient, downloadModel, formator,
    deleteModel
})

contextBridge.exposeInMainWorld('file-handler', {
    loadFile, saveFile
})