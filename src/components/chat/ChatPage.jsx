import Bubbles from "./Bubbles";
import TitleBar from "./TitleBar";
import UserMessage from "./UserMessage";

export default function ChatPage({
    chat, chat_history, updateTitle,
    sendMessage, pending_message, abort,
    updateSystemInstruction
}) {

    return (
        <>
            <div className="conversation-main">{chat.uid?<>
                <TitleBar 
                    current_title={chat.title} updateTitle={updateTitle} 
                    updateSystemInstruction={updateSystemInstruction}
                    current_instruction={chat['system-instruction']}
                />
                <Bubbles conversation={chat_history} pending_message={pending_message} />
                <UserMessage
                    uid={chat.uid} enable_send={pending_message === null}
                    file_available={!/^(OpenAI|Wllama|Llama)$/.test(chat.platform)}
                    send={sendMessage} abort_completion={abort}
                /></>:
                <div className="no-conversation">
                    Please select a conversation or start a new one.
                </div>
            }</div>
        </>
    )
}