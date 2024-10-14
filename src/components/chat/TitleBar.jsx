import { useEffect, useState } from "react";
import { PencilFill } from "react-bootstrap-icons";
import { XCircle } from "react-bootstrap-icons";
import { CheckCircle } from "react-bootstrap-icons";

export default function TitleBar({current_title, updateTitle}) {
    const [title, setTitle] = useState(current_title);
    const [is_editing, toggleEditTitle] = useState(false);

    function submitUpdateTitle() {
        if(is_editing && title !== current_title) {
            updateTitle(title);
        }
        toggleEditTitle(false);
    }

    useEffect(()=>{
        setTitle(current_title);
    }, [current_title])

    return (
        <div className="title-bar">
            {
                is_editing ? 
                <form onSubmit={evt=>{evt.preventDefault(); submitUpdateTitle()}}>
                    <input className="edit-title" value={title} onChange={evt=>setTitle(evt.target.value)} />
                    <CheckCircle className="btn clickable" onClick={submitUpdateTitle} />
                    <XCircle className="btn clickable" onClick={()=>{setTitle(current_title); toggleEditTitle(false)}} />
                </form>:
                <div className="display-title clickable" onClick={()=>toggleEditTitle(true)}>
                    <div className="text">{ current_title }</div>
                    <PencilFill className="edit-icon" />
                </div>
            }
        </div>
    )
}