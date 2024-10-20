import { useEffect, useRef, useState } from "react";
import Tickets from "./Tickets";
// import Conversation from "./Conversation";
import useIDB from "../../utils/idb";
import DeleteConfirm from "./DeleteConfirm";
import ChatPage from "./ChatPage";
import { getCompletionFunctions } from "../../utils/workers";
import { getPlatformSettings } from "../../utils/general_settings";

export default function Chat() {

    const [chat, selectChat] = useState({});
    const [current_uid, setCurrentUid] = useState(null);
    const [chat_history, setChatHistory] = useState([]);

    const [tickets, setTickets] = useState([]);
    const [show_delete_confirm, toggleConfirm] = useState(false);
    const [conv_to_delete, requestDelete] = useState(null);

    const [pending_message, setPendingMessage] = useState(null);

    const idb = useIDB();
    const platform = useRef(getPlatformSettings().enabled_platform);
    const [session_setting, setSessionSetting] = useState({});

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
            session_setting.formator ? 
            await session_setting.formator(history_save, files) : history_save
        )
        setPendingMessage('')
        await session_setting.completions(send_message, cb)
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

    async function attributeUpdater(name, value) {
        await idb.updateOne("chat-history", {[name]: value}, [{uid: chat.uid}])

        selectChat({
            ...chat, [name]: value
        })

        let history_cp = [...tickets];
        history_cp[
            history_cp.findIndex(e=>e.uid === chat.uid)
        ][name] = value;
        setTickets(history_cp);
    }

    async function updateTitle(title) {
        await attributeUpdater('title', title)
    }

    async function updateSystemInstruction(instruction) {
        if(!chat['system-instruction']) {
            await idb.insert('messages', {
                role: 'system',
                content: instruction,
                'history-uid': chat.uid,
                createdAt: Date.now()
            })
        } else {
            await idb.updateOne('messages', {
                content: instruction
            }, [{'history-uid': chat.uid, role: 'system'}])
        }
        switchConversation();
        await attributeUpdater('system-instruction', instruction)
    }

    function switchConversation() {
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
            const ss = getCompletionFunctions(chat.platform);
            const client = ss.initClient(chat.client || null, message_history)
            if(!chat.client) {
                updateChatClient(client)
            }
            setSessionSetting(ss);
        })
    }

    useEffect(()=>{
        conv_to_delete && toggleConfirm(true);
    }, [conv_to_delete])

    useEffect(()=>{
        if(chat.uid && chat.uid !== current_uid) {
            setCurrentUid(chat.uid);
            switchConversation();
        }
    // eslint-disable-next-line
    }, [chat])

    return (
        platform.current ?
        <div className="chat">
            <Tickets 
                selectChat={selectChat} current_chat={chat} 
                setHistory={setTickets} history={tickets} 
                deleteHistory={requestDelete} platform={platform.current}
            />
            <ChatPage 
                updateTitle={updateTitle}
                chat={chat} chat_history={chat_history}
                pending_message={pending_message} abort={session_setting.abort}
                sendMessage={sendMessage} updateSystemInstruction={updateSystemInstruction}
            />
            <DeleteConfirm 
                showConfirm={show_delete_confirm} 
                closeDialog={()=>toggleConfirm(false)}
                deleteHistory={deleteHistory} 
                resetRequestDelete={resetRequestDelete} 
                conv_to_delete={conv_to_delete}
            />
        </div> :
        <></>
    )
}