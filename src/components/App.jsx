import { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider,  } from "react-router-dom";
import Sidebar from "./sidebar";
import Chat from "./chat";
import Settings from "./Settings";
import Entry from "./Entry";

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
    const [warmup, setWarmUp] = useState(false);

    return warmup ? <RouterProvider router={router} /> : <Entry complete={()=>setWarmUp(true)} />
}