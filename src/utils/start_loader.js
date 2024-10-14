import { getPlatformSettings } from "./general_settings";
import { instance } from "./idb";
import { loadModel } from "./workers/worker";

export default async function loader() {
    localStorage.setItem('not-first-time', '1');
    await instance.initDB();

    const settings = getPlatformSettings();

    switch(settings.enabled_platform) {
        case "Wllama":
            await loadModel();
            return;
        case "Llama":
            await window['node-llama-cpp'].loadModel(settings.llama_model_name || 'Phi-3-mini-4k-instruct-q4.gguf');
            return;
    }
}