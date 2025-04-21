import React from "react";
import "../sidebar.css";
import { Link, useLocation } from "react-router-dom";



function Sidebar() {
    const location = useLocation();
    return (
        <div className='sidebar p-0'>
            <div className='text-white text-center py-3' style={{ marginTop: '64px' }}>
                <h5 className='mb-0'>ADMIN PORTAL</h5>
            </div>
            <div className='list-group list-group-flush'>
                <div className={`list-group-item py-3 border-0 ${location.pathname === '/adwelcome' ? 'active-menu-item' : ''}`}>
                    <Link to="/adwelcome" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-house-door fs-5 me-3'></i>
                        <span>Home</span>
                    </Link>
                </div>

                <div className={`list-group-item py-3 border-0 ${location.pathname === '/admetrics' ? 'active-menu-item' : ''}`}>
                    <Link to="/admetrics" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-speedometer2 fs-5 me-3'></i>
                        <span>Dashboard</span>
                    </Link>
                </div>

                <div className={`list-group-item py-3 border-0 ${location.pathname === '/adview' ? 'active-menu-item' : ''}`}>
                    <Link to="/adview" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-table fs-5 me-3'></i>
                        <span>View Applications</span>
                    </Link>
                </div>
                <div className={`list-group-item py-3 border-0 ${location.pathname === '/admin-data-management' ? 'active-menu-item' : ''}`}>
                    <Link to="/admin-data-management" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-database fs-5 me-3'></i>
                        <span>Data Management</span>
                    </Link>
                </div>
                <div className='list-group-item py-3 border-0'>
                    <Link to="/admin" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-power fs-5 me-3'></i>
                        <span>Logout</span>
                    </Link>
                </div>
            </div>
        </div>)
}
export default Sidebar