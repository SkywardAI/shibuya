import { Link, Outlet, useLocation } from "react-router-dom";
import { sidebar_top_menus, sidebar_bottom_menus } from "../utils/types";

function generateSidebarMenu({name, url, icon}, pathname) {
    return (
        <Link 
            key={`sidebar-${name}`} 
            to={url} className={`item${pathname === url ? ' selected':""}`}
        >
            { icon }
        </Link>
    )
}

export default function Sidebar() {
    const { pathname } = useLocation();

    return (
        <div className="main">
            <div className="app-sidebar">
                <div className="section">
                    { sidebar_top_menus.map(e=>generateSidebarMenu({...e}, pathname)) }
                </div>
                <div className="section bottom">
                    { sidebar_bottom_menus.map(e=>generateSidebarMenu({...e}, pathname)) }
                </div>
            </div>
            <div className="window">
                <Outlet />
            </div>
        </div>
    )
}