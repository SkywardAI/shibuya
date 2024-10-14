const { createWriteStream } = require("fs");
const path = require("path");

let llama, getLlama, LlamaChatSession, current_model;

async function importer() {
    const nodeLlamaCpp = await import('node-llama-cpp')
    getLlama = nodeLlamaCpp.getLlama;
    LlamaChatSession = nodeLlamaCpp.LlamaChatSession;
}
importer();

const model_path = path.join(__dirname, '..', 'models')
// const model_path = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'models')

let llama_session, stop_signal;

/**
 * Load a model and init the llama session
 * @param {String} model_name the model name to load, saved in /models folder
 */
async function loadModel(model_name = '') {
    if(!model_name || current_model === model_name) return;
    current_model = model_name;

    if(llama) await llama.dispose();

    llama = await getLlama()
    const model = await llama.loadModel({
        modelPath: path.join(model_path, model_name)
    })

    const context = await model.createContext();
    llama_session = new LlamaChatSession({
        contextSequence: context.getSequence()
    })
}

/**
 * Set the session, basically reset the history and return a static string 'fake-client'
 * @param {String} client a fake client, everything using the same client and switch between clients just simply reset the chat history
 * @returns {String}
 */
async function setClient(client, history = []) {
    client;
    llama_session.resetChatHistory();
    if(history.length) {
        llama_session.setChatHistory(history.map(({role, content})=>{
            const is_assistant = role === 'assistant'
            return {
                type: is_assistant ? 'model' : role,
                [is_assistant ? "response" : "text"]: is_assistant ? [content] : content
            }
        }))
    }

    return 'fake-client';
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

let model_settings = {};
function updateModelSettings(settings) {
    model_settings = settings;
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

    const {max_tokens, top_p, temperature} = model_settings;

    stop_signal = new AbortController();
    const options = {
        signal: stop_signal.signal,
        stopOnAbortSignal: true,
        maxTokens: max_tokens,
        topP: top_p,
        temperature
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


/**
 * @callback DownloadProgressCallback
 * @param {Number} progress The download progress in percentage
 * @param {Boolean} is_finished Indicates whether the download is finished
 */

/**
 * @typedef ModelInfo
 * @property {String} model_name name of model
 * @property {String} url url of the model
 * @property {Number?} size Size in bytes if the size information provided in Content-Length header, undefined otherwise
 * @property {Number} finish_time Timestamp finished download
 */

/**
 * Downloads the given model to /models, if error with connection, resolves false, otherwise resolves true.
 * @param {String} url URL of the model to be downloaded, model name would be the last part of url.
 * @param {DownloadProgressCallback} cb callback function
 * @returns {Promise<ModelInfo?>}
 */
function downloadModel(url, cb=null) {
    return new Promise(resolve=>{
        (async function() {
            const model_name = url.split('/').pop();
        
            const download_req = await fetch(url);
            if(!download_req.ok) {
                console.error(download_req.statusText)
                resolve(null);
                return;
            }
        
            let total_size = download_req.headers.get('Content-Length')
            if(!total_size) {
                total_size = null;
            } else {
                total_size = +total_size
            }
            let downloaded = 0;

            const write_stream = createWriteStream(path.join(model_path, model_name))
            const middle_write_stream = new WritableStream({
                write(chunk) {
                    write_stream.write(chunk);

                    downloaded += chunk.length;
                    let percentage = total_size ? +((downloaded / total_size) * 100).toFixed(2) : -1;

                    cb & cb(percentage, false)
                }
            })

            await download_req.body.pipeTo(middle_write_stream)
            cb && cb(100, true)
            resolve({
                model_name, url, size: total_size, finish_time: Date.now()
            });
        })()
    })
}

module.exports = {
    loadModel,
    chatCompletions,
    abortCompletion,
    setClient,
    downloadModel,
    updateModelSettings
}