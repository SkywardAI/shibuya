import { useEffect, useState } from "react";
import TrueFalseComponent from "./components/TrueFalseComponent";
import SettingSection from "./SettingSection";
import TextComponent from "./components/TextComponent";
import PasswordComponent from "./components/PasswordComponent";
import { getJSONCredentials, storeCredentials } from "../../utils/workers/aws-worker";
import { getPlatformSettings } from "../../utils/general_settings";

export default function AwsSettings({ trigger, platform_setting, updatePlatformSetting }) {

    const [ aws_enabled, setAwsEnabled ] = useState(false);
    const [ aws_region, setAwsRegion ] = useState('');
    const [ aws_key_id, setAwsKeyID ] = useState('');
    const [ aws_secret_key, setAwsSecretKey ] = useState('');
    const [ aws_session_token, setAwsSessionToken ] = useState('');
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
        const credentials = {
            key_id: aws_key_id, secret_key: aws_secret_key
        }
        if(aws_session_token) {
            credentials.session_token = aws_session_token
        }
        storeCredentials(
            credentials, aws_key_id && aws_secret_key,
            platform_setting.enabled_platform === 'AWS'
        )
        updatePlatformSetting({
            aws_model_id, aws_region
        })
    }

    // get aws credentials from db
    useEffect(()=>{
        (async function() {
            const credentials = await getJSONCredentials();

            if(credentials) {
                setAwsKeyID(credentials.key_id);
                setAwsSecretKey(credentials.secret_key);
                setAwsSessionToken(credentials.session_token);
            }

            const { aws_model_id: model_id, aws_region: region } = getPlatformSettings();
            setAwsModelID(model_id);
            setAwsRegion(region);
        })()
    }, [])

    useEffect(()=>{
        setAwsEnabled(platform_setting.enabled_platform === 'AWS');
    }, [platform_setting])

    useEffect(()=>{
        trigger && saveSettings();
    // eslint-disable-next-line
    }, [trigger])

    return (
        <SettingSection title={'AWS Bedrock Settings'}>
            <TrueFalseComponent 
                title={"Use AWS Bedrock For Completion"}
                value={aws_enabled} cb={setEnabled}
            />
            <PasswordComponent 
                title={"Set Access Key ID"}
                value={aws_key_id} cb={setAwsKeyID}
                description={'Please input your AWS Access Key ID.'}
                disabled={!aws_enabled}
            />
            <PasswordComponent 
                title={"Set Secret Access Key"}
                value={aws_secret_key} cb={setAwsSecretKey}
                description={'Please input your AWS Secret Access Key.'}
                disabled={!aws_enabled}
            />
            <PasswordComponent 
                title={"Set Session Token"}
                value={aws_session_token} cb={setAwsSessionToken}
                description={'Please input your AWS Session Token.'}
                disabled={!aws_enabled}
            />
            <TextComponent 
                title={"Set AWS Region"}
                value={aws_region} cb={setAwsRegion}
                description={'Please input your AWS Bedrock Region.'}
                disabled={!aws_enabled}
            />
            <TextComponent 
                title={"Set Bedrock Model ID"}
                value={aws_model_id} cb={setAwsModelID}
                description={'Please input the Redrock Model ID you want to use.'}
                disabled={!aws_enabled}
            />
        </SettingSection>
    )
}