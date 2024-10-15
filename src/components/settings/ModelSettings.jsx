import { useEffect, useState } from "react";
import ScrollBarComponent from "./components/ScrollBarComponent";
import SettingSection from "./SettingSection";
import { getModelSettings, updateModelSettings } from "../../utils/general_settings";

export default function ModelSettings({ trigger, updateState }) {

    const [max_tokens, setMaxTokens] = useState(0);
    const [top_p, setTopP] = useState(0);
    const [temperature, setTemperature] = useState(0);

    function saveSettings() {
        updateModelSettings({
            max_tokens, top_p, temperature
        })
        updateState()
    }

    useEffect(()=>{
        trigger && saveSettings();
    // eslint-disable-next-line
    }, [trigger])

    useEffect(()=>{
        const model_settings = getModelSettings();
        setMaxTokens(model_settings.max_tokens);
        setTopP(model_settings.top_p);
        setTemperature(model_settings.temperature);
    }, [])

    return (
        <SettingSection title={'General Model Settings'}>
            <ScrollBarComponent
                title={'Set Max Tokens'}
                description={'The max tokens AI can generate'}
                value={max_tokens} cb={setMaxTokens}
                max={2048} min={32}
            />
            <ScrollBarComponent
                title={'Set Top P'}
                description={'This can be considered the general accuracy of AI response'}
                value={top_p} cb={setTopP}
                max={1} min={0} times_10={true}
            />
            <ScrollBarComponent
                title={'Set Temperature'}
                description={'The higher temperature, the more creative AI\'s response is.'}
                value={temperature} cb={setTemperature}
                max={1} min={0} times_10={true}
            />
        </SettingSection>
    )
}