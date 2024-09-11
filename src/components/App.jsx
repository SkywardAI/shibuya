import { useEffect, useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider,  } from "react-router-dom";
import Sidebar from "./sidebar";
import Chat from "./chat";
import Settings from "./Settings";
import useIDB from "../utils/idb";

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

    const idb = useIDB();
    const [warmup, setWarmUp] = useState(false);

    useEffect(()=>{
        (async function() {
            await idb.initDB();
            setWarmUp(true);
        })()
    // eslint-disable-next-line
    }, [])

    return warmup ? <RouterProvider router={router} /> : <></>
}