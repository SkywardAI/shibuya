import { useState } from "react"
import { Eye, EyeSlash } from "react-bootstrap-icons"

export default function PasswordComponent({ cb, value, disabled, title, description, placeholder }) {

    const [show_password, toggleShowPassword] = useState(false);

    return (
        <div className="component">
            <div className="title">{title}</div>
            { description && <div className="description">{description}</div> }
            <div className="password-container main-part">
                <input 
                    type={show_password ? 'text' : 'password'} value={value} 
                    placeholder={placeholder || ''} onInput={(evt)=>cb(evt.target.value)} 
                    disabled={disabled} onClick={evt=>evt.target.select()}
                />
                <div className="controller clickable" onClick={()=>toggleShowPassword(!show_password)}>
                    {
                        show_password ? 
                        <EyeSlash /> :
                        <Eye />
                    }
                </div>
            </div>
        </div>
    )
}