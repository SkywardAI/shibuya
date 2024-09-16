import { useState } from "react";
import Tickets from "./Tickets";
import Conversation from "./Conversation";

export default function Chat() {

    const [chat, selectChat] = useState({});

    return (
        <div className="chat">
            <Tickets selectChat={selectChat} current_chat={chat} />
            <Conversation uid={chat.uid} client={chat.client} />
        </div>
    )
}