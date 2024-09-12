import { useEffect, useState } from 'react'
import useIDB from '../utils/idb'
import { downloadModel, isModelDownloaded, loadModel } from '../utils/worker'

export default function Entry({complete}) {

    const [loadStep, setLoadStep] = useState(0);
    const [download_progress, setProgress] = useState(-1);
    const idb = useIDB();

    async function firstTimeSetup() {
        if(!(await isModelDownloaded())) {
            await downloadModel('completion', (progress)=>{
                setProgress(progress);
            })
        }
        localStorage.setItem('not-first-time', '1');
        setLoadStep(2);
    }

    async function startUp() {
        await idb.initDB();
        loadStep !== 3 && await loadModel();
        complete();
    }

    useEffect(()=>{
        loadStep >= 2 && startUp();
    // eslint-disable-next-line
    }, [loadStep])

    useEffect(()=>{
        setLoadStep(
            1+!!localStorage.getItem('not-first-time')
        )
    }, [])

    return (
        <div className='load-page'>
            {
                loadStep === 0 ?
                <div className='loading'>Loading, please wait...</div> :
                loadStep === 1 ?
                <div className="first-time">
                    <div className="title">Welcome to SkywardAI Chat!</div>
                    <div className="description">
                        Seems like this is the first time you using SkywardAI Chat.<br/>
                        To start chat, you need to download a basic model that is around 400MiB.<br/>
                        You don&apos;t need to download it again in the future<br/>
                        If you want to use your own model or you want to setup later, please skip.
                    </div>
                    {
                        download_progress < 0 ?
                        <>
                        <div className="download-model clickable" onClick={firstTimeSetup}>Set Me Up Now!</div>
                        <div className="skip clickable" onClick={()=>setLoadStep(2)}>Skip for now</div>
                        </> :
                        <div className='download-progress'>
                            <div className='progress-bar' style={{transform: `translateX(-${100-download_progress}%)`}}></div>
                            <div className='progress-num'>{Math.round(download_progress)}%</div>
                        </div>
                    }
                </div>:
                <div className='loading'>Loading necessary resources, please wait...</div>
            }
        </div>
    )
}