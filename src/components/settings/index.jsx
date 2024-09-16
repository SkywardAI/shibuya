import { useState } from "react";
import AwsSettings from "./AwsSettings";
import { getPlatformSettings, updatePlatformSettings as setStorageSetting } from "../../utils/general_settings";
import ModelSettings from "./ModelSettings";

export default function Settings() {

    const [platfom_settings, updatePlatformSettings] = useState(getPlatformSettings())
    const [ saveSettingTrigger, toggleSaveSetting ] = useState(false);

    function updateSettings(settings) {
        const new_settings = {
            ...platfom_settings,
            ...settings
        }
        updatePlatformSettings(new_settings);
        setStorageSetting(new_settings);
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
            <AwsSettings 
                trigger={saveSettingTrigger}
                platform_setting={platfom_settings}
                updatePlatformSetting={updateSettings}
            />
            <div className={`save-settings clickable${saveSettingTrigger?" saved":""}`} onClick={save}>
                { saveSettingTrigger ? "Settings Saved!" : "Save Settings" }
            </div>
        </div>
    )
}