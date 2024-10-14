import { useEffect, useRef } from "react";

export default function DownloadProtector({title, description, progress, open_status}) {

    const protectorRef = useRef();

    useEffect(()=>{
        if(protectorRef.current) {
            if(open_status) {
                protectorRef.current.showModal();
            } else {
                protectorRef.current.close();
            }
        }
    }, [open_status])

    return (
        <dialog ref={protectorRef}>
            <div className="download-protector">
                <div className="title">{title}</div>
                <div className="description">{description || ""}</div>
                <div className="progress-bar" style={{backgroundPositionX: `${100-progress}%`}}>
                    <div className="progress-text">{ progress }%</div>
                </div>
            </div>
        </dialog>
    )
}