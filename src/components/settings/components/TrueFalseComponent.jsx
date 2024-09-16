export default function TrueFalseComponent({ cb, value, title, description }) {
    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <div className="main-part checkbox">
                <div className="text">OFF</div>
                <div className="checkbox-container">
                    <input className="clickable" type="checkbox" checked={value} onChange={(evt)=>cb(evt.target.checked)} />
                </div>
                <div className="text">ON</div>
            </div>
        </div>
    )
}