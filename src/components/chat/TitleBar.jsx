import { useEffect, useRef, useState } from "react";
import { 
    ChatRightText, PencilFill, 
    Save, ChatSquareText, Braces,
    XCircle, CheckCircle 
} from "react-bootstrap-icons";

export default function TitleBar({
    current_title, updateTitle,
    current_instruction, updateSystemInstruction,
    saveHistory
}) {
    const [title, setTitle] = useState(current_title);
    const [is_editing, toggleEditTitle] = useState(false);
    const [system_instruction, setSystemInstruction] = useState(current_instruction || '');
    const [is_editing_si, toggleEditSI] = useState(false);

    const inputRef = useRef(null);
    const systemInstructionDialogRef = useRef();
    const exportFormatDialogRef = useRef();

    function submitUpdateTitle() {
        if(is_editing && title !== current_title) {
            updateTitle(title);
        }
        toggleEditTitle(false);
    }

    function submitSystemInstruction() {
        is_editing_si && 
        system_instruction !== current_instruction && 
        updateSystemInstruction(system_instruction)
        
        toggleEditSI(false)
    }

    async function submitSaveHistory(format) {
        await saveHistory(format);
        exportFormatDialogRef.current.close();
    }

    useEffect(()=>{
        setSystemInstruction(current_instruction);
    }, [current_instruction])

    useEffect(()=>{
        setTitle(current_title);
    }, [current_title])

    useEffect(()=>{
        if(is_editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [is_editing])

    useEffect(()=>{
        if(is_editing_si) {
            systemInstructionDialogRef.current.showModal();
        } else {
            systemInstructionDialogRef.current.close();
        }
    }, [is_editing_si])

    return (
        <div className="title-bar">
            {
                is_editing ? 
                <form className="edit-mode" onSubmit={evt=>{evt.preventDefault(); submitUpdateTitle()}}>
                    <input className="edit-title" ref={inputRef} value={title} onChange={evt=>setTitle(evt.target.value)} />
                    <CheckCircle className="btn clickable" onClick={submitUpdateTitle} />
                    <XCircle className="btn clickable" onClick={()=>{setTitle(current_title); toggleEditTitle(false)}} />
                </form>:
                <div className="normal-mode">
                    <div className="display-title clickable" onClick={()=>toggleEditTitle(true)}>
                        <div className="text">{ current_title }</div>
                        <PencilFill className="edit-icon" />
                    </div>
                    <ChatRightText className="icon clickable" title="Set the system instruction" onClick={()=>toggleEditSI(true)} />
                    <Save className="icon clickable" title="Save history" onClick={()=>exportFormatDialogRef.current.showModal()} />
                </div>
            }
            <dialog className="system-instruction" ref={systemInstructionDialogRef} onClose={()=>toggleEditSI(false)}>
                <form onSubmit={evt=>{evt.preventDefault(); submitSystemInstruction()}}>
                    <div className="title">
                        Set your system instruction for this conversation here:
                    </div>
                    <input type="text" placeholder="You are a helpful assistant." value={system_instruction} onChange={evt=>setSystemInstruction(evt.target.value)} />
                    <div className="btn clickable" onClick={submitSystemInstruction} >Update System Instruction</div>
                    <div className="btn clickable" onClick={()=>toggleEditSI(false)}>Cancel</div>
                </form>
            </dialog>
            <dialog 
                className="export-format" 
                onClick={evt=>evt.target.close()}
                ref={exportFormatDialogRef}
            >
                <div className="export-format-main" onClick={evt=>evt.stopPropagation()}>
                    <div className="title">Please select a format to export</div>
                    <div className="export-btn clickable" onClick={()=>submitSaveHistory("JSON")}>
                       <Braces className="icon" />
                       <div className="text">Export as JSON</div> 
                    </div>
                    <div className="export-btn clickable" onClick={()=>submitSaveHistory("Human")}>
                       <ChatSquareText className="icon" />
                       <div className="text">Export as Plain Text</div> 
                    </div>
                </div>
            </dialog>
        </div>
    )
}