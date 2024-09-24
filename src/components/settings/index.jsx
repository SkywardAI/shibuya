import { useState } from "react";
import AwsSettings from "./AwsSettings";
import { getPlatformSettings, updatePlatformSettings } from "../../utils/general_settings";
import ModelSettings from "./ModelSettings";
import OpenaiSettings from "./OpenaiSettings";
import WllamaSettings from "./WllamaSettings";

export default function Settings() {

    const [enabled_platform, setEnabledPlatform] = useState(getPlatformSettings().enabled_platform)
    const [ saveSettingTrigger, toggleSaveSetting ] = useState(false);

    function updatePlatform(platform = null) {
        setEnabledPlatform(platform);
        updatePlatformSettings({ enabled_platform: platform })
    }

    function save() {
        toggleSaveSetting(true);
        setTimeout(()=>toggleSaveSetting(false), 1000);
    }

    return (
        <div className="setting-page">
            <ModelSettings 
                trigger={saveSettingTrigger}
            />
            <WllamaSettings 
                trigger={saveSettingTrigger}
                enabled={!enabled_platform}
            />
            <AwsSettings 
                trigger={saveSettingTrigger}
                enabled={enabled_platform === 'AWS'}
                updateEnabled={set=>updatePlatform(set ? "AWS" : null)}
            />
            <OpenaiSettings 
                trigger={saveSettingTrigger}
                enabled={enabled_platform === 'OpenAI'}
                updateEnabled={set=>updatePlatform(set ? "OpenAI" : null)}
            />
            <div className={`save-settings clickable${saveSettingTrigger?" saved":""}`} onClick={save}>
                { saveSettingTrigger ? "Settings Saved!" : "Save Settings" }
            </div>
        </div>
    )
}