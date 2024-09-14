import { Wllama } from "@wllama/wllama/esm/index"
import { Template } from '@huggingface/jinja';

import wllamaSingleJS from '@wllama/wllama/src/single-thread/wllama.js?url';
import wllamaSingle from '@wllama/wllama/src/single-thread/wllama.wasm?url';
import wllamaMultiJS from '@wllama/wllama/src/multi-thread/wllama.js?url';
import wllamaMulti from '@wllama/wllama/src/multi-thread/wllama.wasm?url';
import wllamaMultiWorker from '@wllama/wllama/src/multi-thread/wllama.worker.mjs?url';

const CONFIG_PATHS = {
    'single-thread/wllama.js': wllamaSingleJS,
    'single-thread/wllama.wasm': wllamaSingle,
    'multi-thread/wllama.js': wllamaMultiJS,
    'multi-thread/wllama.wasm': wllamaMulti,
    'multi-thread/wllama.worker.mjs': wllamaMultiWorker,
};

const DEFAULT_CHAT_TEMPLATE = "{% for message in messages %}{{'<|im_start|>' + message['role'] + '\n' + message['content'] + '<|im_end|>' + '\n'}}{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\n' }}{% endif %}";

const engines = {
    completion: {
        model_src: "https://huggingface.co/HuggingFaceTB/smollm-360M-instruct-v0.2-Q8_0-GGUF/resolve/main/smollm-360m-instruct-add-basics-q8_0.gguf",
        instance: new Wllama(CONFIG_PATHS),
        download_percentage: 0
    }
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
            cb && cb((loaded / total) * 100);
        }
    })
    cb && cb(100);
}

export async function deleteModel(type = 'completion') {
    const { instance, model_src } = engines[type];
    const cacheKey = await instance.cacheManager.getNameFromURL(model_src);
    await instance.cacheManager.delete(cacheKey);
}

export async function loadModel(type = 'completion') {
    // check if model already in cache
    const { instance, model_src } = engines[type];
    
    try {
        await instance.loadModelFromUrl(model_src, {
            n_threads: 6,
            n_ctx: 4096,
            n_batch: 128,
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
        const prompt = await formatPrompt(messages)
        const result = await engines['completion'].instance.createCompletion(prompt, {
            nPredict: 256,
            sampling: {
                temp: 0.7
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