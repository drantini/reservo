import { auth, firestore } from '../../helpers/firebase'
import './AccountManagement.css'
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import Popover from '../Popover/Popover';

function Row(props){
    const [isExpired, setIsExpired] = useState(false);
    const [isCurrently, setIsCurrently] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(props.name);
    const [number, setNumber] = useState(props.number);


    useEffect(() => {
        let date = props.rawDate;
        date.setMinutes(date.getMinutes() + 30);
        if (date < Date.now()){
            setIsExpired(true);
        }else if(new Date(props.rawDate) < Date.now()){
            setIsCurrently(true);
        }
    }, [])

    const openPopover = () => {
        setIsOpen(true);
    }

    const editReservation = () => {
        firestore().collection(`stations/${props.roomId}/bookings`).doc(props.deleteId).collection('private').doc('0').update({
            customer_name: name,
            phone_number: number
        }).then(() => {
            setTimeout(() => {
                props.fetch();
                setIsOpen(false)
            }, 400)
        }).catch((error) => {
            alert(error);
        })
    }

    const cancelReservation = () => {
        if(window.confirm("Naozaj chcete zrušiť rezerváciu?")){
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
        <>
        <tr>
            <td>{props.name}</td>
            <td>{props.number}</td>
            <td>{props.date}</td>
            {isExpired ? <td style={{color: 'red'}}>Skončené</td> : 
            isCurrently ? <td style={{color: 'green'}}>Momentálne</td> : 
            <div>
                <td onClick={openPopover} style={{cursor: 'pointer', textDecoration: 'underline'}}>Upraviť</td>
                <td onClick={cancelReservation} style={{cursor: 'pointer', textDecoration: 'underline'}}>Zrušiť</td>
            </div>}

        </tr>
        
        <Popover isOpen={isOpen} setIsOpen={setIsOpen}>
            <span>Zmena údajov</span>
            <br/>
            <label>
            Celé meno<br/>
            <input type="text" value={name} onChange={e => setName(e.target.value)}/>
            </label>
            
            <label>
            Telefónne číslo<br/>
            <input type="text" value={number} onChange={e => setNumber(e.target.value)}/>
            </label>
            <button onClick={editReservation}>Aktualizovať</button>
        </Popover>
        </>
    )
}

function AccountManagement(props){
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [userReservations, setUserReservations] = useState([]);
    const [displayReservations, setDisplayReservations] = useState([]);
    const [displayOld, setDisplayOld] = useState(false);
    const history = useHistory();

    const SignOut = e => {
        e.preventDefault();
        auth.signOut().then(() => {
            history.push("/")
        }).catch((e) => {
            console.log(e);
        });
        
    }
    const fetchReservations = () => {
        setUserReservations([]);
        firestore().collection(`stations/main/bookings`).where("uid", "==", props.user.uid).get().then((querySnapshot) => {
            
            querySnapshot.forEach(async (doc) => {
                let reservation = {};
                reservation = doc.data();
                reservation.roomId = 'main';
                reservation.deleteId = doc.id;
                let result = await firestore().doc(`stations/main/bookings/${doc.id}/private/0`).get();
                reservation.customer_name = result.data().customer_name;
                reservation.phone_number = result.data().phone_number;
                setUserReservations(prev => [...prev, reservation]);
                
                
                
            })
        })

        
    }
    const deletePersonalInformation = () => {
        firestore().collection(`users/${props.user.uid}/private`).doc('information').delete().then(() => {
            alert("Osobné údaje úspešne zmazané.");
            setFullName("");
            setPhoneNumber("");
        }).catch((error) => {
            alert(error);
        })
    }
    const updatePersonalInformation = () => {
        firestore().collection(`users/${props.user.uid}/private`).doc('information').set({
            full_name: fullName,
            phone_number: phoneNumber
        }).then(() => {
            alert("Osobné údaje úspešne zmenené.");
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
    useEffect(() => {
            setDisplayReservations(userReservations.filter((reservation) => {
                let reservationDate = new Date(reservation.start_time.seconds*1000)
                let currentDate = new Date();
                if (displayOld){
                    return true;
                }else{
                    return reservationDate > currentDate;
                }
            }))
        
    }, [displayOld])

    if (props.user == null){
        return null
    }
    return(
        <div className="account">
            <button className="signin-btn" onClick={SignOut}>Odhlásiť sa</button>
            <div className="personal-info">
                <span>Osobné údaje</span>
                <small>(Vyplňte tieto údaje pre urýchlenie budúcich rezervacií)</small><br/>
                <span>Celé meno</span>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}></input>

                <span>Telefónne číslo</span>
                <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}></input>
                
                <div>
                {fullName.length > 0 && phoneNumber.length > 0 && <button className="ghost" onClick={deletePersonalInformation}>Zmazať</button>}
                <button onClick={updatePersonalInformation}>Aktualizovať</button>
                </div>
            </div>
            <span className="text-medium">Tvoje rezervácie</span>
            <span>
            <input type="checkbox" checked={displayOld} onChange={e => setDisplayOld(e.target.checked)}></input>
            Zobrazovať staré rezervácie
            </span>
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
                {displayReservations.map((data) => <Row key={data.deleteId} name={data.customer_name} number={data.phone_number} rawDate={new Date(data.start_time.seconds*1000)} date={new Date(data.start_time.seconds*1000).toLocaleString()} room={data.room} deleteId={data.deleteId} roomId={data.roomId} fetch={fetchReservations}></Row>)}
                </tbody>
            </table>
        </div>
    )
}

export default AccountManagement;