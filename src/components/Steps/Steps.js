import { useState, useEffect} from 'react'
import TimeCalendar from 'react-timecalendar';
import BookingSelector from 'react-booking-selector';
import './Steps.css';
import { motion } from 'framer-motion';
import ReCaptcha from '../ReCaptcha/ReCaptcha';
import { auth, firebaseBuffer, firestore } from '../../helpers/firebase';


function Step1(props){
    const [stationNames, setStationNames] = useState([]);
    

    const loadStations = () => {
        let loadedStationNames = []
        props.roomsRef.get().then((querySnapshot) =>{
            querySnapshot.forEach((doc) => {
                loadedStationNames.push(doc.data().name)
                
            })
            setStationNames(loadedStationNames)

        })
    }
    useEffect(() => {
        loadStations();
    }, [])
    if (props.currentStep != 1){
        return null;
    }

    return(
        <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20
        }} className="step" id="step">
        <label>
            Select a room...
            <br/>
        <select name="rooms" id="rooms" onChange={props.handleRoomChange}>
            <option>Choose</option>
            {stationNames.map((station) => <option key={station}>{station}</option>)}
        </select>
        </label>
        </motion.div>
    )
}
export default Step1
function Step2(props){
    if (props.currentStep != 2 || props.openHours.length < 1 || props.bookingsParsed == false){
        return null;
    }
    

    return(
        <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20
        }}>

        <span className="step" id="step">When?</span>
        <div className="calendar">
        <BookingSelector
        selection = {props.time}
        margin="4"
        minTime = {props.openHours[0]}
        maxTime = {props.openHours[1]}
        blocked = {props.bookings}
        onChange = {props.handleTimeClick}/>
        </div>

                
        </motion.div>
    )
}

function Step3(props){
    const [allowSubmit, setAllowSubmit] = useState(false);
    useEffect(() => {
        if (props.user == null) return;
        firestore().collection(`users/${props.user.uid}/private`).doc('information').get().then((doc) => {
            if (doc.exists){
                props.setNameCustomer(doc.data().full_name);
                props.setNumberCustomer(doc.data().phone_number);
            }
        })
    }, [])
    if (props.currentStep != 3){
        return null;
    }
    const reservations = props.reservation;
    return(
        <div>
        <span>Date and Time of reservation:</span>
        <ul>
        {reservations.map((time) => <li key={time}>{time.toLocaleString()}</li>)}
        </ul>
        <label>
        Full name<br/>
        <input type="text" value={props.nameCustomer} onChange={e => props.setNameCustomer(e.target.value)}/>
        </label>
        <br/><br/>
        <label>
            Phone number<br/>
        <input type="text" value={props.numberCustomer} onChange={e => props.setNumberCustomer(e.target.value)}/>

        </label><br/>
        <ReCaptcha setAllowSubmit={setAllowSubmit} activator={props.currentStep}></ReCaptcha>
        <button id="finish" className="finish" onClick={props.addReservation} disabled={!allowSubmit}>Add reservation</button>

        </div>
    )
}

function Step4(props){
    if (props.currentStep != 4){
        return null;
    }
    return(
        <div>
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        <span className="step" id="step">Successfully added your reservation.</span><br/>
        <small>Reservation IDs: <br/>{props.ids.join(", ")}</small>
        </div>
    )
}

export {Step1, Step2, Step3, Step4};
