import React from 'react'
import './InputPopUp.css'
import { motion } from 'framer-motion';

function InputPopUp(props){
    return(
        <div className="popup">
            <motion.div initial={{ x: "-50%", y: "-50%", scale: 0}} animate={{ scale: 1 }}
            transition={{
            type: "tween",
            stiffness: 250,
            damping: 20
            }} className="popup-inner">
                <h1>{props.title}</h1>
                <span>{props.text}</span><br/>
                <input className="name-room" type="text" value={props.nameRoom} onChange={e => props.setNameRoom(e.target.value)}></input><br/>
                <button className='cancel-add' onClick={props.closePopUp}>Cancel</button>

                <button className='confirm' onClick={props.doConfirm}>Confirm</button>

            </motion.div>
        </div>
    )
}
export default InputPopUp;