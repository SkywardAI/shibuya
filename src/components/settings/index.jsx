import { useEffect, useRef, useState } from "react";
import AwsSettings from "./AwsSettings";
import { getPlatformSettings, updatePlatformSettings } from "../../utils/general_settings";
import ModelSettings from "./ModelSettings";
import OpenaiSettings from "./OpenaiSettings";
import WllamaSettings from "./WllamaSettings";
import DownloadProtector from "./DownloadProtector";
import LlamaSettings from "./LlamaSettings";

export default function Settings({ complete }) {

    const [enabled_platform, setEnabledPlatform] = useState(getPlatformSettings().enabled_platform)
    const [saveSettingTrigger, toggleSaveSetting] = useState(false);
    
    const setting_sections = useRef(5);
    const [updatedSettings, setUpdatedSettings] = useState(0);

    // Download model dialog
    const [download_title, setDownloadTitle] = useState('');
    const [download_spec, setDownloadSpec] = useState('');
    const [protector_open_status, toggleProtectorOpenStatus] = useState(false);
    const [download_progress, setDownloadProgress] = useState(0);

    function updatePlatform(platform = null) {
        setEnabledPlatform(platform);
        updatePlatformSettings({ enabled_platform: platform })
    }

    function save() {
        toggleSaveSetting(true);
        setTimeout(()=>toggleSaveSetting(false), 1000);
    }

    async function openDownloadProtector(title, description, downloader) {
        setDownloadTitle(title);
        setDownloadSpec(description);
        toggleProtectorOpenStatus(true);

        await downloader((progress, is_finished)=>{
            setDownloadProgress(progress);
            if(is_finished) {
                toggleProtectorOpenStatus(false);
            }
        })
    }

    function updateSaveState() {
        setUpdatedSettings((prev)=>prev+1)
    }

    useEffect(()=>{
        if(updatedSettings === setting_sections.current) {
            complete && complete();
            setUpdatedSettings(0);
        }
    // eslint-disable-next-line
    }, [updatedSettings])

    return (
        <div className="setting-page">
            <ModelSettings 
                trigger={saveSettingTrigger}
                updateState={updateSaveState}
            />
            <LlamaSettings 
                trigger={saveSettingTrigger}
                enabled={enabled_platform === "Llama"}
                updateEnabled={set=>updatePlatform(set ? "Llama" : null)}
                openDownloadProtector={openDownloadProtector}
                updateState={updateSaveState}
            />
            <WllamaSettings 
                trigger={saveSettingTrigger}
                enabled={enabled_platform === "Wllama"}
                updateEnabled={set=>updatePlatform(set ? "Wllama" : null)}
                openDownloadProtector={openDownloadProtector}
                updateState={updateSaveState}
            />
            <AwsSettings 
                trigger={saveSettingTrigger}
                enabled={enabled_platform === 'AWS'}
                updateEnabled={set=>updatePlatform(set ? "AWS" : null)}
                updateState={updateSaveState}
            />
            <OpenaiSettings 
                trigger={saveSettingTrigger}
                enabled={enabled_platform === 'OpenAI'}
                updateEnabled={set=>updatePlatform(set ? "OpenAI" : null)}
                updateState={updateSaveState}
            />
            <div className={`save-settings clickable${saveSettingTrigger?" saved":""}`} onClick={save}>
                { saveSettingTrigger ? "Settings Saved!" : "Save Settings" }
            </div>
            <DownloadProtector 
                title={download_title} description={download_spec} 
                progress={download_progress} open_status={protector_open_status} 
            />
        </div>
    )
}