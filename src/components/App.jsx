import { useState } from "react";
import { createBrowserRouter, RouterProvider,  } from "react-router-dom";
import Entry from "./Entry";
import router_settings from "../utils/router";
import { createHashRouter } from "react-router-dom";

export default function App() {
    const router = useState(
        import.meta.env.MODE === 'production' ?
        createHashRouter(router_settings) :
        createBrowserRouter(router_settings)
    )[0];
    const [warmup, setWarmUp] = useState(false);

    return warmup ? <RouterProvider router={router} /> : <Entry complete={()=>setWarmUp(true)} />
}