import React, { Component, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserSidebar from "./usersidebar";
import UserNav from "./usernavbar";
import UserHome from "./userHome";

export default function Dashboard({ userData }) {
  return (
    
    <div className="auth-wrapper">
        <div className="container-fluid bg-black" style={{ height: 'auto' }}>
            <div className="row">
                <div className="col-2 bg-white" style={{ height: 'auto' }}>
                     <UserSidebar/>
                </div>
                <div className="col-auto">
                    <UserNav/>
                </div>
            </div>
     </div>
    </div>
      
  );
}
