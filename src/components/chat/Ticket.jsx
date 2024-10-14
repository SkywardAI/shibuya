import { XLg } from "react-bootstrap-icons";

export default function Ticket({ title, info, selectChat, is_selected, deleteHistory }) {

    return (
        <div 
            className={`ticket clickable${is_selected ? " selected":""}`} 
            onClick={()=>selectChat(info)}
        >
            { title }
            <XLg 
                className="delete-icon clickable" 
                onClick={evt=>{
                    evt.stopPropagation();
                    deleteHistory({ uid: info.uid, title })
                }}
            />
        </div>
    )
}