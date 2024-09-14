export default function TrueFalseComponent({ cb, value, title, description }) {
    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <div className="checkbox-container main-part">
                <input className="clickable" type="checkbox" checked={value} onChange={(evt)=>cb(evt.target.checked)} />
            </div>
        </div>
    )
}