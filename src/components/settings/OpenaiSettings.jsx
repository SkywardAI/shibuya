import { useEffect, useState } from "react";
import SettingSection from "./SettingSection";
import TrueFalseComponent from "./components/TrueFalseComponent";
import TextComponent from "./components/TextComponent";
import PasswordComponent from "./components/PasswordComponent";
import { getPlatformSettings, updatePlatformSettings } from "../../utils/general_settings";
import { getCredentials, storeCredentials } from "../../utils/workers/openai-worker";

export default function OpenaiSettings({ trigger, enabled, updateEnabled }) {

    const [api_key, setAPIKey] = useState('');
    const [model_name, setModelName] = useState('');

    function saveSettings() {
        updatePlatformSettings({
            openai_model: model_name
        })
        storeCredentials({api_key})
    }

    useEffect(()=>{
        trigger && saveSettings();
    // eslint-disable-next-line
    }, [trigger])

    useEffect(()=>{
        (async function() {
            const credentials = await getCredentials();
            if(credentials) {
                setAPIKey(credentials.api_key || '')
            }

            const { openai_model } = getPlatformSettings();
            setModelName(openai_model);
        })()
    }, [])

    return (
        <SettingSection title={'General Model Settings'}>
            <TrueFalseComponent 
                title={"Use OpenAI For Completion"}
                value={enabled} cb={updateEnabled}
            />
            <PasswordComponent 
                title={"Set API Key"}
                value={api_key} cb={setAPIKey}
                description={'Please input your OpenAI API Key.'}
                disabled={!enabled}
            />
            <TextComponent 
                title={"Set Model To Use"}
                value={model_name} cb={setModelName}
                description={'Please input the model name you want to use.'}
                disabled={!enabled}
            />
        </SettingSection>
    )
}