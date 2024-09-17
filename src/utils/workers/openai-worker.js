import OpenAI from 'openai';
import {instance} from '../idb'
import { getPlatformSettings } from '../general_settings';

/**
 * @type {OpenAI?}
 */
let openai_client = null;

let abort_signal = false;

export async function getCredentials() {
    const record = await instance.getByID('credentials', 'OpenAI', ['json']);
    if(!record) return null;
    return record.json;
}

export async function storeCredentials(credentials) {
    return  !!(await instance.updateByID('credentials', 'OpenAI', {json: credentials}))
}

async function initOpenAIClient() {
    const credentials = await getCredentials();
    if(!credentials) return false;
    openai_client = new OpenAI({
        apiKey: credentials.api_key,
        dangerouslyAllowBrowser: true
    })
    return true;
}

export async function setClient(client) {
    if(!client || !(client instanceof OpenAI)) {
        await initOpenAIClient();
        return openai_client;
    } else {
        openai_client = client;
        return null;
    }
}

/**
 * @typedef Message
 * @property {"user"|"assistant"|"system"} role Sender
 * @property {String} content Message content
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
    if(!openai_client && !(await initOpenAIClient())) return;

    const { openai_model:model } = getPlatformSettings();

    if(abort_signal) {
        abort_signal = false;
        cb && cb('', true);
        return null;
    }

    let response_text = '', usage = {};
    try {
        const stream = await openai_client.chat.completions.create({
            model, stream: true, stream_options: { include_usage: true },
            messages
        })
    
        for await (const chunk of stream) {
            const delta = chunk.choices[0].delta
            response_text += delta.content || ''
            cb && cb(response_text, false);
            if(chunk.usage) usage = chunk.usage;
            if(chunk.choices[0].finish_reason) break;
            if(abort_signal) break;
        }
    } catch(error) {
        console.error(error);
        cb && cb(`**${error.name}**:\n\`\`\`\n${error.message}\n\`\`\``, true);
        return null;
    } finally {
        abort_signal = false;
    }

    return { content: response_text, usage }
}

export function abortCompletion() {
    abort_signal = true;
}