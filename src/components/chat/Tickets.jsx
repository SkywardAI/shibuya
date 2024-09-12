import { useEffect, useState } from "react";
import Ticket from "./Ticket";
import useIDB from "../../utils/idb";
import { genRandomID } from "../../utils/tools";

export default function Tickets({selectChat, current_chat}) {

    const [tickets, setTickets] = useState([]);
    const idb = useIDB();

    async function syncHistory() {
        const history = await idb.getAll('chat-history')
        history.sort((a, b)=>b.updatedAt - a.updatedAt)
        setTickets(history)
    }

    async function startNewConversation() {
        const timestamp = Date.now();
        const conv_id = await idb.insert("chat-history", 
            {
                title: 'New Conversation',
                createdAt: timestamp,
                updatedAt: timestamp,
                uid: genRandomID()
            }
        )
        const new_conv_info = await idb.getByID('chat-history', conv_id);
        new_conv_info &&
        setTickets([
            ...tickets,
            new_conv_info
        ])
        selectChat(new_conv_info.uid)
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
            { tickets.map(elem => {
                const { title, uid } = elem;
                return (
                    <Ticket 
                        key={`ticket-${title}-${uid}`}
                        title={title} uid={uid}
                        selectChat={selectChat}
                        is_selected={current_chat && uid === current_chat}
                    />
                )
            }) }
        </div>
    )
}