import React from 'react'

import './SignIn.css'
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useState, useEffect } from 'react';
import ReCaptcha from '../ReCaptcha/ReCaptcha';
import { auth, firestore, firebaseBuffer } from '../../helpers/firebase'

function SignIn(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [allowSubmit, setAllowSubmit] = useState(false);
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
    const SignInWithGoogle = e => {
        let provider = new firebaseBuffer.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
        .then((result) => {
            console.log(result.user)
            let userRef = firestore().collection('users').doc(result.user.uid)
            userRef.set({
                admin: false,
            })
        }).catch((error) => {
            alert(error);
        })
    }
    const SignInWithFacebook = e => {
        let provider = new firebaseBuffer.auth.FacebookAuthProvider();
        auth.signInWithPopup(provider)
        .then((result) => {
            console.log(result.user)
            let userRef = firestore().collection('users').doc(result.user.uid)
            userRef.set({
                admin: false,
            })
        }).catch((error) => {
            alert(error);
        })
    }
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
                <ReCaptcha setAllowSubmit={setAllowSubmit}></ReCaptcha>
                <button onClick={SignUp} disabled={!allowSubmit}>Sign up</button>
                <button onClick={SignIn} disabled={!allowSubmit}>Sign in</button><br/>
                <a className="forgot" onClick={() => history.push("/forgot")}>Forgot password?</a>
                <div className="separator">OR</div>
                <button onClick={SignInWithGoogle}><FontAwesomeIcon icon={['fab', 'google']} /> Sign in with Google</button><br/>
                <button onClick={SignInWithFacebook}><FontAwesomeIcon icon={['fab', 'facebook']}/> Sign in with Facebook</button>

            </div>
        
    );
}
export default SignIn