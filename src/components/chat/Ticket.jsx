export default function Ticket({ title, info, selectChat, is_selected }) {
    return (
        <div 
            className={`ticket clickable${is_selected ? " selected":""}`} 
            onClick={()=>selectChat(info)}
        >
            { title }
        </div>
    )
}