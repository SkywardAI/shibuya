export default function ButtonComponent({ cb, value, disabled, title, description, className }) {
    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <div className={`main-part button ${className||''}${disabled ? ' disabled':""}`} onClick={cb}>{ value }</div>
        </div>
    )
}