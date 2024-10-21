/**
 * @typedef HistoryItem
 * @property {"user"|"assistant"|"system"} role
 * @property {String} content
 * @property {Number} createdAt
 */

/**
 * @typedef HistoryInfo
 * @property {Number} createdAt
 * @property {String} title
 */

/**
 * Export history by generate a file
 * @param {"Human"|"JSON"} format the format to export, either human readable or json
 * @param {HistoryInfo} history_info the information of the session, includes create time and title
 * @param {HistoryItem[]} history the history to be exported
 */
export async function exportChatHistory(format, history_info, history) {
    let formatted_sentence;
    switch(format) {
        case "JSON":
            formatted_sentence = jsonFormator(history_info, history);
            break;
        case "Human":
            formatted_sentence = humanFormator(history_info, history);
            break;
    }
    // const file = new Blob([formatted_sentence], { type: "text/plain" });

    const extension = 
        format === "JSON" ? 'json' :
        format === "Human" ? 'txt' :
        ''

    await window['file-handler'].saveFile(`${history_info.title}.${extension}`, formatted_sentence);
}

function dateFormator(timestamp) {
    const dt = new Date(timestamp);
    return `${dt.toDateString()}, ${dt.toTimeString().match(/(\d{2}:\d{2}:\d{2})/)[0]}`
}

/**
 * Format history to human readable format and return the formatted string
 * @param {HistoryInfo} history_info the information of the session to be formatted
 * @param {HistoryItem[]} history the history to be formatted
 * @returns {String}
 */
function humanFormator(history_info, history) {
    const parts = [
`${history_info.title}
${dateFormator(history_info.createdAt)}`
    ]

    let current_part = '';
    for(const { role, content, createdAt } of history) {
        current_part += 
            role === "user" ? 'user     ' :
            role === "system" ? 'system   ':
            role === 'assistant' ? 'assistant' : ''
        current_part += ` (${dateFormator(createdAt)}): `
        current_part += content

        if(/^(system|user)$/.test(role)) {
            current_part += '\n';
        } else {
            parts.push(current_part);
            current_part = ''
        }
    }

    return parts.join('\n\n---\n\n')
}

/**
 * Format history to json format and return the formatted string
 * @param {HistoryInfo} history_info the information of the session to be formatted
 * @param {HistoryItem[]} history the history to be formatted
 * @returns {String}
 */
function jsonFormator(history_info, history) {
    const { title, createdAt } = history_info;
    const formatted = 
`{
    "title": "${title}",
    "createdAt": ${createdAt},
    "messages": [
        ${history.map(({role, content, createdAt})=>{
            const msg_str = content.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll("\n", "\\n")
            return `{ "role": "${role}", "message": "${msg_str}", "createdAt": ${createdAt} }`
        }).join(`,\n${" ".repeat(8)}`)}
    ]
}`
    return formatted
}