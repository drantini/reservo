import React from 'react'
import ReactDOM from 'react-dom';
import './Popover.css';
import { AnimatePresence, motion } from 'framer-motion';

function Popover({children, isOpen, setIsOpen}){
    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && <motion.div className="popover-outer" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <div className="popover-inner">
                    {children}
                    <button className="close" onClick={() => setIsOpen(false)}>Zrušiť</button>

                </div>
            </motion.div>}
        </AnimatePresence>
    , document.body)
}
export default Popover;