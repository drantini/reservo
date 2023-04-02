import "./ReservationSystem.css";
import React, { Fragment, useEffect, useState } from "react";
import PopUp from "../PopUp/PopUp";

import { firestore } from "../../helpers/firebase";
import { Step1, Step2, Step3 } from "../Steps/Steps";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
function isInArray(array, value) {
    return !!array.find((item) => {
        return item.getTime() == value.getTime();
    });
}

function ReservationSystem(props) {
    const [reservationDate, setReservationDate] = useState([]);
    const [nameCustomer, setNameCustomer] = useState("");
    const [numberCustomer, setNumberCustomer] = useState("");
    const [bookings, setBookings] = useState([]);
    const [bookingsParsed, setBookingsParsed] = useState(false);
    const [bookingsRef, setBookingsRef] = useState(
        firestore().collection("system/0/bookings")
    );
    const [nameCompany, setNameCompany] = useState("");
    const [openHours, setOpenHours] = useState([]);
    const [reservationIds, setReservationIds] = useState([]);
    const history = useHistory();

    const [currentStep, setCurrentStep] = useState(1);

    const addReservation = () => {
        if (/^\d{10}$/.test(numberCustomer) === false) {
            return alert("Neplatné číslo. (Príklad správneho formátu: 0944111985)");
        }
        if (reservationDate.length == 0) {
            return alert("Prosím vyber datum a čas rezervácie.");
        }
        if (nameCustomer.length <= 0) {
            return alert("Prosím napíš meno.");
        }
        if (numberCustomer.length <= 0) {
            return alert("Prosím napíš číslo.");
        }

        reservationDate.forEach((reservationTime) => {
            var end = new Date(reservationTime);
            end.setMinutes(end.getMinutes() + 30);
            let add_data = {
                start_time: reservationTime,
                end_time: end,
            };
            let private_data = {
                customer_name: nameCustomer,
                phone_number: numberCustomer,
            };
            if (props.user) {
                add_data.uid = props.user.uid;
            }
            let timestamp = Math.round(reservationTime.getTime() / 1000);

            bookingsRef.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (doc.data().start_time.seconds === timestamp) {
                        return alert(
                            "Ups! Vyzerá to tak že už niekto má rezerváciu na tento čas. :("
                        );
                    }
                });
                bookingsRef
                    .add(add_data)
                    .then((docRef) => {
                        setReservationIds((prevState) => [...prevState, docRef.id]);
                        docRef.collection("private").doc("0").set(private_data);
                    })
                    .catch((error) => {
                        alert(error);
                    });
            });
        });
        setTimeout(() => {
            if (props.user && props.user.email) {
                //idk?
            }
            goNext();
        }, 600);
    };

    const handleTimeClick = (time) => {
        let contains = false;
        time.forEach((chunk) => {
            console.log(chunk < new Date(Date.now()));
            if (isInArray(bookings, chunk) || chunk < new Date(Date.now())) {
                contains = true;
            }
        });
        //not the greatest solution, but will do
        if (contains == true) return;
        setReservationDate(time);
    };
    const fetchRoom = () => {
        setBookings([]);
        setBookingsParsed(false);

        firestore()
            .collection("system")
            .doc("main")
            .get()
            .then((querySnapshot) => {
                let data = querySnapshot.data();
                let id = querySnapshot.id;
                setOpenHours(data.openHours);
                setNameCompany(data.nameCompany);
                setBookingsRef(firestore().collection("system/" + id + "/bookings"));

                firestore()
                    .collection("system/" + id + "/bookings")
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            setBookings((prevState) => [
                                ...prevState,
                                new Date(doc.data().start_time.seconds * 1000),
                            ]);
                        });

                        setBookingsParsed(true);
                    });
            });
    };

    const goBack = () => {
        setCurrentStep(currentStep - 1);
    };
    const goNext = () => {
        setCurrentStep(currentStep + 1);
    };
    const signInRedirect = () => {
        if (props.user == null) {
            return history.push("/signin");
        }
        history.push("/account");
    };

    useEffect(() => {
        fetchRoom();
    }, []);
    return (
        <Fragment>
            <button className="signin-btn" onClick={signInRedirect}>
                {props.user == null ? "Prihlásiť sa" : "Môj účet"}
            </button>

            <h1>{nameCompany}</h1>
            <Step1
                currentStep={currentStep}
                bookingsParsed={bookingsParsed}
                openHours={openHours}
                handleTimeClick={handleTimeClick}
                bookings={bookings}
                time={reservationDate}
            ></Step1>

            <Step2
                currentStep={currentStep}
                reservation={reservationDate}
                user={props.user}
                addReservation={addReservation}
                nameCustomer={nameCustomer}
                setNameCustomer={setNameCustomer}
                numberCustomer={numberCustomer}
                setNumberCustomer={setNumberCustomer}
            ></Step2>

            <Step3 currentStep={currentStep} ids={reservationIds}></Step3>
            {currentStep > 1 && currentStep < 3 && (
                <motion.button
                    className="arrow-button left-arrow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={goBack}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    &laquo;
                </motion.button>
            )}
            {currentStep < 2 && reservationDate.length > 0 && (
                <motion.button
                    className="arrow-button right-arrow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={goNext}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    &raquo;
                </motion.button>
            )}
        </Fragment>
    );
}

export default ReservationSystem;
