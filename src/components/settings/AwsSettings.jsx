import { useEffect, useState } from "react";
import TrueFalseComponent from "./components/TrueFalseComponent";
import SettingSection from "./SettingSection";
import TextComponent from "./components/TextComponent";
import PasswordComponent from "./components/PasswordComponent";
import { getJSONCredentials, storeCredentials } from "../../utils/workers/aws-worker";
import { getPlatformSettings, updatePlatformSettings } from "../../utils/general_settings";

export default function AwsSettings({ trigger, enabled, updateEnabled, updateState }) {

    const [ aws_region, setAwsRegion ] = useState('');
    const [ aws_key_id, setAwsKeyID ] = useState('');
    const [ aws_secret_key, setAwsSecretKey ] = useState('');
    const [ aws_session_token, setAwsSessionToken ] = useState('');
    const [ aws_model_id, setAwsModelID ] = useState('');
    
    async function saveSettings() {
        const credentials = {
            key_id: aws_key_id, secret_key: aws_secret_key
        }
        if(aws_session_token) {
            credentials.session_token = aws_session_token
        }
        updatePlatformSettings({
            aws_model_id, aws_region
        })
        await storeCredentials(
            credentials, aws_key_id && aws_secret_key,
            enabled
        )
        updateState();
    }

    // get aws credentials from db
    useEffect(()=>{
        (async function() {
            const credentials = await getJSONCredentials();

            if(credentials) {
                setAwsKeyID(credentials.key_id || "");
                setAwsSecretKey(credentials.secret_key || "");
                setAwsSessionToken(credentials.session_token || "");
            }

            const { aws_model_id: model_id, aws_region: region } = getPlatformSettings();
            setAwsModelID(model_id);
            setAwsRegion(region);
        })()
    }, [])

    useEffect(()=>{
        trigger && saveSettings();
    // eslint-disable-next-line
    }, [trigger])

    return (
        <SettingSection title={'AWS Bedrock Settings'}>
            <TrueFalseComponent 
                title={"Use AWS Bedrock For Completion"}
                value={enabled} cb={updateEnabled}
            />
            <PasswordComponent 
                title={"Set Access Key ID"}
                value={aws_key_id} cb={setAwsKeyID}
                description={'Please input your AWS Access Key ID.'}
                disabled={!enabled}
            />
            <PasswordComponent 
                title={"Set Secret Access Key"}
                value={aws_secret_key} cb={setAwsSecretKey}
                description={'Please input your AWS Secret Access Key.'}
                disabled={!enabled}
            />
            <PasswordComponent 
                title={"Set Session Token"}
                value={aws_session_token} cb={setAwsSessionToken}
                description={'Please input your AWS Session Token.'}
                disabled={!enabled}
            />
            <TextComponent 
                title={"Set AWS Region"}
                value={aws_region} cb={setAwsRegion}
                description={'Please input your AWS Bedrock Region.'}
                disabled={!enabled}
            />
            <TextComponent 
                title={"Set Bedrock Model ID"}
                value={aws_model_id} cb={setAwsModelID}
                description={'Please input the Redrock Model ID you want to use.'}
                disabled={!enabled}
            />
        </SettingSection>
    )
}