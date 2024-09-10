import { CircleFill } from "react-bootstrap-icons"
import Markdown from "react-markdown"

export default function ConversationBubble({role, content, hidden}) {
    return (
        <div className={`bubble ${role}${hidden?' hidden':""}`}>
            {
                content ?
                <Markdown>{ content }</Markdown> :
                <>
                <CircleFill className="dot-animation" />
                <CircleFill className="dot-animation" />
                <CircleFill className="dot-animation" />
                </>
            }
        </div>
    )
}