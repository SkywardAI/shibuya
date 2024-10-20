import { useRef } from "react"
import ConversationBubble from "./ConversationBubble"
import { useEffect } from "react"

export default function Bubbles({ conversation, pending_message }) {

    const mainRef = useRef()

    useEffect(()=>{
        mainRef.current && mainRef.current.scrollTo({
            behavior: "smooth",
            top: mainRef.current.scrollHeight
        })
    }, [conversation, pending_message])

    return (
        <div className="bubbles" ref={mainRef}>
            { conversation.filter(({role})=>/^(user|assistant)$/.test(role)).map(({role, content}, idx) => {
                return (
                    <ConversationBubble 
                        key={`conversation-history-${idx}`} 
                        role={role} content={content} 
                    />
                )
            }) }
            <ConversationBubble
                role={'assistant'} content={pending_message}
                hidden={pending_message === null} special={true}
            />
        </div>
    )
}