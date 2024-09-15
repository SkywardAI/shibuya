import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { instance } from "../idb";
import { getPlatformSettings } from "../platform_settings";
import { genRandomID } from '../tools'

export async function getCredentials(json_credentials = null) {
    const credentials = json_credentials || (await getJSONCredentials());
    if(!credentials) return null;
    
    return fromCognitoIdentityPool({
        clientConfig: { region: credentials.region },
        identityPoolId: credentials.pool_id,
        logins: {
            'skywardai-developer-id-provider': genRandomID()
        }
    })
}

export async function storeCredentials(region, pool_id, enabled = false) {
    console.log(region, pool_id)
    const update_result = await instance.updateByID('credentials', 'AWS', {json: JSON.stringify({region, pool_id})})
    if(region && pool_id && enabled) await initBedrockClient();
    return !!update_result
}

export async function getJSONCredentials() {
    const record = await instance.getByID('credentials', 'AWS', ['json']);
    return (record && record.json ? JSON.parse(record.json) : null);
}

/**
 * @type {BedrockRuntimeClient?}
 */
let bedrock_client = null;

export async function initBedrockClient() {
    const credentials = await getJSONCredentials();
    if(!credentials) return false;

    bedrock_client = new BedrockRuntimeClient({
        region: credentials.region,
        credentials: (await getCredentials(credentials)) 
    });
    return true;
}

let abort_signal = false;

/**
 * @typedef ImageMessage
 * @property {"png" | "jpeg" | "gif" | "webp"} format Format of image
 * @property {Uint8Array} content Content in bytes
 */

/**
 * @typedef DocumentMessage
 * @property { "pdf" | "csv" | "doc" | "docx" | "xls" | "xlsx" | "html" | "txt" | "md"} format Format of the document
 * @property {String} name Name of the document
 * @property {Uint8Array} content Content in bytes
 */

/**
 * @typedef Message
 * @property {"user"|"assistant"|"system"} role Sender
 * @property {String} content Message content
 * @property {ImageMessage?} image Optional, send model an image for reference
 * @property {DocumentMessage?} document Optional, send model a document for reference
 */

/**
 * @typedef UsageObj
 * @property {Number} inputTokens
 * @property {Number} outputTokens
 * @property {Number} totalTokens
 */

/**
 * @typedef CompletionResponse
 * @property { String } content Content of response
 * @property { UsageObj } usage
 */

/**
 * @callback CompletionCallback
 * @param {String} text Whole text message been generated from start
 * @param {Boolean} is_finished Specify is response finished or not 
 */

/**
 * Do completion use aws settings
 * @param {Message[]} messages Messages you need to send
 * @param {CompletionCallback} cb Callback function 
 * @returns { Promise<CompletionResponse | null> }
 */
export async function chatCompletions(messages, cb = null) {
    const { aws_model_id } = getPlatformSettings();
    if(!aws_model_id || (!bedrock_client && !await initBedrockClient())) {
        console.log('no bedrock')
        cb && cb("**Cannot Initialize AWS Bedrock Client**", true)
        return null;
    }

    const system = [];
    const normal_messages = [];
    
    messages.forEach(({ role, content, image, document })=>{
        if(role === 'system') {
            system.push({text: content});
            return;
        }
        normal_messages.push({ role, content: [{text: content}] });
        if(image) {
            normal_messages.push({ 
                role, content: [
                    { image: { 
                        format: image.format, 
                        source: { bytes: image.content } 
                    } }
                ] 
            })
        }
        if(document) {
            normal_messages.push({
                role, content: [
                    { document: { 
                        format: document.format, 
                        name: document.name, 
                        source: { bytes: document.content } 
                    } }
                ] 
            })
        }
    })

    const input = {
        modelId: aws_model_id,
        messages: normal_messages,
        inferenceConfig: {
            maxTokens: 128,
            temperature: 0.7,
            topP: 0.9
        }
    }

    if(system) input.system = system;
    let response_text = '', usage = {}

    abort_signal = false;
    try {
        const command = new ConverseStreamCommand(input);
        const response = await bedrock_client.send(command);
    
        for await (const resp of response.stream) {
            if(resp.contentBlockDelta) {
                response_text += resp.contentBlockDelta.delta.text;
                cb && cb(response_text, false);
            } else if(resp.metadata) {
                usage = resp.metadata.usage;
            }
            if(abort_signal) break;
        }
        cb && cb(response_text, true);
        abort_signal = false;
    } catch(error) {
        console.error(error);
        cb && cb(`**${error.name}**:\n\`\`\`\n${error.message}\n\`\`\``, true);
        return null;
    }
    
    return { content: response_text, usage };
}

export function abortCompletion() {
    abort_signal = true;
}