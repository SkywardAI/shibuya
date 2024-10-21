import { useEffect, useState } from "react";
import SettingSection from "./SettingSection";
import TrueFalseComponent from "./components/TrueFalseComponent";
import TextComponent from "./components/TextComponent";
import useIDB from "../../utils/idb";
import { getPlatformSettings, updatePlatformSettings } from "../../utils/general_settings";
import { DEFAULT_LLAMA_CPP_MODEL_URL } from "../../utils/types";
import DropdownComponent from "./components/DropdownComponent";

export default function LlamaSettings({ trigger, enabled, updateEnabled, openDownloadProtector, updateState }) {

    const [model_download_link, setModelDownloadLink] = useState('');
    const [reset_everytime, setResetEveryTime] = useState(false);
    const [downloaded_models, setDownloadedModels] = useState([])
    const idb = useIDB();

    async function saveSettings() {
        const url = model_download_link || DEFAULT_LLAMA_CPP_MODEL_URL
        // prevent from leave model url empty
        if(url !== model_download_link) setModelDownloadLink(url)

        updatePlatformSettings({
            llama_model_url: url,
            llama_reset_everytime: reset_everytime
        })
        if(enabled) {
            // check if model with this url already downloaded
            let stored_model = await idb.getOne("downloaded-models", {where: [{ platform: 'Llama', url }]})
            // if no model record, means not downloaded
            if(!stored_model) {
                await openDownloadProtector(
                    "Please wait while we downloading the model...",
                    `Downloading model from ${url}`,
                    async callback=>{
                        const model_info = await window['node-llama-cpp'].downloadModel(url, callback)
                        if(model_info) {
                            const { model_name, url, size, finish_time } = model_info;
                            stored_model = {
                                'model-name': model_name,
                                url, size, createdAt: finish_time,
                                platform: 'Llama'
                            }
                            await idb.insert("downloaded-models", stored_model)
                            setDownloadedModels([...downloaded_models, { title: stored_model['model-name'], value: stored_model.url }])
                        }
                    }
                )
            }
            await openDownloadProtector(
                'Loading model...',
                `Loading model ${stored_model['model-name']}`,
                async callback => {
                    callback(100, false);
                    // load model using the model name retrieved
                    await window['node-llama-cpp'].loadModel(stored_model['model-name'])
                    updateState();
                    callback(100, true)
                }
            )
        }
    }

    useEffect(()=>{
        trigger && saveSettings();
    // eslint-disable-next-line
    }, [trigger])

    useEffect(()=>{
        (async function() {
            const { llama_model_url, llama_reset_everytime } = getPlatformSettings();
            setModelDownloadLink(llama_model_url || DEFAULT_LLAMA_CPP_MODEL_URL);
            setResetEveryTime(llama_reset_everytime);
            
            const models = await idb.getAll("downloaded-models", {
                where: [{'platform': 'Llama'}],
                select: ["model-name", "url"]
            });
            setDownloadedModels(models.map(e=>{return { title: e['model-name'], value: e.url }}))
        })()
    // eslint-disable-next-line
    }, [])

    return (
        <SettingSection title={'Llama.cpp Engine Settings'}>
            <TrueFalseComponent 
                title={"Use Llama.cpp Engine For Completion"}
                description={"Llama.cpp Engine is powerful and it allows you to run your own .gguf model using GPU on your local machine."}
                value={enabled} cb={updateEnabled}
            />
            <DropdownComponent 
                title={"Select a downloaded model to use"}
                description={"If there's no models, you might want to download a new one by enter url below."}
                value={downloaded_models} cb={setModelDownloadLink}
            />
            <TextComponent 
                title={"Or enter the link of model you want to use"}
                description={"Only models with extension .gguf can be used. Please make sure it can be run on your own machine. If the model of entered url is not downloaded, it will download automatically when you save settings."}
                placeholder={"Default model is Microsoft Phi-3"}
                value={model_download_link} cb={setModelDownloadLink}
            />
            {/* <TrueFalseComponent 
                title={"Reset conversation when send new message"}
                description={"Reset the conversation, only keeps the latest message and the system instruction, this is useful for many one-shot operations."}
                value={reset_everytime} cb={setResetEveryTime}
            /> */}
        </SettingSection>
    )
}