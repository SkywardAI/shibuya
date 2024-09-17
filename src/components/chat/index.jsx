import { useState } from "react";
import Tickets from "./Tickets";
import Conversation from "./Conversation";

export default function Chat() {

    const [chat, selectChat] = useState({});
    const [history, setHistory] = useState([]);

    function updateChatClient(client) {
        selectChat({
            ...chat, client
        })
        
        let history_cp = [...history];
        history_cp[
            history_cp.findIndex(e=>e.uid === chat.uid)
        ].client = client;
        setHistory(history_cp);
    }

    return (
        <div className="chat">
            <Tickets selectChat={selectChat} setHistory={setHistory} history={history} current_chat={chat} />
            <Conversation uid={chat.uid} client={chat.client} updateClient={updateChatClient} />
        </div>
    )
}