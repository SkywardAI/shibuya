import { useState } from "react";
import Tickets from "./Tickets";
import Conversation from "./Conversation";
import useIDB from "../../utils/idb";

export default function Chat() {

    const [chat, selectChat] = useState({});
    const [history, setHistory] = useState([]);
    const idb = useIDB();

    function updateChatClient(client) {
        selectChat({
            ...chat, client
        })
        
        let history_cp = [...history];
        history_cp[
            history_cp.findIndex(e=>e.uid === chat.uid)
        ].client = client;
        setHistory(history_cp);

        idb.updateOne('chat-history', {client}, [{uid:chat.uid}])
    }

    return (
        <div className="chat">
            <Tickets selectChat={selectChat} setHistory={setHistory} history={history} current_chat={chat} />
            <Conversation uid={chat.uid} client={chat.client} updateClient={updateChatClient} />
        </div>
    )
}