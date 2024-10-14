import { getPlatformSettings } from "./general_settings";
import { instance } from "./idb";
import { loadModel } from "./workers/wllama-worker";

export default async function loader() {
    localStorage.setItem('not-first-time', '1');
    await instance.initDB();

    const settings = getPlatformSettings();
    let info;

    switch(settings.enabled_platform) {
        case "Wllama":
            await loadModel();
            return;
        case "Llama":
            info = await instance.getOne('downloaded-models', {where: [{platform: "Llama", url: settings.llama_model_url}]})
            if(info) {
                await window['node-llama-cpp'].loadModel(info['model-name']);
            }
            return;
    }
}