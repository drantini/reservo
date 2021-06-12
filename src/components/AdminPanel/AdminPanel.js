import './AdminPanel.css'
import React, {useEffect, useState} from 'react'
import Loader from "react-loader-spinner";
import {motion, AnimatePresence} from "framer-motion";

import InputPopUp from '../InputPopUp/InputPopUp';
import TimePopUp from '../TimePopUp/TimePopUp';

import { auth, firestore } from '../../helpers/firebase'
import { useCollectionData } from 'react-firebase-hooks/firestore';

function Loading(props){
    return(
        <div id="reservation" className="reservation">
            <Loader type="Puff" color="#00BFFF"
            height={90}
            width={90}
            timeout={93000}>

            </Loader>
        </div>
    )
}
function OptionsMenu(props){
    return(
        <motion.div id="options" className="options"         
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
            <motion.span onClick={props.editHours} className="option" whileHover={{ scale: 1.1}}>• Edit open hours</motion.span><br/><br/>
            <motion.span onClick={props.removeRoom} className="option" style={{color: "red"}}>• Remove room</motion.span><br/><br/>

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
        firestore().collection('stations').where('name', '==', props.name).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setOpenHour(doc.data().openHours[0])
                setCloseHour(doc.data().openHours[1])
                

                setRoomId(doc.id + "");
                setBookingReference(firestore().collection('stations/' + doc.id + '/bookings'));
                return setBookingsQuery(firestore().collection('stations/' + doc.id + '/bookings').orderBy('start_time').limit(10))
            });
        
        });
    }
    useEffect(() => {
        getBookings();

    }, [])
    const stations = firestore().collection('stations')
    const removeRoom = () => {
        setShowMenu(false)

        setShowLoading(true);
        stations.doc(roomId).delete().then(() => {
            setShowLoading(false);
            window.location.reload();

        }).catch((error) => {
            console.error("Error removing: ", error);
            alert("Error removing: ", error);
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
        let stationRef = firestore().collection('stations').doc(roomId);
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
        showLoading ? <Loading text="Removing room... This might take a while." type="room"></Loading> :
        <div className="room">

            <div className="options-room" onClick={() => setShowMenu(!showMenu)}></div>

            <span>{props.name}</span>
            <AnimatePresence>
            {showMenu && <OptionsMenu removeRoom={removeRoom} editHours={editHours}></OptionsMenu>}
            </AnimatePresence>
            {bookings && bookings.map(booking => <Reservation key={roomId + booking.start_time} bookingRef={bookingReference} name={booking.customer_name} phone_number={booking.phone_number} start={booking.start_time}/>)}
            {
                showEditHours == true && 
                <TimePopUp title={`Edit Open hours for ${props.name}`} open={open} close={close} setOpenHour={setOpenHour} setCloseHour={setCloseHour} doConfirm={confirmEditHours} closePopUp={() => setShowEditHours(false)}></TimePopUp>
            }
        </div>


    )
}

function Reservation(props){
    const [resolved, setResolved] = useState(false);
    const [currently, setCurrently] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [bookingId, setBookingId] = useState("");
    const [paid, setPaid] = useState(0);
    const bookingsRef = props.bookingRef;
    let time = new Date(props.start.seconds * 1000).toLocaleString()
    const setReservationId = () => {
         bookingsRef.get().then((querysnap) => {
            querysnap.forEach((doc) => {
                if(doc.data().start_time.seconds == props.start.seconds){
                    return setBookingId(doc.id)
                }
            });
        })
    }
    const cancelReservation = (show) => {
        setShowLoading(true);
        bookingsRef.doc(bookingId).delete().then(() => {
            setShowLoading(false);
            if (show)
                alert("Removed reservation.");
            //setResolved(true);
        }).catch((error) => {
            console.log(error)
            if (show)
                alert("Error occured. (" + error + ")");
        })
    }

    useEffect(() => {
        //Happened more than 30 minutes ago, automatically hide
        if (new Date((props.start.seconds * 1000)+1800000) < Date.now() && bookingsRef && bookingId){
            //cancelReservation(false);
            setResolved(true);
        }
        else if (new Date(props.start.seconds * 1000) < Date.now()){
            setCurrently(true);
        }    
        setReservationId();

    })

    return(
        resolved == false &&
        <div>
            {
                showLoading ? <Loading text="Removing... This might take a while." type="reservation"></Loading> :
            <div id="reservation" className="reservation">

                {
                    bookingId != "" &&
                    <button className="cancel" onClick={() => cancelReservation(true)}>X</button>

                }
                {
                    currently == true &&
                    <span id="currently" className="currently">RIGHT NOW</span>
                }
                <span>{props.name}</span>
                <span>{props.phone_number}</span>
                <span>{time}</span>
            </div>
            }
        </div>
    )
}
function AdminPanel(props){
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [nameRoom, setNameRoom] = useState("");
    const [showLoadingAddRoom, setShowLoadingAddRoom] = useState(false);
    const SignOut = e => {
        e.preventDefault();
        auth.signOut().then(() => {
            console.log("Signed out successfully.")
        }).catch((e) => {
            console.log(e);
        });
        
    }
    const roomsRef = firestore().collection('stations');


    const [stations] = useCollectionData(roomsRef.orderBy('name'));

    //TODO: Add functionality for add room
    const AddRoom = () => {
        setShowAddRoom(true);
    }

    const CreateRoom = () => {
        if (nameRoom.length <= 0){
            return alert("Please enter room name.")
        }
        setShowAddRoom(false);
        setShowLoadingAddRoom(true);
        roomsRef.add({name: nameRoom}).then((res) => {
            setShowLoadingAddRoom(false);
            window.location.reload();
        });
    }
    const ClosePopUp = () => {
        setShowAddRoom(false);
    }
    return(
        <div>
            <button className="signin-btn" onClick={SignOut}>Sign out</button>
            <p>Welcome to Admin Panel of Reservo.</p>
            <span>Upcoming reservations:</span><br/>
            <div className="rooms">
            {stations && stations.map(station => <Room key={station.name} name={station.name}></Room>)}

            <button onClick={AddRoom}>Add Room</button>
            </div>
            {
                showAddRoom == true &&
                <InputPopUp title="Create new room" text="Name of new room" nameRoom={nameRoom} setNameRoom={setNameRoom} doConfirm={CreateRoom} closePopUp={ClosePopUp}></InputPopUp>
            }
            {
                showLoadingAddRoom == true &&
                <Loading text="Adding room... This might take a while."></Loading>

            }
        </div>
    );

    
}
export default AdminPanel;