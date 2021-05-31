import './ReservationSystem.scss'
import React, {Fragment, useEffect, useState} from 'react'

import PopUp from '../PopUp/PopUp';

import { auth, firestore } from '../../helpers/firebase'
import {Step1, Step2, Step3, Step4}  from '../Steps/Steps'
import { useHistory } from 'react-router-dom';


function ReservationSystem(props){
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [wasTimeSelected, setWasTimeSelected] = useState(false);
    const [reservationDate, setReservationDate] = useState(new Date());
    const [nameCustomer, setNameCustomer] = useState("");
    const [numberCustomer, setNumberCustomer] = useState("");
    const [showPopupTime, setShowPopupTime] = useState(false);
    const [showPopupAdded, setShowPopupAdded] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsRef, setBookingsRef] = useState(firestore().collection('stations/0/bookings'));
    const roomsRef = firestore().collection('stations').orderBy("name")
    const history = useHistory();


    const [currentStep, setCurrentStep] = useState(1);


    //TODO: change in firestore to make private sub collection so there are no security issues....


    const addReservation = () => {
        if (/^\d{10}$/.test(numberCustomer) === false){
            return alert("Incorrect phone number. (Correct example: 0944111985)")
        }
        if (wasTimeSelected === false){
            return alert("Please select date and time.")
        }
        if (nameCustomer.length <= 0){
            return alert("Please enter your name.")
        }
        if (numberCustomer.length <= 0){
            return alert("Please enter your phone number.")
        }
        var end = new Date(reservationDate);
        end.setMinutes(end.getMinutes() + 30)
        let add_data = {
            start_time: reservationDate,
            end_time: end,
            customer_name: nameCustomer,
            phone_number: numberCustomer
        };
        if (props.user){
            add_data.uid = props.user.uid
        }
        //check if exists
        let found_counter = 0;
        let timestamp = Math.round((reservationDate).getTime() / 1000);
        

        bookingsRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.data())
                if (doc.data().start_time.seconds === timestamp){
                    return alert('Oops! Seems like someone already reserved for this time. :(');
                }
            });

            bookingsRef.add(add_data).then((docRef) => { 
                goNext();
            })

        })

    }

    let time = new Date(reservationDate).toLocaleString()

    const handleTimeClick = (time) =>{
        setReservationDate(time);
        setWasTimeSelected(true);
        setShowDatePicker(false);//close date picker
        setShowPopupTime(true);
        goNext()
    }
    const handleRoomChange = (event) => {
        const roomName = event.target.value;
        setBookings([])
        

        firestore().collection('stations').where('name', '==', roomName).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setBookingsRef(firestore().collection('stations/' + doc.id + '/bookings'))
                firestore().collection('stations/' + doc.id + '/bookings').get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if (bookings.indexOf(doc.id) != -1) return;
                        setBookings([
                            ...bookings,
                            {
                                id: doc.id,
                                start_time: new Date(doc.data().start_time.seconds * 1000),
                                end_time: new Date(doc.data().end_time.seconds * 1000)
                            }
                        ])
                    })
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

        <Step2 currentStep={currentStep} handleTimeClick={handleTimeClick} wasTimeSelected={wasTimeSelected} bookings={bookings} time={time} showDatePicker={showDatePicker}></Step2>

        <Step3 currentStep={currentStep} nameCustomer={nameCustomer} setNameCustomer={setNameCustomer} numberCustomer={numberCustomer} setNumberCustomer={setNumberCustomer}></Step3>

        <Step4 currentStep={currentStep}></Step4>
        {
            (currentStep > 1 && currentStep < 4) &&
            <button onClick={goBack}>Back</button>
        }
        {
            currentStep === 3 &&
            <button id="finish" className="finish" onClick={addReservation}>Add reservation</button>
        }

        {
            showPopupTime === true &&
            <PopUp title="Selected time" text={time} closePopup={() => setShowPopupTime(false)}></PopUp>
        }
        {
            showPopupAdded === true &&
            <PopUp title="Added reservation" text="Successfully added reservation." closePopup={() => setShowPopupAdded(false)}></PopUp>
        }
        </Fragment>
    );
    
}

export default ReservationSystem;