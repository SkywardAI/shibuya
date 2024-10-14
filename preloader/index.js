const { contextBridge } = require('electron')
const {
    loadModel,
    chatCompletions,
    abortCompletion,
    setClient, 
    downloadModel,
    updateModelSettings
} = require("./node-llama-cpp-preloader.js")

contextBridge.exposeInMainWorld('node-llama-cpp', {
    loadModel, chatCompletions, updateModelSettings,
    abortCompletion, setClient, downloadModel
})