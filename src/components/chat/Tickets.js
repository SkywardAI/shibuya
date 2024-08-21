import React, { useState } from "react";
import Ticket from "./Ticket";

export default function Tickets({selectChat, current_chat}) {

    const [tickets, setTickets] = useState([
        {title: "Hello!", uid: Math.random().toString(32).slice(2)},
        {title: "Hello!", uid: Math.random().toString(32).slice(2)},
        {title: "Hello!", uid: Math.random().toString(32).slice(2)}
    ]);

    return (
        <div className="tickets">
            { tickets.map(elem => {
                const { title, uid } = elem;
                return (
                    <Ticket 
                        key={`ticket-${title}-${uid}`}
                        title={title} uid={uid}
                        selectChat={selectChat}
                        is_selected={current_chat && uid === current_chat}
                    />
                )
            }) }
        </div>
    )
}