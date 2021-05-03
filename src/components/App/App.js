import './App.css';
import AdminPanel from '../AdminPanel/AdminPanel'
import SignIn from '../SignIn/SignIn'
import ReservationSystem from '../ReservationSystem/ReservationSystem'
import { auth, firestore } from '../../helpers/firebase'

import { useAuthState } from 'react-firebase-hooks/auth';

import { useTitle } from '../../helpers/hooks/setTitle';
import { useState } from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";



function App() {
  const [user] = useAuthState(auth());

  useTitle('Reservo')

  const closeNav = () =>{
    document.getElementById('sidenav').style.width = "0";
  }
  const openNav = () =>{
    document.getElementById('sidenav').style.width = "250px";
  }

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
            <Link to="/admin">Admin</Link>


          </div>
          <div class="container" onClick={openNav}>
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
          </div> 
          

          <Switch>
            <Route path="/admin">
            {user ? <AdminPanel/> : <SignIn/>}
            </Route>
            <Route path="/">
              <ReservationSystem/>
            </Route>
          </Switch>
        </div>
        </Router>
        
      </header>
    </div>
  );
}


export default App;
