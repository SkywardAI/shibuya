import { useEffect, useRef, useState } from "react";
import ConversationBubble from "./ConversationBubble";
import { Send, StopCircleFill } from 'react-bootstrap-icons';
import useIDB from "../../utils/idb";
import { isModelLoaded, loadModel } from '../../utils/workers/worker'
import { getCompletionFunctions } from "../../utils/workers";

export default function Conversation({ uid }) {

    const [conversation, setConversation] = useState([]);
    const [message, setMessage] = useState('');
    const [pending_message, setPendingMessage] = useState('');
    const [hide_pending, setHidePending] = useState(true);
    const chat_functions = useRef(getCompletionFunctions());
    const idb = useIDB();

    const bubblesRef = useRef();

    async function getConversationByUid() {
        setConversation(
            await idb.getAll(
                'messages', 
                { 
                    where: [{'history-uid': uid}],
                    select: ['role', 'content']
                }
            )
        );
    }

    function messageOnChange(evt) {
        setMessage(evt.target.value);
    }

    async function sendMessage(evt) {
        evt.preventDefault();
        if(!message || !hide_pending) return;
        
        idb.insert('messages', {
            'history-uid': uid,
            role: 'user',
            content: message,
            createdAt: Date.now()
        })
        const user_msg = {role: 'user', content: message}
        setConversation([...conversation, user_msg])
        setMessage('');
        setHidePending(false);

        function cb(text, isFinished) {
            if(!isFinished) {
                setPendingMessage(text);
            } else {
                setPendingMessage('');
                setConversation([
                    ...conversation, user_msg,
                    { role: 'assistant', content: text }
                ])
                idb.insert('messages', {
                    'history-uid': uid,
                    role: 'assistant',
                    content: text,
                    createdAt: Date.now()
                })
                idb.updateOne(
                    'chat-history', {updatedAt: Date.now()}, [{uid}]
                )
                setHidePending(true);
            }
        }

        if(chat_functions.current.type === "Wllama") {
            if(!isModelLoaded()) {
                await loadModel();
            }
        }
        const result = await chat_functions.current.completions([user_msg], cb);
        if(!result) {
            setPendingMessage('');
            setHidePending(true);
        } else {
            console.log(result)
        }
    }
    
    useEffect(()=>{
        uid && getConversationByUid();
    // eslint-disable-next-line
    }, [uid]);

    useEffect(()=>{
        bubblesRef.current && bubblesRef.current.scrollTo({
            behavior: "smooth",
            top: bubblesRef.current.scrollHeight
        })
    }, [conversation, pending_message])

    return (
        <div className="conversation-main">
            {
                uid ? 
                <>
                    <div className="bubbles" ref={bubblesRef}>
                        { conversation.map(({role, content}, idx) => {
                            return (
                                <ConversationBubble 
                                    key={`conversation-history-${uid}-${idx}`} 
                                    role={role} content={content} 
                                />
                            )
                        }) }
                        <ConversationBubble
                            role={'assistant'} content={pending_message}
                            hidden={hide_pending}
                        />
                    </div>
                    <form className="send-message-form" onSubmit={sendMessage}>
                        <input type="text" value={message} onChange={messageOnChange}/>
                        <div className="send-message-button-container">
                            { 
                                hide_pending ? 
                                <Send className="button-icon" /> :
                                <StopCircleFill className="button-icon stop clickable" onClick={chat_functions.current.abort} />
                            }
                            <input type='submit' className={`clickable${!hide_pending?" disabled":''}`}/>
                        </div>
                    </form>
                </> :
                <div className="no-conversation">Please select a conversation or start a new one.</div>
            }
        </div>
    )
}