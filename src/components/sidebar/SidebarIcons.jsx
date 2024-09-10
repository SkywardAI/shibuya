import { Link } from "react-router-dom"

export default function SidebarIcon({to, children, pathname}) {

    return (
        <Link to={to} className={`item${pathname===to?' selected':''}`}>
            { children }
        </Link>
    )
}