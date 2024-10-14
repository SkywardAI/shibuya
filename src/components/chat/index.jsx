import { useEffect, useState } from "react";
import Tickets from "./Tickets";
// import Conversation from "./Conversation";
import useIDB from "../../utils/idb";
import DeleteConfirm from "./DeleteConfirm";
import ChatPage from "./ChatPage";
import { useRef } from "react";
import { getCompletionFunctions } from "../../utils/workers";

export default function Chat() {

    const [chat, selectChat] = useState({});
    const [current_uid, setCurrentUid] = useState(null);
    const [chat_history, setChatHistory] = useState([]);

    const [tickets, setTickets] = useState([]);
    const [show_delete_confirm, toggleConfirm] = useState(false);
    const [conv_to_delete, requestDelete] = useState(null);

    const [pending_message, setPendingMessage] = useState(null);

    const idb = useIDB();
    // const settings = useRef(getCompletionFunctions());
    const settings = useRef(getCompletionFunctions('Llama'));

    async function sendMessage(message, files) {
        // save user messages
        idb.insert('messages', {
            'history-uid': current_uid,
            role: 'user',
            content: message,
            createdAt: Date.now()
        })
        // perpare user messages for inference
        const user_message = {role: 'user', content: message}
        const history_save = [...chat_history, user_message];
        setChatHistory(history_save)

        // the callback function
        function cb(content, is_finished) {
            if(!is_finished) {
                setPendingMessage(content)
            } else {
                // if response finished, take the content as final response
                setPendingMessage(null);
                setChatHistory([...history_save, {role: 'assistant', content}])
                // update history in db
                idb.insert('messages', {
                    'history-uid': current_uid,
                    role: 'assistant',
                    content: content,
                    createdAt: Date.now()
                })
                idb.updateOne(
                    'chat-history', {updatedAt: Date.now()}, [{uid:current_uid}]
                )
            }
        }

        // start inference
        const send_message = (
            settings.current.formator ? 
            await settings.current.formator(history_save, files) : history_save
        )
        setPendingMessage('')
        await settings.current.completions(send_message, cb)
    }

    function updateChatClient(client) {
        const new_info = {...chat, client}
        // if(!chat.settings) new_info.settings = chat.settings;
        selectChat(new_info)
        
        let history_cp = [...tickets];
        history_cp[
            history_cp.findIndex(e=>e.uid === chat.uid)
        ].client = client;
        setTickets(history_cp);
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
        setTickets(tickets.filter(e=>e.uid !== uid));
        uid === chat.uid && selectChat({});
        resetRequestDelete();
    }

    async function updateTitle(title) {
        await idb.updateOne("chat-history", {title}, [{uid: chat.uid}])

        selectChat({
            ...chat, title: title
        })

        let history_cp = [...tickets];
        history_cp[
            history_cp.findIndex(e=>e.uid === chat.uid)
        ].title = title;
        setTickets(history_cp);
    }

    useEffect(()=>{
        conv_to_delete && toggleConfirm(true);
    }, [conv_to_delete])

    useEffect(()=>{
        if(chat.uid && chat.uid !== current_uid) {
            setCurrentUid(chat.uid);
            let message_history = null;
            // update messages
            idb.getAll(
                'messages', 
                { 
                    where: [{'history-uid': chat.uid}],
                    select: ['role', 'content']
                }
            ).then(messages=>{
                message_history = messages;
                setChatHistory(messages)
            }).finally(()=>{
                if(!chat.client) {
                    updateChatClient(settings.current.initClient(null, message_history))
                }
            })
        }
    // eslint-disable-next-line
    }, [chat])

    return (
        <div className="chat">
            <Tickets 
                selectChat={selectChat} current_chat={chat} 
                setHistory={setTickets} history={tickets} 
                deleteHistory={requestDelete} platform={settings.current.platform}
            />
            {/* <Conversation 
                uid={chat.uid} 
                title={chat.title} updateTitle={updateTitle}
                client={chat.client} updateClient={updateChatClient}
            /> */}
            <ChatPage 
                updateTitle={updateTitle}
                chat={chat} chat_history={chat_history}
                pending_message={pending_message} abort={settings.current.abort}
                sendMessage={sendMessage}
            />
            <DeleteConfirm 
                showConfirm={show_delete_confirm} 
                deleteHistory={deleteHistory} 
                resetRequestDelete={resetRequestDelete} 
                conv_to_delete={conv_to_delete}
            />
        </div>
    )
}