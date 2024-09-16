const PLATFORM_SETTINGS_KEY = 'platform-settings'
const DEFAULT_PLATFORM_SETTINGS = {
    enabled_platform: null,
    // aws
    aws_model_id: '', aws_region: ''
}

const MODEL_SETTINGS_KEY = 'general-model-settings'
const DEFAULT_MODEL_SETTINGS = {
    max_tokens: 128,
    top_p: 0.9,
    temperature: 0.7
}

function getSettings(key, default_settings) {
    const setting = localStorage.getItem(key);
    if(!setting) {
        localStorage.setItem(key, JSON.stringify(default_settings))
    }
    return setting ? JSON.parse(setting) : default_settings;
}

function updateSettings(key, settings, default_settings) {
    localStorage.setItem(key, JSON.stringify({...default_settings, ...settings}));
}

export function getPlatformSettings() {
    return getSettings(PLATFORM_SETTINGS_KEY, DEFAULT_PLATFORM_SETTINGS);
}

export function updatePlatformSettings(settings) {
    updateSettings(PLATFORM_SETTINGS_KEY, settings, DEFAULT_PLATFORM_SETTINGS);
}

export function getModelSettings() {
    return getSettings(MODEL_SETTINGS_KEY, DEFAULT_MODEL_SETTINGS);
}

export function updateModelSettings(settings) {
    updateSettings(MODEL_SETTINGS_KEY, settings, DEFAULT_MODEL_SETTINGS);
}