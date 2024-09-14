import { useEffect, useState } from "react";
import TrueFalseComponent from "./components/TrueFalseComponent";
import SettingSection from "./SettingSection";
import TextComponent from "./components/TextComponent";
import PasswordComponent from "./components/PasswordComponent";
import { getJSONCredentials, storeCredentials } from "../../utils/workers/aws-worker";
import { getPlatformSettings } from "../../utils/platform_settings";

export default function AwsSettings({ platform_setting, updatePlatformSetting }) {

    const [ aws_enabled, setAwsEnabled ] = useState(false);
    const [ aws_region, setAwsRegion ] = useState('');
    const [ aws_pool_id, setAwsPoolId ] = useState('');
    const [ aws_model_id, setAwsModelID ] = useState('');

    function setEnabled(is_enabled) {
        if(aws_enabled && !is_enabled) {
            updatePlatformSetting({
                enabled_platform: null
            })
        } else if(!aws_enabled && is_enabled) {
            updatePlatformSetting({
                enabled_platform: 'AWS'
            })
        }
    }

    function saveSettings() {
        storeCredentials(
            aws_region, aws_pool_id,
            platform_setting.enabled_platform === 'AWS'
        )
        updatePlatformSetting({
            aws_model_id
        })
    }

    // get aws credentials from db
    useEffect(()=>{
        (async function() {
            const credentials = await getJSONCredentials();

            if(credentials) {
                setAwsRegion(credentials.region);
                setAwsPoolId(credentials.pool_id);
            }

            const { aws_model_id: model_id } = getPlatformSettings();
            setAwsModelID(model_id);
        })()
    }, [])

    useEffect(()=>{
        setAwsEnabled(platform_setting.enabled_platform === 'AWS');
    }, [platform_setting])

    return (
        <SettingSection title={'AWS Bedrock Settings'}>
            <TrueFalseComponent 
                title={"Use AWS Bedrock For Completion"}
                value={aws_enabled} cb={setEnabled}
            />
            <TextComponent 
                title={"Set AWS Region"}
                value={aws_region} cb={setAwsRegion}
                description={'Please input your region of Bedrock & Gonginto Identity Pool.'}
                disabled={!aws_enabled}
            />
            <PasswordComponent 
                title={"Set Cognito Identity Pool ID"}
                value={aws_pool_id} cb={setAwsPoolId}
                description={'Please input your AWS Gonginto Identity Pool ID.'}
                disabled={!aws_enabled}
            />
            <TextComponent 
                title={"Set Bedrock Model ID"}
                value={aws_model_id} cb={setAwsModelID}
                description={'Please input the Redrock Model ID you want to use.'}
                disabled={!aws_enabled}
            />
            <div onClick={saveSettings}>save settings</div>
        </SettingSection>
    )
}