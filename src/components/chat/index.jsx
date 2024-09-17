import { useEffect, useRef, useState } from "react";
import Tickets from "./Tickets";
import Conversation from "./Conversation";
import useIDB from "../../utils/idb";

export default function Chat() {

    const [chat, selectChat] = useState({});
    const [history, setHistory] = useState([]);
    const idb = useIDB();
    const dialogRef = useRef(null);
    const [showConfirm, toggleConfirm] = useState(false);
    const [conv_to_delete, requestDelete] = useState(null);

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

    function resetRequestDelete() {
        requestDelete(null);
        toggleConfirm(false);
    }

    async function deleteHistory() {
        if(!conv_to_delete) return;

        const {uid} = conv_to_delete;
        await idb.deleteOne("chat-history", [{uid}]);
        await idb.deleteAll("messages", [{'history-uid': uid}]);
        setHistory(history.filter(e=>e.uid !== uid));
        uid === chat.uid && selectChat({});
        resetRequestDelete();
    }

    async function updateTitle(title) {
        await idb.updateOne("chat-history", {title}, [{uid: chat.uid}])

        selectChat({
            ...chat, title: title
        })

        let history_cp = [...history];
        history_cp[
            history_cp.findIndex(e=>e.uid === chat.uid)
        ].title = title;
        setHistory(history_cp);
    }

    useEffect(()=>{
        if(dialogRef.current) {
            if(showConfirm) dialogRef.current.showModal();
            else dialogRef.current.close();
        }
    }, [showConfirm])

    useEffect(()=>{
        conv_to_delete && toggleConfirm(true);
    }, [conv_to_delete])

    return (
        <div className="chat">
            <Tickets 
                selectChat={selectChat} current_chat={chat} 
                setHistory={setHistory} history={history} 
                deleteHistory={requestDelete}
            />
            <Conversation 
                uid={chat.uid} 
                title={chat.title} updateTitle={updateTitle}
                client={chat.client} updateClient={updateChatClient}
            />
            <dialog ref={dialogRef}>
                <div>
                    Delete <strong>{conv_to_delete && conv_to_delete.title}</strong>?
                </div>
                <div
                    className="button clickable"
                    onClick={deleteHistory}
                >Yes, Delete</div>
                <div 
                    className="button clickable"
                    onClick={resetRequestDelete}
                >No, Go Back</div>
            </dialog>
        </div>
    )
}