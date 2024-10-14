import { getModelSettings, getPlatformSettings } from "../general_settings";
import { chatCompletions as WllamaCompletions, abortCompletion as WllamaAbort, setClient as WllamaSetClient } from "./wllama-worker";
import { chatCompletions as AwsCompletions, abortCompletion as AwsAbort, setClient as AwsSetClient, formator as AwsFormator } from "./aws-worker"
import { chatCompletions as OpenaiCompletions, abortCompletion as OpenaiAbort, setClient as OpenAISetClient } from "./openai-worker";

/**
 * @typedef CompletionFunctions
 * @property {Function} completions
 * @property {Function} abort
 * @property {Function} initClient
 * @property {"Wllama" | "AWS" | "OpenAI" | "Llama"} platform
 * @property {Promise<Function<any>>|undefined} formator
 */

/**
 * Get completion and abort functions of selected platform
 * @returns {CompletionFunctions}
 */
export function getCompletionFunctions(platform = null) {
    platform = platform || getPlatformSettings().enabled_platform;
    
    switch(platform) {
        case 'AWS':
            return { 
                completions: AwsCompletions, 
                abort: AwsAbort, platform: "AWS",
                initClient: AwsSetClient,
                formator: AwsFormator
            }
        case 'OpenAI':
            return { 
                completions: OpenaiCompletions, 
                abort: OpenaiAbort, platform: "OpenAI",
                initClient: OpenAISetClient
            }
        case 'Llama':
            window['node-llama-cpp'].updateModelSettings(getModelSettings())
            return { 
                completions: window['node-llama-cpp'].chatCompletions, 
                abort: window['node-llama-cpp'].abortCompletion, 
                platform: 'Llama',
                initClient: window['node-llama-cpp'].setClient
            }
        case "Wllama":
            return {
                completions: WllamaCompletions,
                abort: WllamaAbort,
                platform: "Wllama",
                initClient: WllamaSetClient
            }
    }
    
}