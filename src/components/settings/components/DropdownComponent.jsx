import { useEffect } from "react";
import { useState } from "react";

export default function DropdownComponent({ cb, value, selected, title, description }) {

    const [selected_option, setSelectedOption] = useState(selected || (value && value.length && value[0].value) || '');

    useEffect(()=>{
        selected && setSelectedOption(selected);
    }, [selected])

    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <select 
                className="main-part" 
                value={selected_option}
                onClick={evt=>evt.preventDefault()}
                onChange={evt=>{
                    const v = evt.target.value
                    setSelectedOption(v);
                    cb && cb(v);
                }}
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