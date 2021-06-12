import React from 'react'
import './TimePopUp.css'
import { motion } from 'framer-motion';

function TimePopUp(props){
    return(
        <div className="popup">
            <motion.div initial={{ x: "-50%", y: "-50%", scale: 0}} animate={{ scale: 1 }}
            transition={{
            type: "tween",
            stiffness: 250,
            damping: 20
            }} className="popup-inner">
                <h1>{props.title}</h1>
                <span>Open at</span><br/>
                <input className="hour" type="number" step="0.5" value={props.open} onChange={e => props.setOpenHour(e.target.value)}></input><br/>
                <span>Close at</span><br/>
                <input className="hour" type="number" step="0.5" value={props.close} onChange={e => props.setCloseHour(e.target.value)}></input><br/>
                <button className='cancel-add' onClick={props.closePopUp}>Cancel</button>

                <button className='confirm' onClick={props.doConfirm}>Confirm</button>

            </motion.div>
        </div>
    )
}
export default TimePopUp;