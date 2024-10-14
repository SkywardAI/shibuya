import { Wllama } from "@wllama/wllama/esm/index"
import { Template } from '@huggingface/jinja';

import wllamaSingleJS from '@wllama/wllama/src/single-thread/wllama.js?url';
import wllamaSingle from '@wllama/wllama/src/single-thread/wllama.wasm?url';
import wllamaMultiJS from '@wllama/wllama/src/multi-thread/wllama.js?url';
import wllamaMulti from '@wllama/wllama/src/multi-thread/wllama.wasm?url';
import wllamaMultiWorker from '@wllama/wllama/src/multi-thread/wllama.worker.mjs?url';
import { getModelSettings, getPlatformSettings } from "../general_settings";

const CONFIG_PATHS = {
    'single-thread/wllama.js': wllamaSingleJS,
    'single-thread/wllama.wasm': wllamaSingle,
    'multi-thread/wllama.js': wllamaMultiJS,
    'multi-thread/wllama.wasm': wllamaMulti,
    'multi-thread/wllama.worker.mjs': wllamaMultiWorker,
};

let model_sampling_settings = {}

export function loadModelSamplingSettings() {
    const { 
        wllama_threads, 
        wllama_batch_size, 
        wllama_context_length
    } = getPlatformSettings();

    const {
        max_tokens,
        top_p,
        temperature
    } = getModelSettings();

    model_sampling_settings = { 
        n_threads: wllama_threads, 
        n_batch: wllama_batch_size, 
        n_ctx: wllama_context_length,
        nPredict: max_tokens,
        temp: temperature,
        top_p
    }
}
loadModelSamplingSettings();

const DEFAULT_CHAT_TEMPLATE = "{% for message in messages %}{{'<|im_start|>' + message['role'] + '\n' + message['content'] + '<|im_end|>' + '\n'}}{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\n' }}{% endif %}";


const engines = {
    completion: {
        model_src: "https://huggingface.co/HuggingFaceTB/smollm-360M-instruct-v0.2-Q8_0-GGUF/resolve/main/smollm-360m-instruct-add-basics-q8_0.gguf",
        instance: new Wllama(CONFIG_PATHS),
        download_percentage: 0
    }
}

export function setClient() {
    // we don't need to reset client for wllama
    return 'fake-client'
}

let stop_signal = false;

export async function ReloadEngine(type = 'completion') {
    const load_model = isModelLoaded(type);
    engines[type].instance.exit();
    engines[type].instance = new Wllama(CONFIG_PATHS);
    load_model && loadModel();
}

export async function isModelDownloaded(type = 'completion') {
    const { instance, model_src } = engines[type];
    return (
        (await instance.cacheManager.list())
        .findIndex(e=>e.metadata.originalURL === model_src) >= 0
    )
}

export function isModelLoaded(type = 'completion') {
    return engines[type].instance.isModelLoaded();
}

export async function downloadModel(type = 'completion', cb = null) {
    const { instance, model_src } = engines[type];
    await instance.downloadModel(model_src, {
        allowOffline: true,
        embeddings: type === 'embedding',
        progressCallback: ({loaded, total})=>{
            cb && cb((loaded / total) * 100, false);
        }
    })
    cb && cb(100, true);
    return {
        model_name: model_src.split('/').pop(),
        url: model_src,
        size: 0,
        finish_time: Date.now()
    }
}

export async function deleteModel(type = 'completion') {
    const { instance, model_src } = engines[type];
    const cacheKey = await instance.cacheManager.getNameFromURL(model_src);
    await instance.cacheManager.delete(cacheKey);
}

export async function loadModel(type = 'completion', cb = null) {
    // check if model already in cache
    const { instance, model_src } = engines[type];
    
    try {
        // if not downloaded, download first
        if(!await isModelDownloaded(type)) {
            await downloadModel(type, cb);
        }
        cb && cb('loading')
        const {n_threads, n_batch, n_ctx} = model_sampling_settings;
        await instance.loadModelFromUrl(model_src, {
            n_threads, n_ctx, n_batch,
        });
    } catch(error) {
        console.error(error)
    }

    return await instance.isModelLoaded();
}

export async function formatPrompt(messages) {
    const instance = engines['completion'].instance;
    if(!instance.isModelLoaded()) return;

    const template = new Template(
        instance.getChatTemplate() ?? DEFAULT_CHAT_TEMPLATE
    );
    return template.render({
        messages,
        bos_token: await instance.detokenize([instance.getBOS()]),
        eos_token: await instance.detokenize([instance.getEOS()]),
        add_generation_prompt: true,
    });
}

export async function chatCompletions(messages, cb = null) {
    stop_signal = false;
    try {
        const { nPredict, temp, top_p } = model_sampling_settings;

        const prompt = await formatPrompt(messages)
        const result = await engines['completion'].instance.createCompletion(prompt, {
            nPredict,
            sampling: {
                temp, top_p
            },
            onNewToken: (token, piece, currentText, optionals) => {
                cb && cb(currentText, false);
                if(stop_signal) optionals.abortSignal();
            }
        })
        stop_signal = false;
        cb && cb(result, true);
        return result;
    } catch(error) {
        console.error(error)
        cb && cb(`**${error.name}**:\n\`\`\`\n${error.message}\n\`\`\``, true);
        return null;
    }
}

export function abortCompletion() {
    stop_signal = true;
}