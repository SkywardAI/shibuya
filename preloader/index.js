const { contextBridge } = require('electron')
const {
    loadModel,
    clearHistory,
    chatCompletions,
    abortCompletion,
    setClient
} = require("./node-llama-cpp-preloader.js")

contextBridge.exposeInMainWorld('node-llama-cpp', {
    loadModel, chatCompletions, clearHistory, abortCompletion, setClient
})