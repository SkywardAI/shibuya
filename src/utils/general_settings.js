const PLATFORM_SETTINGS_KEY = 'platform-settings'
/**
 * @typedef PlatformSettings 
 * @property {"Wllama"|"Llama"|"AWS"|"OpenAI"} enabled_platform
 * @property {String} aws_model_id
 * @property {String} aws_region
 * @property {String} openai_model
 * @property {Number} wllama_threads
 * @property {Number} wllama_batch_size
 * @property {Number} wllama_context_length
 * @property {Boolean} wllama_continue_conv
 * @property {String} llama_model_url
 */
const DEFAULT_PLATFORM_SETTINGS = {
    enabled_platform: null,
    // aws
    aws_model_id: '', aws_region: '',
    // openai
    openai_model: '', 
    // wllama
    wllama_threads: 4, 
    wllama_batch_size: 128, 
    wllama_context_length: 4096, 
    wllama_continue_conv: false,
    // llama
    llama_model_url: ''
}

const MODEL_SETTINGS_KEY = 'general-model-settings'
/**
 * @typedef ModelSettings
 * @property {Number} max_tokens
 * @property {Number} top_p
 * @property {Number} temperature
 */
const DEFAULT_MODEL_SETTINGS = {
    max_tokens: 1024,
    top_p: 0.9,
    temperature: 0.7
}

function loadSettings(key, default_settings) {
    const setting = localStorage.getItem(key);
    if(!setting) {
        localStorage.setItem(key, JSON.stringify(default_settings))
    }
    return setting ? JSON.parse(setting) : default_settings;
}

// =============================================================
//                            MODEL
// =============================================================

let model_settings = loadSettings(MODEL_SETTINGS_KEY, DEFAULT_MODEL_SETTINGS);

/**
 * get current general model sampling settings
 * @returns {ModelSettings}
 */
export function getModelSettings() {
    return model_settings;
}

export function updateModelSettings(settings) {
    model_settings = { ...model_settings, ...settings };
    localStorage.setItem(MODEL_SETTINGS_KEY, JSON.stringify(model_settings));
}


// =============================================================
//                           PLATFORM
// =============================================================

let platform_settings = loadSettings(PLATFORM_SETTINGS_KEY, DEFAULT_PLATFORM_SETTINGS);

/**
 * get platform related settings
 * @returns {PlatformSettings}
 */
export function getPlatformSettings() {
    return platform_settings;
}

export function updatePlatformSettings(settings) {
    platform_settings = { ...platform_settings, ...settings }
    localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(platform_settings));
}