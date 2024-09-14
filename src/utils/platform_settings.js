const PLATFORM_SETTINGS_KEY = 'platform-settings'
const DEFAULT_PLATFORM_SETTINGS = {
    enabled_platform: null,
    // aws
    aws_model_id: ''
}

export function getPlatformSettings() {
    const setting = localStorage.getItem(PLATFORM_SETTINGS_KEY);
    if(!setting) {
        localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(DEFAULT_PLATFORM_SETTINGS))
    }
    return setting ? JSON.parse(setting) : DEFAULT_PLATFORM_SETTINGS;
}

export function updatePlatformSettings(settings) {
    localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(settings))
}