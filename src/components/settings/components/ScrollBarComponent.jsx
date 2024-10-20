import { useEffect, useState } from "react"

export default function ScrollBarComponent({ cb, value, disabled, title, description, min, max, times_10, step, special }) {

    const [scrollValue, setScrollValue] = useState((times_10 ? 10 : 1) * value);
    const [textValue, setTextValue] = useState(value);

    function checkValue(v) {
        v = v || +textValue;
        return (v <= max && v >= min) || v === special;
    }

    function setValue(value, is_scroll = false) {
        if(is_scroll) {
            setTextValue(times_10 ? value / 10 : value);
            setScrollValue(value);
        } else {
            if(!isNaN(+value)) {
                if(value > max) value = max;
                setScrollValue(times_10 ? value * 10 : value);
            }
            setTextValue(value);
        }
    }

    useEffect(()=>{
        textValue !== value && !isNaN(+textValue) && checkValue() && cb(+textValue);
    // eslint-disable-next-line
    }, [textValue])

    useEffect(()=>{
        setScrollValue((times_10 ? 10 : 1) * value)
        setTextValue(value);
    // eslint-disable-next-line
    }, [value])


    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <div className="main-part scroll-group">
                <input 
                    type="range" onChange={evt=>setValue(evt.target.value, true)}
                    step={step || 1} value={scrollValue}
                    min={(times_10 ? 10 : 1) * min} max={(times_10 ? 10 : 1) * max} 
                    disabled={disabled} 
                />
                <input 
                    type="text" value={textValue} 
                    onInput={evt=>setValue(evt.target.value, false)}
                    onClick={evt=>evt.target.select()}
                />
            </div>
        </div>
    )
}