import React, { Component, useEffect, useState } from "react";
import "../sidebar.css";
import { Link } from "react-router-dom";



function UserSidebar() {
    return (
        <div style={{ paddingTop: '64px' }} className='bg-white sidebar p-2'>
            <div style={{ paddingTop: '64px' }} className='m-2'>
                <i></i>
                <span className='brand-name fs-3'></span>
            </div>
            <div style={{ paddingTop: '64px' }} className='m-2'>
                <i className='bi bi-bootstrap-fill me-3 fs-4'></i>
                <span className='brand-name fs-3'>User</span>
            </div>
            <hr className='text-dark' />
            <div className='list-group list-group-flush'>
                <Link to="/userDetails" className='list-group-item py-2'>
                    <i className='bi bi-speedometer2 fs-5 me-3'></i>
                    <span>Dashboard</span>
                </Link>
                <Link to="/userHome" className='list-group-item py-2'>
                    <i className='bi bi-house fs-5 me-3'></i>
                    <span>Apply for Certification</span>
                </Link>
                <Link to="/userapplicationstatus" className='list-group-item py-2'>
                    <i className='bi bi-table fs-5 me-3'></i>
                    <span>View Application Status</span>
                </Link>
                <Link to="/sign-in" className='list-group-item py-2'>
                    <i className='bi bi-power fs-5 me-3'></i>
                    <span>Logout</span>
                </Link>
            </div>
        </div>)
}
export default UserSidebar