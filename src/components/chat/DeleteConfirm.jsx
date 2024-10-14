import { useEffect } from "react";
import { useRef } from "react";

export default function DeleteConfirm({showConfirm, deleteHistory, resetRequestDelete, conv_to_delete}) {
    const dialogRef = useRef(null);

    useEffect(()=>{
        if(dialogRef.current) {
            if(showConfirm) dialogRef.current.showModal();
            else dialogRef.current.close();
        }
    }, [showConfirm])

    return (
        <dialog ref={dialogRef}>
            <div>
                Delete <strong>{conv_to_delete && conv_to_delete.title}</strong>?
            </div>
            <div
                className="button clickable"
                onClick={deleteHistory}
            >Yes, Delete</div>
            <div 
                className="button clickable"
                onClick={resetRequestDelete}
            >No, Go Back</div>
        </dialog>
    )
}