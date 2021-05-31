import './App.css';
import AdminPanel from '../AdminPanel/AdminPanel'
import SignIn from '../SignIn/SignIn'
import ForgotPassword from '../ForgotPassword/ForgotPassword'
import ReservationSystem from '../ReservationSystem/ReservationSystem'
import AccountManagement from '../AccountManagement/AccountManagement'
import { auth, firestore } from '../../helpers/firebase'
import { useAuthState } from 'react-firebase-hooks/auth';

import { useTitle } from '../../helpers/hooks/setTitle';
import { useState, useEffect } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Link
} from "react-router-dom";

import { AnimatedSwitch } from 'react-router-transition';


function App() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  useTitle('Reservo')

  const closeNav = () =>{
    document.getElementById('sidenav').style.width = "0";
  }
  const openNav = () =>{
    document.getElementById('sidenav').style.width = "250px";
  }
  useEffect(() => {
    if (user == null) return;
    let userRef = firestore().collection('users').doc(user.uid)
    userRef.get().then(user => {
      setIsAdmin(user.data().admin);
    
    })
  })

  return (
    <div className="App">

      <header className="App-header">
        <Router>
        <div>
          <div id="sidenav" className="sidenav">
            <a href="javascript:void(0)" class="closebtn" onClick={closeNav}>&times;</a>
            <br/>
            <Link to="/">Home</Link>
            <br/>
            {isAdmin ? <Link to="/admin">Admin</Link> : null}
            <br/>
            {user? <Link to="/account">Account</Link> : <Link to="/signin">Sign in</Link>}

          </div>
          <div class="container" onClick={openNav}>
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
          </div> 
          

          <AnimatedSwitch 
            atEnter={{ opacity: 0 }}
            atLeave={{ opacity: 0 }}
            atActive={{ opacity: 1 }}
            className="switch-wrapper">
            <Route path="/admin">
            {user && isAdmin ? <AdminPanel/> : <span>Please sign in as administrator to see contents.</span>}
            </Route>
            <Route path="/signin">
              <SignIn user={user}/>
            </Route>
            <Route path="/account">
              {user ? <AccountManagement user={user}/> : null}
            </Route>
            <Route path="/forgot">
              <ForgotPassword/>
            </Route>
            <Route path="/">
              <ReservationSystem user={user}/>
            </Route>


          </AnimatedSwitch>

        </div>
        </Router>
        
      </header>
    </div>
  );
}


export default App;
