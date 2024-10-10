import { getPlatformSettings } from "../general_settings";
import { chatCompletions as WllamaCompletions, abortCompletion as WllamaAbort } from "./worker";
import { chatCompletions as AwsCompletions, abortCompletion as AwsAbort } from "./aws-worker"
import { chatCompletions as OpenaiCompletions, abortCompletion as OpenaiAbort } from "./openai-worker";
// import { chatCompletions as LlamaCompletions } from "./llamacpp-worker";

/**
 * @typedef CompletionFunctions
 * @property {Function} completions
 * @property {Function|undefined} abort
 * @property {"Wllama" | "AWS" | "OpenAI" | "Llama"} platform
 */

/**
 * Get completion and abort functions of selected platform
 * @returns {CompletionFunctions}
 */
export function getCompletionFunctions() {
    const platform_settings = getPlatformSettings();
    
    switch(platform_settings.enabled_platform ) {
        case 'AWS':
            return { completions: AwsCompletions, abort: AwsAbort, platform: "AWS" }
        case 'OpenAI':
            return { completions: OpenaiCompletions, abort: OpenaiAbort, platform: "OpenAI"}
        case 'Llama':
            return { 
                completions: window['node-llama-cpp'].chatCompletions, 
                abort: window['node-llama-cpp'].abortCompletion, 
                platform: 'Llama' 
            }
        default:
            return { 
                completions: WllamaCompletions, abort: WllamaAbort, 
                platform: "Wllama", continue_chat: platform_settings.wllama_continue_conv 
            }
    }
    
}