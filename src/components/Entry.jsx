import { useEffect, useState } from 'react'
import loader from '../utils/start_loader';
import { LOAD_FINISHED, LOAD_LOADING, LOAD_PENDING, LOAD_FIRST_TIME, LOAD_SET_SETTINGS, LOAD_SKIP_SETTINGS } from '../utils/types';

export default function Entry({complete}) {

    const [loadStep, setLoadStep] = useState(LOAD_PENDING);

    async function startUp(status = LOAD_FINISHED) {
        await loader();
        complete(status);
    }

    function waitPreload(loader_function) {
        function waitTimeout() {
            setTimeout(() => {
                if(window['node-llama-cpp']) {
                    loader_function();
                } else {
                    waitTimeout();
                }
            }, 10);
        }
        waitTimeout();
    }

    useEffect(()=>{
        waitPreload(()=>{
            setLoadStep(
                localStorage.getItem('not-first-time') ?
                LOAD_LOADING : LOAD_FIRST_TIME
            )
        })
    }, [])

    useEffect(()=>{
        loadStep === LOAD_LOADING && startUp();
    // eslint-disable-next-line
    }, [loadStep])

    return (
        <div className='load-page'>
            {
                loadStep === LOAD_PENDING ?
                <div className='loading'>Loading, please wait...</div> :
                loadStep === LOAD_FIRST_TIME ?
                <div className="first-time">
                    <div className="title">Welcome to SkywardAI Chat!</div>
                    <div className="description">
                        Seems like this is the first time you using SkywardAI Chat.<br/>
                        To start chat, you need to config the models and platforms you want to use.<br/>
                        Click the setup button will take you to the settings page<br/>
                        OR you can skip for nowand setup anytime you like.
                    </div>
                    <div className="download-model clickable" onClick={()=>startUp(LOAD_SET_SETTINGS)}>Set Me Up Now!</div>
                    <div className="skip clickable" onClick={()=>startUp(LOAD_SKIP_SETTINGS)}>Skip for now</div>
                </div>:
                <div className='loading'>Loading necessary resources, please wait...</div>
            }
        </div>
    )
}