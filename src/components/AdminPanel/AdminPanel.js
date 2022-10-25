import './AdminPanel.css'
import React, {useEffect, useState} from 'react'
import InputPopUp from '../InputPopUp/InputPopUp';
import {Loading} from '../Reservation/Reservation';
import Room from '../Room/Room';

import { auth, firestore } from '../../helpers/firebase'
import { useCollectionData } from 'react-firebase-hooks/firestore';

function ReservationRow({name, number, date}){
    const [isExpired, setIsExpired] = useState(false);
    const [isCurrently, setIsCurrently] = useState(false);

    useEffect(() => {
        let dateParsed = new Date(date)
        dateParsed.setMinutes(dateParsed.getMinutes() + 30);
        if (dateParsed < Date.now()){
            setIsExpired(true);
        }else if(dateParsed < Date.now()){
            setIsCurrently(true);
        }
    }, [])
    if (isExpired == true)
    {
        return null;
    }
    return(
        <tr>
            <td>{name}</td>
            <td>{number}</td>
            <td>{date}</td>
            {isExpired ? <td style={{color: 'red'}}>Expired</td> : isCurrently ? <td style={{color: 'green'}}>Currently</td> : <td style={{cursor: 'pointer', textDecoration: 'underline'}}>Cancel</td>}
        </tr>
    )
}


function AdminPanel(props){
    const [reservations, setReservations] = useState([]);

    const SignOut = e => {
        e.preventDefault();
        auth.signOut().then(() => {
            console.log("Signed out successfully.")
        }).catch((e) => {
            console.log(e);
        });
    
    }

    const fetchReservations = () => { 
        setReservations([]);
        const roomsRef = firestore().collection('stations');
        roomsRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const reservationsRef = firestore().collection('stations').doc(doc.id).collection('bookings');
                let roomId = doc.id;
                reservationsRef.get().then((querySnapshot) => { 
                    querySnapshot.forEach((doc) => {
                        let reservation = doc.data( );
                        const privateRef = firestore().collection('stations').doc(roomId).collection('bookings').doc(doc.id).collection('private').doc('0');
                        privateRef.get().then((querySnap) => {
                            
                            reservation.customer_name = querySnap.data().customer_name;
                            reservation.phone_number = querySnap.data().phone_number;
                            setReservations(prev => [...prev, reservation])
                        })
                    })
                })
            })
        })

    }
    useEffect(() => {
        fetchReservations();
    }, [])


    return(
        <div className="admin-panel">
            <button className="signin-btn" onClick={SignOut}>Sign out</button>
            <p>Welcome to Admin Panel of Reservo.</p>
            <span>Upcoming reservations:</span><br/>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Number</th>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                    {reservations.length > 0 && reservations.map((reservation) => 
                    <ReservationRow name={reservation.customer_name} 
                    number={reservation.phone_number}
                    date={new Date(reservation.start_time.seconds*1000).toLocaleString()}/>)}
                </tbody>
            </table>
            
        </div>
    );

    
}
export default AdminPanel;