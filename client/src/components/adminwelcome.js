import React, { Component, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "./sidebar";
import AdminNav from "./adminnavbar"

export default function Dashboard() {
  return (
    
    <div className="auth-wrapper">
        <div className="container-fluid bg-black" style={{ height: 'auto' }}>
            <div className="row">
                <div className="col-2 bg-white" style={{ height: 'auto' }}>
                     <Sidebar/>
                </div>
                <div className="col-auto">
                  <AdminNav/>
                </div>
            </div>
     </div>
    </div>
      
  );
}
