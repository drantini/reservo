import React from 'react'
import './PopUp.css'
import { motion } from 'framer-motion';

function PopUp({children, title, text, closePopup}){
    return(
        <div className="popup">
            <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }}
            transition={{
            type: "tween",
            stiffness: 100,
            damping: 20
            }} className="popup-inner">
                <h1>{title}</h1>
                <span>{text}</span><br/>

                <button className='close' onClick={closePopup}>Close</button>
            </motion.div>
        </div>
    )
}
export default PopUp;