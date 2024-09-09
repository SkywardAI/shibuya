import { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider,  } from "react-router-dom";
import Sidebar from "./Sidebar";
import Chat from "./chat";
import Settings from "./Settings";

export default function App() {
    const router = useState(createBrowserRouter([
        {
            path: "/",
            element: <Sidebar />,
            children: [
                {
                    path: "/",
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
        },
    ]))[0];

    return <RouterProvider router={router} />
}