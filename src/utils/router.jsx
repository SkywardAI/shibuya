import { Navigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Chat from "../components/chat";
import Settings from "../components/settings";

export default [
    {
        path: '/',
        element: <Sidebar />,
        children: [
            {
                path: '/',
                element: <Navigate to='/chat' />
            },
            {
                path: "chat",
                element: <Chat />
            },
            {
                path: "settings",
                element: <Settings />
            }
        ]
    }
]