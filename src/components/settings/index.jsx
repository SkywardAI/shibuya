import { useState } from "react";
import AwsSettings from "./AwsSettings";
import { getPlatformSettings, updatePlatformSettings as setStorageSetting } from "../../utils/platform_settings";

export default function Settings() {

    const [platfom_settings, updatePlatformSettings] = useState(getPlatformSettings())

    function updateSettings(settings) {
        const new_settings = {
            ...platfom_settings,
            ...settings
        }
        updatePlatformSettings(new_settings);
        setStorageSetting(new_settings);
    }

    return (
        <div className="setting-page">
            <AwsSettings 
                platform_setting={platfom_settings}
                updatePlatformSetting={updateSettings}
            />
        </div>
    )
}