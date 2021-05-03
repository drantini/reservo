import React from 'react'

import './SignIn.css'

import { useState } from 'react';
import { auth, firestore } from '../../helpers/firebase'

function SignIn(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const SignIn = e => {
        e.preventDefault();
        auth()
        .signInWithEmailAndPassword(email, password)
        .then(res => {
          console.log(`Logged in: ${res}`)
        }).catch(e => {
            alert(e)
        })

    };

    return(
        
            <div className="login">
                <label>
                    Email <br></br>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)}/>
                </label>
                <br></br>
                <label>
                    Password <br></br>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                </label>
                <br></br>
                <button onClick={SignIn}>Sign in</button>
            </div>
        
    );
}
export default SignIn