import { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { firestore } from '../../helpers/firebase'
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Reservation, { Loading } from '../Reservation/Reservation'
import TimePopUp from '../TimePopUp/TimePopUp';


function OptionsMenu(props){
    return(
        <motion.div id="options" className="options"         
        initial={{ opacity: 0, width: "0", height: "0" }}
        animate={{ opacity: 1,  height: "auto", width: "auto" }}
        exit={{ opacity: 0, width: "0", height: "0" }}
        transition={{ ease: "easeOut", duration: 0.3 }}
        >
            <motion.span onClick={props.editHours} className="option">• Edit open hours</motion.span><br/><br/>
            <motion.span onClick={props.removeRoom} className="option" style={{color: "red"}}>• Remove room</motion.span>

        </motion.div>
    )
}

function Room(props){
    const [bookingsQuery, setBookingsQuery] = useState();
    const [showLoading, setShowLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [bookingReference, setBookingReference] = useState();
    const [roomId, setRoomId] = useState("0");
    const [showEditHours, setShowEditHours] = useState(false);
    const [open, setOpenHour] = useState(0);
    const [close, setCloseHour] = useState(0);
    const getBookings = () => {
        setShowLoading(true)
        firestore().collection('system').where('name', '==', props.name).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setOpenHour(doc.data().openHours[0])
                setCloseHour(doc.data().openHours[1])
                

                setRoomId(doc.id + "");
                let current = Date.now();
                current += 86400000;
                let older = Date.now();
                older -= 1800000;
                var checkDate = firestore.Timestamp.fromDate(new Date(current));
                setBookingReference(firestore().collection('system/' + doc.id + '/bookings'));
                return setBookingsQuery(firestore().collection('system/' + doc.id + '/bookings').orderBy('start_time').where("start_time", "<=", checkDate).where("start_time", ">", older))
            });
            setShowLoading(false);
        });
    }
    useEffect(() => {
        getBookings();

    }, [])
    const system = firestore().collection('system')
    const removeRoom = () => {
        setShowMenu(false)

        setShowLoading(true);
        system.doc(roomId).delete().then(() => {
            setShowLoading(false);
            window.location.reload();

        }).catch((error) => {
            console.error("Error removing: ", error);
        })
    }
    const editHours = () => {
        setShowEditHours(true);
        setShowMenu(false)
    }
    const confirmEditHours = () => {
        if (open>close){
            return alert("Can't open earlier than close.")
        }
        let stationRef = firestore().collection('system').doc(roomId);
        return stationRef.update({
            openHours: [parseFloat(open), parseFloat(close)]
        }).then(() => {
            setShowEditHours(false);
        }).catch(error => {
            alert(error);
        })
    }


    const [bookings] = useCollectionData(bookingsQuery);
    return(
        showLoading ? <Loading text="Please wait..." className="room" type="TailSpin"></Loading> :
        <motion.div className="room"
        initial={{ opacity: 0, width: "0", height: "0" }}
        animate={{ opacity: 1,  height: "auto", width: "auto" }}
        exit={{ opacity: 0, width: "0", height: "0" }}>

            <div className="options-room" onClick={() => setShowMenu(!showMenu)} ></div>

            <span>{props.name}</span>
            <AnimatePresence>
            {showMenu && <OptionsMenu removeRoom={removeRoom} editHours={editHours}></OptionsMenu>}
            </AnimatePresence>
            {bookings && bookings.map(booking => <Reservation key={roomId + booking.start_time} bookingRef={bookingReference} name={booking.customer_name} phone_number={booking.phone_number} start={booking.start_time}/>)}
            {
                showEditHours == true && 
                <TimePopUp title={`Edit Open hours for ${props.name}`} open={open} close={close} setOpenHour={setOpenHour} setCloseHour={setCloseHour} doConfirm={confirmEditHours} closePopUp={() => setShowEditHours(false)}></TimePopUp>
            }
        </motion.div>


    )
}
export default Room;