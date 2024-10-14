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

export async function storeCredentials(credentials) {
    return !!(await instance.updateByID('credentials', 'AWS', {json: credentials}))
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
    if(!client || !(client instanceof BedrockRuntimeClient)) {
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
 * @typedef AWSInferenceFileSource
 * @property {Uint8Array} bytes The file content in Uint8Array
 */

/**
 * @typedef AWSInferenceFile
 * @property {String|undefined} name Only when the file type is `document` requires this
 * @property {String} format The format of file
 * @property {AWSInferenceFileSource} source source of the file
 */

/**
 * @typedef AWSInferenceContent
 * @property {String} text Text to send
 * @property {AWSInferenceFile} image image to be sent, max 20 in one sesion
 * @property {AWSInferenceFile} document document to be sent, max 5 in one session
 */

/**
 * @typedef Message
 * @property {"user"|"assistant"|"system"} role Sender
 * @property {AWSInferenceContent} content Message content, can format using `formator()`
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
    
    messages.forEach(message=>{
        const { role } = message;
        
        if(role === 'system') {
            system.push(message);
        } else {
            normal_messages.push(message);
        }
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

    if(abort_signal) {
        abort_signal = false;
        cb && cb('', true);
        return null;
    }

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
    } catch(error) {
        console.error(error);
        cb && cb(`**${error.name}**:\n\`\`\`\n${error.message}\n\`\`\``, true);
        return null;
    } finally {
        abort_signal = false;
    }
    
    return { content: response_text, usage };
}

export function abortCompletion() {
    abort_signal = true;
}

export async function formator(messages, files = []) {
    let last_role;

    const common_messages = [];
    const system_messages = [];

    for(const message of messages) {
        const { role, content } = message;
        const msg = {role, content: [{text:content}]};
        // if user asked for twice, ignore the last one
        if(/^(user|assistant)$/.test(role)) {
            role === last_role && common_messages.pop();
            last_role = role;
            common_messages.push(msg)
        } else {
            system_messages.push(msg)
        }
    }

    // append files
    if(files.length) {
        for(const file of files) {
            const file_info = file.name.split('.')
            const extension = file_info.pop();
            const filename = file_info.join('_');
            const bytes = await file.arrayBuffer()

            if(/^image\/.+/.test(file.type)) {
                common_messages[common_messages.length - 1].content.push(
                    {
                        image: {
                            format: extension,
                            source: { bytes  }
                        }
                    }
                )
            } else {
                common_messages[common_messages.length - 1].content.push(
                    {
                        document: {
                            name: filename,
                            format: extension,
                            source: { bytes  }
                        }
                    }
                )
            }
        }
    }
    return [...common_messages, ...system_messages]
}