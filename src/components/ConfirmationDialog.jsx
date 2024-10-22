import { useEffect, useRef } from "react";

export default function ConfirmationDialog({children, open_status, setOpenStatus, callback}) {
    const dialogRef = useRef(null);

    useEffect(()=>{
        if(dialogRef.current) {
            if(open_status) dialogRef.current.showModal();
            else dialogRef.current.close();
        }
    }, [open_status])

    return (
        <dialog className="confirmation-dialog" ref={dialogRef} onClose={()=>setOpenStatus(false)}>
            { children }
            <div
                className="button clickable"
                onClick={()=>callback(true)}
            >Yes, Continue</div>
            <div 
                className="button clickable"
                onClick={()=>callback(false)}
            >No, Go Back</div>
        </dialog>
    )
}