import { useEffect, useRef, useState } from "react";
import ConversationBubble from "./ConversationBubble";
import { Send } from 'react-bootstrap-icons';

async function getConversationByUid(uid) {
    return [
        { role: "user", content: "Hello!" },
        { role: "assistant", content: "Hi, how can I help you today?" }
    ]
}

export default function Conversation({ uid }) {

    const [conversation, setConversation] = useState([]);
    const [message, setMessage] = useState('');

    const bubblesRef = useRef();

    function messageOnChange(evt) {
        setMessage(evt.target.value);
    }

    function sendMessage(evt) {
        evt.preventDefault();
        if(!message) return;
        setConversation([...conversation, {role: 'user', content: message}])
        setMessage('');
    }
    
    useEffect(()=>{
        if(uid) {
            (async function() {
                setConversation(await getConversationByUid(uid));
            })();
        }
    }, [uid]);

    useEffect(()=>{
        bubblesRef.current && bubblesRef.current.scrollTo({
            behavior: "smooth",
            top: bubblesRef.current.scrollHeight
        })
    }, [conversation])

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
                    </div>
                    <form className="send-message-form" onSubmit={sendMessage}>
                        <input type="text" value={message} onChange={messageOnChange}/>
                        <div className="send-message-button-container">
                            <Send className="button-icon" />
                            <input type='submit' className="clickable"/>
                        </div>
                    </form>
                </> :
                <div className="no-conversation">Please select a conversation or start a new one.</div>
            }
        </div>
    )
}