import "./App.css";
import { Loading } from "../Reservation/Reservation";
import AdminPanel from "../AdminPanel/AdminPanel";
import SignIn from "../SignIn/SignIn";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import ReservationSystem from "../ReservationSystem/ReservationSystem";
import AccountManagement from "../AccountManagement/AccountManagement";
import { auth, firestore } from "../../helpers/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { useState, useEffect } from "react";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { AnimatedSwitch } from "react-router-transition";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(fab);

function App() {
  const [user, loading] = useAuthState(auth);
  const [wasAdminChecked, setWasAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const closeNav = () => {
    document.getElementById("sidenav").style.width = "0";
  };
  const openNav = () => {
    document.getElementById("sidenav").style.width = "min(250px, 50vw)";
  };
  useEffect(() => {
    document.title = "Reservo | Rezervačný Systém";
  }, []);
  useEffect(() => {
    if (user == null) return;

    if (wasAdminChecked == true) return;
    let userRef = firestore().collection("users").doc(user.uid);
    userRef.get().then((user) => {
      setIsAdmin(user.data().admin);
      setWasAdminChecked(true);
    });
  });

  return (
    <div className="App">
      <header className="App-header">
        {loading ? (
          <Loading type="TailSpin"></Loading>
        ) : (
          <Router>
            <div>
              <div id="sidenav" className="sidenav">
                <a
                  href="javascript:void(0)"
                  className="closebtn"
                  onClick={closeNav}
                >
                  &times;
                </a>
                <br />
                <Link to="/" onClick={() => closeNav()}>
                  Domov
                </Link>
                <br />
                {isAdmin ? (
                  <Link to="/admin" onClick={() => closeNav()}>
                    Admin
                  </Link>
                ) : null}
                <br />
                {user ? (
                  <Link to="/account" onClick={() => closeNav()}>
                    Účet
                  </Link>
                ) : (
                  <Link to="/signin" onClick={() => closeNav()}>
                    Prihlásiť
                  </Link>
                )}
              </div>
              <div className="container" onClick={openNav}>
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="bar3"></div>
              </div>

              <AnimatedSwitch
                atEnter={{ opacity: 0 }}
                atLeave={{ opacity: 0 }}
                atActive={{ opacity: 1 }}
                className="switch-wrapper"
              >
                <Route path="/admin">
                  {user && isAdmin ? (
                    <AdminPanel />
                  ) : (
                    <span>
                      Prosím prihláste sa ako administrátor na prezeranie tejto
                      stránky.
                    </span>
                  )}
                </Route>
                <Route path="/signin">
                  <SignIn user={user} />
                </Route>
                <Route path="/account">
                  {user ? <AccountManagement user={user} /> : null}
                </Route>
                <Route path="/forgot">
                  <ForgotPassword />
                </Route>
                <Route path="/">
                  <ReservationSystem user={user} />
                </Route>
              </AnimatedSwitch>
            </div>
          </Router>
        )}
      </header>
    </div>
  );
}

export default App;
