// import React from "react";
// import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
// import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
// import "./App.css";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


import Sidebar from "./components/sidebar"
import UserSidebar from "./components/usersidebar"
import Login from "./components/login_component";
import SignUp from "./components/signup_component";
import UserDetails from "./components/userDetails";
import Admin from "./components/admin_component";
import Publichome from "./components/publichome";
import UserHome from "./components/userHome";
import image from './fda-logo.png'
import Home from './components/welcome_component'
import AdminHome from './components/adminHome'
import Dashboard from "./components/adminwelcome";
import UserDashboard from "./components/userwelcome"
import UserNav from "./components/usernavbar";
import AdminNav from "./components/adminnavbar"
import AdminApplicationView from "./components/adminviewapplication"
import AdminUpdate from "./components/adminupdate"
import UserApplicationStatus from "./components/userapplicationstatus"
import UserApplicationViewStatus from "./components/userapplicationviewstatus"

function App() {
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  return (
    <Router>
      <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
          <div className="container-fluid">
          <img src={image}  alt='FDA' className="imageLogo"/>
            <Link className="navbar-brand" to={'/home'}>
              FOOD AND DRUG ADMINISTRATION
            </Link>
            <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
              <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                  <Link className="nav-link" to={'/sign-in'}>
                    Manufacturer Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/sign-up'}>
                    SignUp
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/publichome'}>
                    Public search
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/admin'}>
                    Admin login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <Routes>
          <Route
            exact
            path="/"
            element={isLoggedIn == "true" ? <UserDetails /> : <Login />}
          />
          <Route path="/home" element={<Home />} />
          <Route path="/sign-in" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/publichome" element={<Publichome />} />
          <Route path="/userDetails" element={<UserDetails />} />
          <Route path="/userHome" element={<UserHome />} />
          <Route path="/adhome/:drugName" element={< AdminHome/>} />
          <Route path="/adwelcome" element={< Dashboard/>} />
          <Route path="/userwelcome" element={< UserDashboard/>} />
          <Route path="/sidebar" element={< Sidebar/>} />
          <Route path="/usersidebar" element={< UserSidebar/>} />
          <Route path="/usernav" element={< UserNav/>} />
          <Route path="/adnav" element={< AdminNav/>} />
          <Route path="/adview" element={< AdminApplicationView/>} />
          <Route path="/update-reject" element={<AdminUpdate/>}/>
          <Route path="/userapplicationstatus" element={<UserApplicationStatus/>}/>
          <Route path="/userapplicationviewstatus" element={<UserApplicationViewStatus/>}/>

        </Routes>
      </div>
    </Router>
  );
}

export default App;