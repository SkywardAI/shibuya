import { useEffect, useRef, useState } from "react";
import ConversationBubble from "./ConversationBubble";
import { FileImageFill, FileTextFill, Paperclip, Send, StopCircleFill } from 'react-bootstrap-icons';
import useIDB from "../../utils/idb";
import { isModelLoaded, loadModel } from '../../utils/workers/worker'
import { getCompletionFunctions } from "../../utils/workers";
import { setClient as setAwsClient } from "../../utils/workers/aws-worker";
import { setClient as setOpenaiClient } from "../../utils/workers/openai-worker";

export default function Conversation({ uid, client, updateClient }) {

    const [conversation, setConversation] = useState([]);
    const [message, setMessage] = useState('');
    const [pending_message, setPendingMessage] = useState('');
    const [hide_pending, setHidePending] = useState(true);
    const [upload_file, setUploadFile] = useState(null);
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

        function cb(text, isFinished) {
            if(!isFinished) {
                setPendingMessage(text);
            } else {
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
            }
        }

        let messages = [];
        setHidePending(false);

        if(chat_functions.current.platform === "Wllama") {
            if(!isModelLoaded()) {
                await loadModel('completion', (progress)=>{
                    setPendingMessage(
                        typeof progress === 'number' ?
                        `**Downloading model, ${progress}% completed**` :
                        '**Loading model...**'
                    )
                });
                setPendingMessage('')
            }
            messages = [user_msg];
        } else {
            let user_message = user_msg;
            if(upload_file) {
                const is_img = upload_file.type.startsWith('image')
                const file_obj = {
                    content: new Uint8Array(await upload_file.arrayBuffer()),
                    format: upload_file.name.split('.').pop().toLowerCase()
                }
                if(!is_img) file_obj.name = upload_file.name.split('.').slice(0, -1).join('_');
                user_message[
                    is_img ? 'image' : 'document'
                ] = file_obj;
                setUploadFile(null);
            }
            messages = [
                ...conversation,
                user_message
            ]
        }

        await chat_functions.current.completions(messages, cb);
        setPendingMessage('');
        setHidePending(true);
    }
    
    useEffect(()=>{
        uid && getConversationByUid();
        setUploadFile(null);
    // eslint-disable-next-line
    }, [uid]);

    useEffect(()=>{
        bubblesRef.current && bubblesRef.current.scrollTo({
            behavior: "smooth",
            top: bubblesRef.current.scrollHeight
        })
    }, [conversation, pending_message])

    useEffect(()=>{
        if(!chat_functions.current) return;

        const platform = chat_functions.current.platform
        if(platform) {
            (async function() {
                let set_result = 
                    platform === "AWS" ? await setAwsClient(client) :
                    platform === "OpenAI" ? await setOpenaiClient(client) :
                    null;
                
                if(set_result) {
                    updateClient(set_result);
                }
            })()
        }
    // eslint-disable-next-line
    }, [client])

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
                        hidden={hide_pending} special={true}
                    />
                </div>
                <form className="send-message-form" onSubmit={sendMessage}>
                    <div className="input-container">
                        {
                            chat_functions.current && chat_functions.current.platform !== 'Wllama' &&
                            <div className="button-container file-upload">
                                {
                                    upload_file ? 
                                    upload_file.type.startsWith("image") ? 
                                    <FileImageFill className="button-icon highlight" /> : <FileTextFill className="button-icon highlight" />:
                                    <Paperclip className="button-icon" />
                                }
                                <input 
                                    type="file" className="clickable" 
                                    title={upload_file ? `Append file ${upload_file.name}` : "Select file to append"}
                                    onChange={evt=>setUploadFile(evt.target.files.length ? evt.target.files[0] : null)} />
                            </div>
                        }
                        <input type="text" value={message} onChange={messageOnChange}/>
                        <div className="button-container">
                            { 
                                hide_pending ? 
                                <Send className="button-icon animated" /> :
                                <StopCircleFill className="button-icon clickable" onClick={chat_functions.current.abort} />
                            }
                            <input type='submit' className={`clickable${!hide_pending?" disabled":''}`}/>
                        </div>
                    </div>
                </form>
                </> :
                <div className="no-conversation">Please select a conversation or start a new one.</div>
            }
        </div>
    )
}