export default function TextComponent({ cb, value, disabled, title, description, placeholder, type }) {
    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <input 
                type={type || "text"} value={value}
                disabled={disabled}  placeholder={placeholder || ''}
                onInput={(evt)=>cb(evt.target.value)} 
                className="main-part" onClick={evt=>evt.target.select()}
            />
        </div>
    )
}