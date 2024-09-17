import { useEffect } from "react";
import Ticket from "./Ticket";
import useIDB from "../../utils/idb";
import { genRandomID } from "../../utils/tools";

export default function Tickets({selectChat, current_chat, history, setHistory}) {

    const idb = useIDB();

    async function syncHistory() {
        const history = await idb.getAll('chat-history')
        history.sort((a, b)=>b.updatedAt - a.updatedAt)
        setHistory(history)
    }

    async function startNewConversation() {
        const timestamp = Date.now();
        const conv_id = await idb.insert("chat-history", 
            {
                title: 'New Conversation',
                createdAt: timestamp,
                updatedAt: timestamp,
                uid: genRandomID(),
                client: null
            }
        )
        const new_conv_info = await idb.getByID('chat-history', conv_id);
        new_conv_info &&
        setHistory([
            new_conv_info,
            ...history
        ])
        selectChat(new_conv_info)
    }

    useEffect(()=>{
        syncHistory()
    // eslint-disable-next-line
    }, [])

    return (
        <div className="tickets">
            <div 
                className="new-conversation clickable"
                onClick={startNewConversation}
            >
                <div>Start New Chat</div>
            </div>
            { history.map(elem => {
                const { title, uid } = elem;
                return (
                    <Ticket 
                        key={`ticket-${title}-${uid}`}
                        title={title} info={elem}
                        selectChat={selectChat}
                        is_selected={current_chat.uid && uid === current_chat.uid}
                    />
                )
            }) }
        </div>
    )
}