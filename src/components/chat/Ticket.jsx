import React from "react";

export default function Ticket({ title, uid, selectChat, is_selected }) {
    return (
        <div 
            className={`ticket clickable${is_selected ? " selected":""}`} 
            onClick={()=>selectChat(uid)}
        >
            { title }
        </div>
    )
}