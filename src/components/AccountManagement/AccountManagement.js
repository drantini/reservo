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
            <td>{props.room}</td>
            {isExpired ? <span style={{color: 'red'}}>Expired</span> : isCurrently ? <span style={{color: 'green'}}>Currently</span> : <td onClick={cancelReservation} style={{cursor: 'pointer', textDecoration: 'underline'}}>Cancel</td>}
        </tr>
    )
}

function AccountManagement(props){
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
        let loadedReservations = []
        let rooms = [];
        let roomIds = [];
        firestore().collection('stations').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                rooms.push(doc.data().name);
                roomIds.push(doc.id);
            })
            for(let i=0; i<roomIds.length; i++){
                firestore().collection(`stations/${roomIds[i]}/bookings`).where("uid", "==", props.user.uid).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        loadedReservations.push({
                            name: doc.data().customer_name, 
                            number: doc.data().phone_number,
                            date: new Date(doc.data().start_time.seconds*1000),
                            room: rooms[i],
                            roomId: roomIds[i],
                            delete_id: doc.id
                        })
                        
                    })

                })

            }
            setTimeout(() => {

                setUserReservations(loadedReservations)

            }, 750)

        })



    }
    useEffect(() => {
        setTimeout(() => {
            if (props.user == null){
                history.push("/signin")
            }
        }, 1000)
        fetchReservations();
    }, [])
    if (props.user == null){
        return null
    }
    return(
        <div>
            <button className="signin-btn" onClick={SignOut}>Sign out</button>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Number</th>
                    <th>Date of start</th>
                    <th>Room</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {userReservations.map((data) => <Row key={data.delete_id} name={data.name} number={data.number} date={data.date.toLocaleString()} room={data.room} deleteId={data.delete_id} roomId={data.roomId} fetch={fetchReservations}></Row>)}
                </tbody>
            </table>
        </div>
    )
}

export default AccountManagement;