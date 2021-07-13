import './ReservationSystem.css'
import React, {Fragment, useEffect, useState} from 'react'
import PopUp from '../PopUp/PopUp';

import { firestore } from '../../helpers/firebase'
import {Step1, Step2, Step3, Step4}  from '../Steps/Steps'
import { useHistory } from 'react-router-dom';


function ReservationSystem(props){
    const [reservationDate, setReservationDate] = useState([]);
    const [nameCustomer, setNameCustomer] = useState("");
    const [numberCustomer, setNumberCustomer] = useState("");
    const [showPopupAdded, setShowPopupAdded] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsParsed, setBookingsParsed] = useState(false);
    const [bookingsRef, setBookingsRef] = useState(firestore().collection('stations/0/bookings'));
    const [openHours, setOpenHours] = useState([]);
    const roomsRef = firestore().collection('stations').orderBy("name")
    const history = useHistory();


    const [currentStep, setCurrentStep] = useState(1);


    //TODO: change in firestore to make private sub collection so there are no security issues....


    const addReservation = () => {
        if (/^\d{10}$/.test(numberCustomer) === false){
            return alert("Incorrect phone number. (Correct example: 0944111985)")
        }
        if (reservationDate.length == 0){
            return alert("Please select date and time.")
        }
        if (nameCustomer.length <= 0){
            return alert("Please enter your name.")
        }
        if (numberCustomer.length <= 0){
            return alert("Please enter your phone number.")
        }

        reservationDate.forEach((reservationTime) => {
            var end = new Date(reservationTime);
            end.setMinutes(end.getMinutes() + 30)
            let add_data = {
                start_time: reservationTime,
                end_time: end,
                customer_name: nameCustomer,
                phone_number: numberCustomer
            };
            if (props.user){
                add_data.uid = props.user.uid
            }
            let timestamp = Math.round((reservationTime).getTime() / 1000);
        

            bookingsRef.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (doc.data().start_time.seconds === timestamp){
                        return alert('Oops! Seems like someone already reserved for this time. :(');
                    }
                });
                bookingsRef.add(add_data).then(() => {
                    goNext();
                }).catch(error => {
                    alert(error)
                })
            })
        })


    }



    const handleTimeClick = (time) =>{
        console.log(time)
        setReservationDate(time);

    }
    const handleRoomChange = (event) => {
        const roomName = event.target.value;
        setBookings([])
        setBookingsParsed(false);

        firestore().collection('stations').where('name', '==', roomName).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setBookingsRef(firestore().collection('stations/' + doc.id + '/bookings'))
                setOpenHours(doc.data().openHours)
                firestore().collection('stations/' + doc.id + '/bookings').get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        setBookings(prevState => [
                            ...prevState,
                            new Date(doc.data().start_time.seconds * 1000),

                        ])
                    })
                    setBookingsParsed(true);


                })
            });
        
        });

        goNext();
    }

    const goBack = () => {
        setCurrentStep(currentStep-1);
    }
    const goNext = () => {
        setCurrentStep(currentStep+1);
    }
    const signInRedirect = () => {
        if (props.user == null){
            return history.push('/signin');
        }
        history.push('/account');
    }

    return(
        <Fragment>
        <button className="signin-btn" onClick={signInRedirect}>{props.user == null ? "Sign in" : "Manage reservations"}</button>

        <Step1 currentStep={currentStep} handleRoomChange={handleRoomChange} roomsRef={roomsRef}></Step1>

        <Step2 currentStep={currentStep} bookingsParsed={bookingsParsed} openHours={openHours} handleTimeClick={handleTimeClick} bookings={bookings} time={reservationDate}></Step2>


        <Step3 currentStep={currentStep} user={props.user} addReservation={addReservation} nameCustomer={nameCustomer} setNameCustomer={setNameCustomer} numberCustomer={numberCustomer} setNumberCustomer={setNumberCustomer}></Step3>

        <Step4 currentStep={currentStep}></Step4>
        {
            (currentStep > 1 && currentStep < 4) &&
            <button onClick={goBack}>Back</button>
        }
        {
            (currentStep == 2 && reservationDate.length > 0) &&
            <button onClick={goNext}>Next</button>
        }

        {
            showPopupAdded === true &&
            <PopUp title="Added reservation" text="Successfully added reservation." closePopup={() => setShowPopupAdded(false)}></PopUp>
        }
        </Fragment>
    );
    
}

export default ReservationSystem;