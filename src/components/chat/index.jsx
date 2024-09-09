import { useState } from "react";
import Tickets from "./Tickets";
import Conversation from "./Conversation";

export default function Chat() {

    const [chat, selectChat] = useState(null);

    return (
        <div className="chat">
            <Tickets selectChat={selectChat} current_chat={chat} />
            <Conversation uid={chat} />
        </div>
    )
}