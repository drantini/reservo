import './AdminPanel.css'
import React, {useEffect, useState} from 'react'
import Loader from "react-loader-spinner";

import InputPopUp from '../InputPopUp/InputPopUp';

import { auth, firestore } from '../../helpers/firebase'
import { useCollectionData } from 'react-firebase-hooks/firestore';

function LeftNotification(props){
    return(
        <div id={props.type} className="notification">
            <span>{props.text}</span>
        </div>
    )
}

function Loading(props){
    return(
        <div id="reservation" className="reservation">
            <Loader type="Puff" color="#00BFFF"
            height={90}
            width={90}
            timeout={93000}>

            </Loader>
            <span>{props.text}</span>
        </div>
    )
}

function Room(props){
    const [bookingsQuery, setBookingsQuery] = useState();
    const [showLoading, setShowLoading] = useState(false);

    const [bookingReference, setBookingReference] = useState();
    const [roomId, setRoomId] = useState("0");
    const getBookings = () => {
        firestore().collection('stations').where('name', '==', props.name).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setRoomId(doc.id + "");
                setBookingReference(firestore().collection('stations/' + doc.id + '/bookings'));
                return setBookingsQuery(firestore().collection('stations/' + doc.id + '/bookings').orderBy('start_time').limit(10))
            });
        
        });
    }
    useEffect(() => {
        getBookings();

    })
    const stations = firestore().collection('stations')
    const removeRoom = () => {
        setShowLoading(true);
        stations.doc(roomId).delete().then(() => {
            setShowLoading(false);
            window.location.reload();

        }).catch((error) => {
            console.error("Error removing: ", error);
            alert("Error removing: ", error);
        })
    }

    const [bookings] = useCollectionData(bookingsQuery);
    return(
        showLoading ? <Loading text="Removing room... This might take a while." type="room"></Loading> :
        <div className="room">
            <button className="cancel-room" onClick={removeRoom}>X</button>

            <span>{props.name}</span>
            {bookings && bookings.map(booking => <Reservation bookingRef={bookingReference} name={booking.customer_name} phone_number={booking.phone_number} start={booking.start_time}/>)}

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
    const sumbitReservation = () => {
        setResolved(true)
    }

    useEffect(() => {
        //Happened more than 30 minutes ago, automatically remove
        if (new Date((props.start.seconds * 1000)+1800000) < Date.now() && bookingsRef && bookingId){
            cancelReservation(false);
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
                <span>{props.name}</span><br/>
                <span>{props.phone_number}</span><br/>
                <span>{time}</span><br/>
                <label>
                    Paid
                <input type="number" min="1" step="any" placeholder="3.50" value={paid} onChange={e => setPaid(parseFloat(e.target.value))}></input>
                $
                </label>
                <button onClick={sumbitReservation}>Submit</button>
            </div>
            }
        </div>
    )
}

function AdminPanel(props) {
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [nameRoom, setNameRoom] = useState("");
    const [nextRoomId, setNextRoomId] = useState(0);
    const [showLoadingAddRoom, setShowLoadingAddRoom] = useState(false);
    const SignOut = e => {
        e.preventDefault();
        auth().signOut().then(() => {
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
        setNextRoomId(stations.length);
    }

    const CreateRoom = () => {
        if (nameRoom.length <= 0){
            return alert("Please enter room name.")
        }
        setNextRoomId(stations.length);
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

            <p>Welcome to Admin Panel of Reservo.</p>
            <span>Upcoming reservations:</span><br/>
            <div className="rooms">
            {stations && stations.map(station => <Room name={station.name}></Room>)}

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