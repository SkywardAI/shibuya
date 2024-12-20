import { useEffect, useRef, useState } from "react"
import { Paperclip } from "react-bootstrap-icons";
import { FileTextFill } from "react-bootstrap-icons";
import { FileImageFill } from "react-bootstrap-icons";
import { StopCircleFill } from "react-bootstrap-icons";
import { Send } from "react-bootstrap-icons";

export default function UserMessage({ uid, enable_send, file_available, abort_completion, send }) {

    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);

    const inputRef = useRef(null);

    function submitMessage(event) {
        event.preventDefault();
        send(message, files);
        setMessage('');
        setFiles([]);
    }

    // update when uid changed, means we entered a new conversation
    useEffect(()=>{
        if(uid && inputRef.current) {
            inputRef.current.focus();
        }
    }, [uid])

    return (
        <form className="send-message-form" onSubmit={submitMessage}>
            <div className="input-container">
                {
                    file_available &&
                    <div className="button-container file-upload">
                        {
                            files.length ? 
                            files[0].type.startsWith("image") ? 
                            <FileImageFill className="button-icon highlight" /> : <FileTextFill className="button-icon highlight" />:
                            <Paperclip className="button-icon" />
                        }
                        <input 
                            type="file" className="clickable" 
                            title={files.length ? `Append file ${files.map(e=>e.name).join('; ')}` : "Select file to append"}
                            onChange={evt=>setFiles([...evt.target.files])} />
                    </div>
                }
                <input type="text" ref={inputRef} value={message} onChange={evt=>setMessage(evt.target.value)}/>
                <div className="button-container">
                    { 
                        enable_send ? 
                        <Send className="button-icon animated" /> :
                        <StopCircleFill className="button-icon clickable" onClick={abort_completion} />
                    }
                    <input type='submit' className={`clickable${!enable_send?" disabled":''}`}/>
                </div>
            </div>
        </form>
    )
}