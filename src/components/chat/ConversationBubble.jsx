import { CircleFill } from "react-bootstrap-icons"
import Markdown from "react-markdown"

export default function ConversationBubble({role, content, hidden, special}) {
    return (
        <div className={`bubble ${role}${hidden?' hidden':""}`}>
            {
                content || !special?
                <Markdown>{ content || "**[ EMPTY MESSAGE ]**" }</Markdown> :
                <>
                <CircleFill className="dot-animation" />
                <CircleFill className="dot-animation" />
                <CircleFill className="dot-animation" />
                </>
            }
        </div>
    )
}