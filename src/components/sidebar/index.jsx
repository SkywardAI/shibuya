import { Outlet, useLocation } from "react-router-dom";
import { Chat, Gear } from "react-bootstrap-icons";
import SidebarIcon from "./SidebarIcons";

export default function Sidebar() {
    const { pathname } = useLocation();

    return (
        <div className="main">
            <div className="app-sidebar">
                <div className="section">
                    <SidebarIcon to={'/chat'} pathname={pathname}><Chat/></SidebarIcon>
                </div>
                <div className="section bottom">
                    <SidebarIcon to={'/settings'} pathname={pathname}><Gear/></SidebarIcon>
                </div>
            </div>
            <div className="window">
                <Outlet />
            </div>
        </div>
    )
}