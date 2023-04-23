import "./AdminPanel.css";
import React, { useEffect, useState } from "react";

import { auth, firestore } from "../../helpers/firebase";

function ReservationRow({ id, name, number, date, rawDate }) {
    const [isExpired, setIsExpired] = useState(false);
    const [isCurrently, setIsCurrently] = useState(false);

    useEffect(() => {
        let dateParsed = new Date(rawDate);
        dateParsed.setMinutes(dateParsed.getMinutes() + 30);
        if (dateParsed < Date.now()) {
            setIsExpired(true);
        } else if (dateParsed < Date.now()) {
            setIsCurrently(true);
        }
    }, []);
    const cancelReservation = () => {
        const reservationRef = firestore()
            .collection("system")
            .doc("main")
            .collection("bookings")
            .doc(id);
        reservationRef.delete().then(() => {
            window.location.reload();
        });
    };
    if (isExpired == true) {
        return null;
    }
    return (
        <tr>
            <td>{name}</td>
            <td>{number}</td>
            <td>{date}</td>
            {isExpired ? (
                <td style={{ color: "red" }}>Skončené</td>
            ) : isCurrently ? (
                <td style={{ color: "green" }}>Momentálne</td>
            ) : (
                <td
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={cancelReservation}
                >
                    Zrušiť
                </td>
            )}
        </tr>
    );
}

function AdminPanel() {
    const [reservations, setReservations] = useState([]);
    const [nameCompany, setNameCompany] = useState("");
    const [openHours, setOpenHours] = useState([]);
    const SignOut = (e) => {
        e.preventDefault();
        auth
            .signOut()
            .then(() => {
                console.log("Signed out successfully.");
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const fetchReservations = () => {
        setReservations([]);
        const roomsRef = firestore().collection("system");
        roomsRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const reservationsRef = firestore()
                    .collection("system")
                    .doc(doc.id)
                    .collection("bookings")
                    .orderBy("start_time");
                let roomId = doc.id;
                reservationsRef.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        let reservation = doc.data();
                        const privateRef = firestore()
                            .collection("system")
                            .doc(roomId)
                            .collection("bookings")
                            .doc(doc.id)
                            .collection("private")
                            .doc("0");
                        privateRef.get().then((querySnap) => {
                            reservation.id = doc.id;
                            reservation.customer_name = querySnap.data().customer_name;
                            reservation.phone_number = querySnap.data().phone_number;
                            setReservations((prev) => [...prev, reservation]);
                        });
                    });
                });
            });
        });
    };
    const fetchSettings = () => {
        const systemRef = firestore().collection("system").doc("main");
        systemRef.get().then((doc) => {
            if (doc.exists) {
                setOpenHours(doc.data().openHours);
                setNameCompany(doc.data().nameCompany);
            }
        });
    };
    const handleChangeOpenHour = (e, idx) => {
        let old = openHours;
        old[idx] = parseInt(e.target.value);
        setOpenHours([...old]);
    };
    const saveSettings = () => {
        const systemRef = firestore().collection("system").doc("main");
        systemRef.set(
            {
                openHours: openHours,
                nameCompany: nameCompany,
            },
            { merge: true }
        );
    };
    useEffect(() => {
        fetchReservations();
        fetchSettings();
    }, []);
    return (
        <div className="admin-panel">
            <button className="signin-btn" onClick={SignOut}>
                Odhlásiť sa
            </button>
            <h2>Administrátorský panel</h2>
            <div class="settings">
                <h3>Nastavenia</h3>
                <p>Názov firmy</p>
                <input
                    type="text"
                    class="full-width"
                    value={nameCompany}
                    onChange={(e) => setNameCompany(e.target.value)}
                />
                <p>Otváracie hodiny</p>
                <span>Od</span>
                <div>
                    <input
                        class="half-width"
                        type="number"
                        min="1"
                        max="24"
                        value={openHours[0]}
                        onChange={(e) => handleChangeOpenHour(e, 0)}
                    />
                    <span>h</span>
                </div>
                <span>Do</span>
                <div>
                    <input
                        class="half-width"
                        type="number"
                        value={openHours[1]}
                        onChange={(e) => handleChangeOpenHour(e, 1)}
                    />
                    <span>h</span>
                </div>
                <button onClick={saveSettings}>Uložiť</button>
            </div>
            <span>Nasledujúce rezervácie:</span>
            <br />
            <table>
                <thead>
                    <tr>
                        <th>Meno</th>
                        <th>Číslo</th>
                        <th>Dátum</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.length > 0 &&
                        reservations.map((reservation) => (
                            <ReservationRow
                                name={reservation.customer_name}
                                id={reservation.id}
                                number={reservation.phone_number}
                                rawDate={new Date(reservation.start_time.seconds * 1000)}
                                date={new Date(
                                    reservation.start_time.seconds * 1000
                                ).toLocaleString()}
                            />
                        ))}
                </tbody>
            </table>
        </div>
    );
}
export default AdminPanel;
