import { useState } from "react";
import { createBrowserRouter, RouterProvider,  } from "react-router-dom";
import Entry from "./Entry";
import router_settings from "../utils/router";
import { createHashRouter } from "react-router-dom";
import { LOAD_FINISHED, LOAD_PENDING, LOAD_SET_SETTINGS, LOAD_SKIP_SETTINGS } from "../utils/types";
import Settings from "./settings";

export default function App() {
    const router = useState(
        import.meta.env.MODE === 'production' ?
        createHashRouter(router_settings) :
        createBrowserRouter(router_settings)
    )[0];
    const [load_status, setLoadStatus] = useState(LOAD_PENDING);

    return (
        load_status === LOAD_PENDING ?
        <Entry complete={setLoadStatus} /> :
        load_status === LOAD_FINISHED || load_status === LOAD_SKIP_SETTINGS ?
        <RouterProvider router={router} /> :
        load_status === LOAD_SET_SETTINGS ?
        <Settings /> : <></>
    )
}