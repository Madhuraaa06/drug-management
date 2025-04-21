import React, { Component, useEffect, useState } from "react";
import "../sidebar.css";
import { Link } from "react-router-dom";



function Sidebar() {
    return (
        <div className='sidebar p-0'>
            <div className='text-white text-center py-2'>
                <h5 className='mb-0'>FOOD AND DRUG ADMINISTRATION</h5>
            </div>
            <div className='list-group list-group-flush'>
                <a className='list-group-item py-3 border-0'>
                    <Link to="/adwelcome" className="text-decoration-none text-dark d-flex align-items-center">
                        <i className='bi bi-house-door fs-5 me-3'></i>
                        <span>Home</span>
                    </Link>
                </a>

                <a className='list-group-item py-3 border-0'>
                    <Link to="/admetrics" className="text-decoration-none text-dark d-flex align-items-center">
                        <i className='bi bi-speedometer2 fs-5 me-3'></i>
                        <span>Dashboard</span>
                    </Link>
                </a>

                <a className='list-group-item py-3 border-0'>
                    <Link to="/adview" className="text-decoration-none text-dark d-flex align-items-center">
                        <i className='bi bi-table fs-5 me-3'></i>
                        <span>View Applications</span>
                    </Link>
                </a>
                <a className='list-group-item py-3 border-0'>
                    <Link to="/admin" className="text-decoration-none text-dark d-flex align-items-center">
                        <i className='bi bi-power fs-5 me-3'></i>
                        <span>Logout</span>
                    </Link>
                </a>
            </div>
        </div>)
}
export default Sidebar