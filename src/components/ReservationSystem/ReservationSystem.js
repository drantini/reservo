import './ReservationSystem.scss'
import React, {Fragment, useEffect, useState} from 'react'

import PopUp from '../PopUp/PopUp';

import { auth, firestore } from '../../helpers/firebase'
import {Step1, Step2, Step3, Step4}  from '../Steps/Steps'


function ReservationSystem(props){
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [wasTimeSelected, setWasTimeSelected] = useState(false);
    const [reservationDate, setReservationDate] = useState(new Date());
    const [nameCustomer, setNameCustomer] = useState("");
    const [numberCustomer, setNumberCustomer] = useState("");
    const [showPopupTime, setShowPopupTime] = useState(false);
    const [showPopupAdded, setShowPopupAdded] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [stationNames, setStationNames] = useState([]);
    const [bookingsRef, setBookingsRef] = useState(firestore().collection('stations/0/bookings'));
    const roomsRef = firestore().collection('stations').orderBy("name")


    const [currentStep, setCurrentStep] = useState(1);
    

    useEffect(() => {
            roomsRef.get().then((querySnapshot) =>{
                querySnapshot.forEach((doc) => {
                    if (stationNames.indexOf(doc.data().name) != -1) return;
                    setStationNames([
                        ...stationNames,
                        doc.data().name
                    ])
                })
            })
        

    })

    const addReservation = () => {
        if (/^\d{10}$/.test(numberCustomer) == false){
            return alert("Incorrect phone number. (Correct example: 0944111985)")
        }
        if (wasTimeSelected == false){
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
        //check if exists
        let found_counter = 0;
        let timestamp = Math.round((reservationDate).getTime() / 1000);


        bookingsRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().start_time.seconds == timestamp){
                    found_counter++;
                }
            });
            //explanation for this shit code:
            //for some reason, it still executes even if i return on the if bla bla
            //This sanity checks should happen rarely though
            if (found_counter < 2){
                bookingsRef.add(add_data).then((docRef) => { 
                    goNext();
                })
            }else{
                alert('There is already reservation for this time.')
            }
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
    return(
        <Fragment>


        <Step1 currentStep={currentStep} handleRoomChange={handleRoomChange} stationNames={stationNames}></Step1>

        <Step2 currentStep={currentStep} handleTimeClick={handleTimeClick} wasTimeSelected={wasTimeSelected} bookings={bookings} time={time} showDatePicker={showDatePicker}></Step2>

        <Step3 currentStep={currentStep} nameCustomer={nameCustomer} setNameCustomer={setNameCustomer} numberCustomer={numberCustomer} setNumberCustomer={setNumberCustomer}></Step3>

        <Step4 currentStep={currentStep}></Step4>
        {
            (currentStep > 1 && currentStep < 4) &&
            <button onClick={goBack}>Back</button>
        }
        {
            currentStep == 3 &&
            <button id="finish" className="finish" onClick={addReservation}>Add reservation</button>
        }

        {
            showPopupTime == true &&
            <PopUp title="Selected time" text={time} closePopup={() => setShowPopupTime(false)}></PopUp>
        }
        {
            showPopupAdded == true &&
            <PopUp title="Added reservation" text="Successfully added reservation." closePopup={() => setShowPopupAdded(false)}></PopUp>
        }
        </Fragment>
    );
    
}

export default ReservationSystem;