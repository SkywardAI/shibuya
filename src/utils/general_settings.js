const PLATFORM_SETTINGS_KEY = 'platform-settings'
const DEFAULT_PLATFORM_SETTINGS = {
    enabled_platform: null,
    // aws
    aws_model_id: '', aws_region: '',
    // openai
    openai_model: ''
}

const MODEL_SETTINGS_KEY = 'general-model-settings'
const DEFAULT_MODEL_SETTINGS = {
    max_tokens: 128,
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

export function getPlatformSettings() {
    return platform_settings;
}

export function updatePlatformSettings(settings) {
    platform_settings = { ...platform_settings, ...settings }
    localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(platform_settings));
}