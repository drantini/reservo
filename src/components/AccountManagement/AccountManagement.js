import { auth, firestore } from '../../helpers/firebase'
import './AccountManagement.css'
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'


function Row(props){
    const [isExpired, setIsExpired] = useState(false);
    const [isCurrently, setIsCurrently] = useState(false);

    useEffect(() => {
        let date = new Date(props.date)
        date.setMinutes(date.getMinutes() + 30);
        if (date < Date.now()){
            setIsExpired(true);
        }else if(new Date(props.date) < Date.now()){
            setIsCurrently(true);
        }
        console.log(props)
    }, [])
    const cancelReservation = () => {
        if(window.confirm("Are you sure you want to remove this reservation?")){
            firestore().collection(`stations/${props.roomId}/bookings`).doc(props.deleteId).delete().then(() => {
                setTimeout(() =>{
                    props.fetch()

                }, 1000)
            }).catch((error) => {
                alert(error);
            })
        }
        
    }

    return(
        <tr>
            <td>{props.name}</td>
            <td>{props.number}</td>
            <td>{props.date}</td>
            {isExpired ? <td style={{color: 'red'}}>Expired</td> : isCurrently ? <td style={{color: 'green'}}>Currently</td> : <td onClick={cancelReservation} style={{cursor: 'pointer', textDecoration: 'underline'}}>Cancel</td>}
        </tr>
    )
}

function AccountManagement(props){
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [userReservations, setUserReservations] = useState([]);
    const history = useHistory();

    const SignOut = e => {
        e.preventDefault();
        auth.signOut().then(() => {
            history.push("/")
            console.log("Signed out successfully.")
        }).catch((e) => {
            console.log(e);
        });
        
    }
    const fetchReservations = () => {
        console.log("fetchReservations")
        setUserReservations([]);
        let rooms = [];
        let roomIds = [];
        firestore().collection('stations').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                rooms.push(doc.data().name);
                roomIds.push(doc.id);
            })
            for(let i=0; i<roomIds.length; i++){
                firestore().collection(`stations/${roomIds[i]}/bookings`).where("uid", "==", props.user.uid).get().then((querySnapshot) => {
                    let reservation = {};

                    querySnapshot.forEach((doc) => {
                        reservation = doc.data();
                        firestore().doc(`stations/${roomIds[i]}/bookings/${doc.id}/private/0`).get().then((querySnap) => {
                            reservation.customer_name = querySnap.data().customer_name;
                            reservation.phone_number = querySnap.data().phone_number;
                        
                            setUserReservations(prev => [...prev, reservation])
                        })
                        
                    })

                })

            }
            

        })



    }
    const updatePersonalInformation = () => {
        firestore().collection(`users/${props.user.uid}/private`).doc('information').set({
            full_name: fullName,
            phone_number: phoneNumber
        }).then(() => {
            alert("Updated personal information successfully.");
        }).catch((error) => {
            alert(error);
        })
    }
    useEffect(() => {
        setTimeout(() => {
            if (props.user == null){
                history.push("/signin")
            }
        }, 1000)
        firestore().collection(`users/${props.user.uid}/private`).doc('information').get().then((doc) => {
            if (doc.exists){
                setFullName(doc.data().full_name);
                setPhoneNumber(doc.data().phone_number);
            }
        })
        fetchReservations();
    }, [])
    if (props.user == null){
        return null
    }
    return(
        <div className="account">
            <button className="signin-btn" onClick={SignOut}>Sign out</button>
            <div className="personal-info">
                <span>Personal information</span>
                <small>(Fill in this information to speed up reservation process.)</small><br/>
                <span>Full name</span>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}></input>

                <span>Phone number</span>
                <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}></input>
                
                <button onClick={updatePersonalInformation}>Update</button>
            </div>
            <span className="text-medium">Your reservations</span>
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
                {userReservations.map((data) => <Row key={data.delete_id} name={data.customer_name} number={data.phone_number} date={new Date(data.start_time.seconds*1000).toLocaleString()} room={data.room} deleteId={data.delete_id} roomId={data.roomId} fetch={fetchReservations}></Row>)}
                </tbody>
            </table>
        </div>
    )
}

export default AccountManagement;