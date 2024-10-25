import { useEffect, useState } from "react";
import SettingSection from "./SettingSection";
import TrueFalseComponent from "./components/TrueFalseComponent";
import TextComponent from "./components/TextComponent";
import useIDB from "../../utils/idb";
import { getPlatformSettings, updatePlatformSettings } from "../../utils/general_settings";
import { DEFAULT_LLAMA_CPP_MODEL_URL } from "../../utils/types";
import DropdownComponent from "./components/DropdownComponent";
import ButtonComponent from "./components/ButtonComponent";
import ConfirmationDialog from "../ConfirmationDialog";

export default function LlamaSettings({ trigger, enabled, updateEnabled, openDownloadProtector, updateState }) {

    const [model_download_link, setModelDownloadLink] = useState('');
    const [selected_model, setSelectedModel] = useState({});
    const [reset_everytime, setResetEveryTime] = useState(false);
    const [downloaded_models, setDownloadedModels] = useState([])
    const [delete_confirm_opened, setDeleteConfirmOpenStatus] = useState(false);
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
                            setDownloadedModels([...downloaded_models, { title: stored_model['model-name'], value: JSON.stringify(stored_model) }])
                            setSelectedModel(stored_model)
                        }
                    }
                )
            }
            await loadModel(stored_model);
        }
    }

    async function loadModel(model) {
        await openDownloadProtector(
            'Loading model...',
            `Loading model ${model['model-name']}`,
            async callback => {
                callback(100, false);
                // load model using the model name retrieved
                await window['node-llama-cpp'].loadModel(model['model-name'])
                updateState();
                callback(100, true)
            }
        )
    }

    async function deleteModel() {
        let load_after_delete = {};
        await openDownloadProtector(
            'Please wait while we deleteing the model...',
            `Loading model ${selected_model['model-name']}`,
            async callback => {
                window['node-llama-cpp'].deleteModel(selected_model['model-name']);
                callback(80, false);
                await idb.deleteOne("downloaded-models", [selected_model]);
                callback(90, false);

                const models = await idb.getAll("downloaded-models", {
                    where: [{'platform': 'Llama'}]
                });
                setDownloadedModels(models.map(e=>{return { title: e['model-name'], value: JSON.stringify(e) }}))
                load_after_delete = models.pop() || {}
                const url = load_after_delete.url || '';
                setSelectedModel(load_after_delete);
                setModelDownloadLink(url);
                updatePlatformSettings({
                    llama_model_url: url
                })
                callback(100, true);
            }
        )
        await loadModel(load_after_delete);
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
                where: [{'platform': 'Llama'}]
            });
            setDownloadedModels(models.map(e=>{return { title: e['model-name'], value: JSON.stringify(e) }}))
            setSelectedModel(models.filter(e=>e.url === llama_model_url).pop())
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
                value={downloaded_models} cb={model=>{
                    model = JSON.parse(model)
                    setSelectedModel(model)
                    setModelDownloadLink(model.url)
                }}
                selected={JSON.stringify(selected_model)}
            />
            <TextComponent 
                title={"Or enter the link of model you want to use"}
                description={"Only models with extension .gguf can be used. Please make sure it can be run on your own machine. If the model of entered url is not downloaded, it will download automatically when you save settings."}
                placeholder={"Default model is Microsoft Phi-3"}
                value={model_download_link} cb={setModelDownloadLink}
            />
            <TrueFalseComponent 
                title={"Reset conversation when send new message"}
                description={"Reset the conversation, only keeps the latest message and the system instruction, this is useful for many one-shot operations."}
                value={reset_everytime} cb={setResetEveryTime}
            />
            <ButtonComponent 
                title={"Delete selected model"}
                description={"This will delete the downloaded model, make sure before you choose to delete!"}
                className="dangerous" disabled={!model_download_link}
                value={"Delete Model"} cb={()=>{setDeleteConfirmOpenStatus(true)}}
            />
            <ConfirmationDialog
                open_status={delete_confirm_opened}
                setOpenStatus={setDeleteConfirmOpenStatus}
                callback={cb=>{
                    cb && deleteModel();
                    setDeleteConfirmOpenStatus(false);
                }}
            >
                <div>
                    Are you sure you want to delete model<br/>
                    <strong>{selected_model ? selected_model['model-name'] : ""}</strong>?
                </div>
            </ConfirmationDialog>
        </SettingSection>
    )
}