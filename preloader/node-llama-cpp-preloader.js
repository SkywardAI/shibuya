// const { fileURLToPath } = require("url")
const path = require("path")
// const { getLlama, LlamaChatSession } = require("node-llama-cpp")

let getLlama, LlamaChatSession;

async function importer() {
    const nodeLlamaCpp = await import('node-llama-cpp')
    getLlama = nodeLlamaCpp.getLlama;
    LlamaChatSession = nodeLlamaCpp.LlamaChatSession;
}
importer();

const model_path = path.join(__dirname, '..', 'models')
// const model_path = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'models')

let llama_session, context, stop_signal;

/**
 * Load a model and init the llama session
 * @param {String} model_name the model name to load, saved in /models folder
 */
async function loadModel(model_name = '') {
    const llama = await getLlama()
    const model = await llama.loadModel({
        modelPath: path.join(model_path, model_name)
    })

    context = await model.createContext();
    await reloadSession();
}

/**
 * Reload the llama session
 * @returns {Promise<boolean>} If model not loaded, resolves false, otherwise resolves true. 
 */
async function reloadSession() {
    if(!context) return false;
    llama_session = new LlamaChatSession({
        contextSequence: context.getSequence()
    })
    return true;
}

/**
 * Reset the chat history
 * @returns {Boolean} If the session is not initiated, return false, otherwise returns true.
 */
function clearHistory() {
    if(llama_session) return false;
    llama_session.resetChatHistory();
    return true;
}

/**
 * extract message from given message object
 * @param {any} message The latest user message, either string or any can be converted to string. If is array in the format of {content:String}, it will retrieve the last content
 * @returns {String} the retrived message
 */
function findMessageText(message) {
    if(typeof message === "string") return message;
    else if(typeof message === "object") {
        if(Array.isArray(message)) {
            message = message.pop();
            if(typeof message === 'object' && message.content) {
                return message.content;
            }
        }
    }
    return `${message}`
}

/**
 * @callback CallbackFunction
 * @param {String} content The content to callback
 * @param {Boolean} is_finished Whether the response has finished
 */

/**
 * Inference with LLM model, automatically continue on the history conversation, if want to reset conversation please call `clearHistory()`
 * @param {String|any} latest_message The latest user message, either string or any can be converted to string. If is array in the format of {content:String}, it will retrieve the last content
 * @param {Function?} cb Callback function
 * @returns {Promise<String>} the response text
 */
async function chatCompletions(latest_message, cb=null) {
    if(!llama_session) await loadModel();
    latest_message = findMessageText(latest_message);

    stop_signal = new AbortController();
    const options = {
        signal: stop_signal.signal,
        stopOnAbortSignal: true
    }
    let resp_text = ''
    if(cb) options.onTextChunk = chunk => {
        resp_text += chunk;
        cb(resp_text, false);
    }

    const response = await llama_session.prompt(latest_message, options);
    cb && cb(response, true);
    stop_signal = null;
    return response;
}

/**
 * Abort the completion
 */
function abortCompletion() {
    stop_signal && stop_signal.abort();
}

module.exports = {
    loadModel,
    reloadSession,
    clearHistory,
    chatCompletions,
    abortCompletion
}