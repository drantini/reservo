import React from 'react'

import './SignIn.css'
import { useHistory } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { auth, firestore } from '../../helpers/firebase'

function SignIn(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const SignIn = e => {
        auth
        .signInWithEmailAndPassword(email, password)
        .then(res => {
          history.push("/");
          console.log(`Logged in: ${res}`)
        }).catch(e => {
            alert(e)
        })

    };
    const SignUp = e => {
        e.preventDefault();
        auth.
        createUserWithEmailAndPassword(email, password)
        .then(res => {
            let userRef = firestore().collection('users').doc(res.user.uid)
            userRef.set({
                admin: false,
            })
            history.push("/");

            console.log(`Registered: ${res}`)
        }).catch(e => {
            alert(e);
        })
    }
    useEffect(() => {
        setTimeout(() => {
            if (props.user != null){
                history.push("/account")
            }
        }, 1000)
    })

    const keyLogin = (e) => {
        if (e.key === 'Enter'){
            SignIn();
        }
    }
    return(
        
            <div className="login">
                <label>
                    Email <br></br>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={keyLogin}/>
                </label>
                <br></br>
                <label>
                    Password <br></br>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={keyLogin}/>
                </label>
                <br></br>
                <button onClick={SignUp}>Sign up</button>
                <button onClick={SignIn}>Sign in</button><br/>
                <a className="forgot" onClick={() => history.push("/forgot")}>Forgot password?</a>

            </div>
        
    );
}
export default SignIn