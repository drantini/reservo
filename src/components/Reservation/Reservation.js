import { useState, useEffect } from 'react';
import Loader from "react-loader-spinner";
import {motion} from "framer-motion";

function Loading(props){
    return(
        <div>
            <Loader type={props.type != null ? props.type : "Puff"} color="#00BFFF"
            height={90}
            width={90}
            timeout={93000}>

            </Loader>
        </div>
    )
}
export {Loading};
function Reservation(props){
    const [resolved, setResolved] = useState(false);
    const [currently, setCurrently] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [bookingId, setBookingId] = useState("");
    const bookingsRef = props.bookingRef;
    let time = new Date(props.start.seconds * 1000).toLocaleString()
    const setReservationId = () => {
        bookingsRef.get().then((querysnap) => {
            querysnap.forEach((doc) => {
                if(doc.data().start_time.seconds == props.start.seconds){
                    return setBookingId(doc.id)
                }
            });
        })
    }

    
    const cancelReservation = (show) => {
        setShowLoading(true);
        bookingsRef.doc(bookingId).delete().then(() => {
            setShowLoading(false);
            if (show)
                alert("Removed reservation.");
            //setResolved(true);
        }).catch((error) => {
            console.log(error)
            if (show)
                alert("Error occured. (" + error + ")");
        })
    }
    useEffect(() => {
        if (new Date((props.start.seconds * 1000)+1800000) < Date.now() && bookingsRef && bookingId){
            //cancelReservation(false);
            setResolved(true);
        }
        else if (new Date(props.start.seconds * 1000) < Date.now()){
            setCurrently(true);
        }    
        setShowLoading(false)
    }, [bookingId])
    useEffect(() => {
        setShowLoading(true)
        setReservationId()
    }, [])



    return(
        resolved == false &&
        <motion.div         
        initial={{ opacity: 0, width: "0", height: "0" }}
        animate={{ opacity: 1,  height: "auto", width: "auto" }}
        exit={{ opacity: 0, width: "0", height: "0" }}>
            {
                showLoading ? <Loading text="Removing... This might take a while." className="reservation" type="TailSpin"></Loading> :
            <div id="reservation" className="reservation">

                {
                    bookingId != "" &&
                    <button className="cancel" onClick={() => cancelReservation(true)}>X</button>

                }
                {
                    currently == true &&
                    <span id="currently" className="currently">RIGHT NOW</span>
                }
                <span>{props.name}</span>
                <span>{props.phone_number}</span>
                <span>{time}</span>
            </div>
            }
        </motion.div>
    )
}
export default Reservation;