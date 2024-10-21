export default function DropdownComponent({ cb, value, title, description }) {
    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <select 
                className="main-part" 
                onClick={evt=>evt.preventDefault()}
                onChange={evt=>cb && cb(evt.target.value)}
            >
                { value.map((e, i)=>{
                    let title, value;
                    if(typeof e === "object") {
                        title = e.title;
                        value = e.value;
                    } else {
                        title = e;
                        value = e;
                    }
                    return <option key={`option-${i}`} value={value}>{ title }</option>
                }) }
            </select>
        </div>
    )
}