import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { instance } from "../idb";
import { getModelSettings, getPlatformSettings } from "../general_settings";

export async function getCredentials(json_credentials = null) {
    const credentials = json_credentials || (await getJSONCredentials());
    if(!credentials) return null;
    
    const obj = {
        accessKeyId: credentials.key_id,
        secretAccessKey: credentials.secret_key,
    }
    if(credentials.session_token) {
        obj.sessionToken = credentials.session_token
    }
    return obj
}

export async function storeCredentials(credentials, all_filled, enabled = false) {
    const update_result = await instance.updateByID('credentials', 'AWS', {json: credentials})
    if(all_filled && enabled) await initBedrockClient();
    return !!update_result
}

export async function getJSONCredentials() {
    const record = await instance.getByID('credentials', 'AWS', ['json']);
    if(!record) return null;
    return record.json || null;
}

/**
 * @type {BedrockRuntimeClient?}
 */
let bedrock_client = null;

export async function setClient(client) {
    if(!client) {
        await initBedrockClient();
        return bedrock_client;
    } else {
        bedrock_client = client;
        return null;
    }
}

export async function initBedrockClient() {
    const credentials = await getJSONCredentials();
    if(!credentials) return false;

    const { aws_region: region } = getPlatformSettings();
    bedrock_client = new BedrockRuntimeClient({
        region, credentials: (await getCredentials(credentials)) 
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
    const { aws_model_id, aws_region } = getPlatformSettings();
    if(!aws_model_id || !aws_region || (!bedrock_client && !await initBedrockClient())) {
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
        const message = {
            role, content: [{text: content}]
        }
        if(image) {
            message.content.push(
                { image: { 
                    format: image.format, 
                    source: { bytes: image.content } 
                } }
            )
        }
        if(document) {
            message.content.push(
                { document: { 
                        format: document.format, 
                        name: document.name, 
                        source: { bytes: document.content } 
                } }
            )
        }
        normal_messages.push(message);
    })

    const { max_tokens:maxTokens, top_p:topP, temperature } = getModelSettings();
    const input = {
        modelId: aws_model_id,
        messages: normal_messages,
        inferenceConfig: {
            maxTokens, temperature, topP
        }
    }

    if(system.length) input.system = system;
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