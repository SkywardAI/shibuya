import { useEffect, useState } from "react";
import SettingSection from "./SettingSection";
import TrueFalseComponent from "./components/TrueFalseComponent";
import ScrollBarComponent from "./components/ScrollBarComponent";
import { getPlatformSettings, updatePlatformSettings } from "../../utils/general_settings";
import { loadModel, loadModelSamplingSettings } from "../../utils/workers/worker";

export default function WllamaSettings({ trigger, enabled, updateEnabled }) {

    const [ threads, setThreads ] = useState(1);
    const [ batch_size, setBatchSize ] = useState(256);
    const [ context_length, setContextLength ] = useState(4096);
    const [ continue_conv, setContinueConversation ] = useState(false);

    function saveSettings() {
        updatePlatformSettings({
            wllama_threads: threads,
            wllama_batch_size: batch_size,
            wllama_context_length: context_length,
            wllama_continue_conv: continue_conv
        })

        if(enabled) {
            loadModelSamplingSettings();
            loadModel('completion');
        }
    }

    useEffect(()=>{
        trigger && saveSettings();
    // eslint-disable-next-line
    }, [trigger])

    useEffect(()=>{
        const {
            wllama_threads,
            wllama_batch_size,
            wllama_context_length,
            wllama_continue_conv
        } = getPlatformSettings();

        setThreads(wllama_threads)
        setBatchSize(wllama_batch_size)
        setContextLength(wllama_context_length)
        setContinueConversation(wllama_continue_conv)

    }, [])

    return (
        <SettingSection title={'Wllama Engine Settings'}>
            <TrueFalseComponent 
                title={"Use Wllama Engine For Completion"}
                description={"Wllama is an Webassembly engine that allows you to run customized language models usually under 2GB on CPU."}
                value={enabled} cb={updateEnabled}
            />
            <ScrollBarComponent 
                title={"Set Threads to use"}
                value={threads} cb={setThreads}
                description={'Please set how many threads you want to use, max is your CPU cores.'}
                min={1} max={navigator.hardwareConcurrency}
            />
            <TrueFalseComponent 
                title={"Enable Continue Conversation"}
                description={"Open to continue conversation instead treate any question as a new conversation. This can cause the response speed becomes extreamly slow."}
                value={continue_conv} cb={setContinueConversation}
            />
            <ScrollBarComponent 
                title={"Set Batch Size"}
                value={batch_size} cb={setBatchSize}
                description={'Adjust batch size to balance the performance and cost.'}
                min={1} max={512}
            />
            <ScrollBarComponent 
                title={"Set Context Length"}
                value={context_length} cb={setContextLength}
                description={'Adjust the max tokens of a conversation, over this size would reset the conversation.'}
                min={1024} max={4096}
            />
        </SettingSection>
    )
}