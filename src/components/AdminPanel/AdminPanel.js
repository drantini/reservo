import './AdminPanel.css'
import React, {useEffect, useState} from 'react'
import InputPopUp from '../InputPopUp/InputPopUp';
import {Loading} from '../Reservation/Reservation';
import Room from '../Room/Room';

import { auth, firestore } from '../../helpers/firebase'
import { useCollectionData } from 'react-firebase-hooks/firestore';


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
        roomsRef.add({name: nameRoom, openHours: [9, 21]}).then((res) => {
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

            </div>
            <button onClick={AddRoom}>Add Room</button>

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