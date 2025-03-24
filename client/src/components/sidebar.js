import React, { Component, useEffect, useState } from "react";
import "../sidebar.css";
import { Link } from "react-router-dom";



function Sidebar() {
    return (
        <div style={{ paddingTop: '64px' }}className='bg-white sidebar p-2'>
            <div style={{ paddingTop: '64px' }} className='m-2'>
                <i></i>
                <span className='brand-name fs-3'></span>
            </div>
            <div style={{ paddingTop: '64px' }} className='m-2'>
                <i className='bi bi-bootstrap-fill me-3 fs-4'></i>
                <span className='brand-name fs-3'>Admin</span>
            </div>
            <hr className='text-dark' />
            <div className='list-group list-group-flush'>
                <a className='list-group-item py-2'>
                    <i className='bi bi-speedometer2 fs-5 me-3'></i>
                    <span>Dashboard</span>
                </a>
                <a className='list-group-item py-2 '>
                    <Link to="/admin">
                    <i className='bi bi-house fs-5 me-3'></i>
                    <span >Home</span>
                    </Link>

                </a>
                <a className='list-group-item py-2'>
                    <i className='bi bi-table fs-5 me-3'></i>
                    <Link to="/adview">
                    <span >View Apllications</span>
                    </Link>
                </a>
                <a className='list-group-item py-2'>
                    <i className='bi bi-power fs-5 me-3'></i>
                    <Link to="/admin">
                    <span >Logout</span>
                    </Link>
                </a>
            </div>
        </div>)
}
export default Sidebar