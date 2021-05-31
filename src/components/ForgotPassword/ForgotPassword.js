
import { auth, firestore } from '../../helpers/firebase'
import { useState } from "react";
function ForgotPassword(props){
    const [email, setEmail] = useState('');
    const resetPassword = () => {
        auth.sendPasswordResetEmail(email).then(() => {
            alert("Check your email address to continue process.")
        }).catch((error) => {
            alert(error)
        })
    }
    const keyLogin = (e) => {
        if (e.key === 'Enter'){
            resetPassword();
        }
    }
    return(
        <div>
            <label>
                Email associated with account<br></br>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={keyLogin}/>
            </label>
            <br/>
            <button onClick={resetPassword}>Reset password</button>
        </div>
    )
}
export default ForgotPassword;