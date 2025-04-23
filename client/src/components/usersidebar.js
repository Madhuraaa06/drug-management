import React from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import "../sidebar.css";

function UserSidebar() {
    const location = useLocation();

    const handleLogout = async () => {
        toast.info("Logging out...");
        try {
            const token = window.localStorage.getItem("token");
            if (token) {
                // Call the logout endpoint to invalidate the token
                await fetch("http://localhost:5008/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });
            }
            // Clear local storage and redirect regardless of server response
            window.localStorage.clear();
            window.location.href = "/sign-in";
        } catch (error) {
            console.error("Logout error:", error);
            // Still clear local storage and redirect even if server call fails
            window.localStorage.clear();
            window.location.href = "/sign-in";
        }
    };

    return (
        <div className='sidebar p-0'>
            <div className='text-white text-center py-3' style={{ marginTop: '64px' }}>
                <h5 className='mb-0'>MANUFACTURER PORTAL</h5>
            </div>
            <div className='list-group list-group-flush'>
                <div className={`list-group-item py-3 border-0 ${location.pathname === '/userDetails' ? 'active-menu-item' : ''}`}>
                    <Link to="/userDetails" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-house-door fs-5 me-3'></i>
                        <span>Home</span>
                    </Link>
                </div>

                <div className={`list-group-item py-3 border-0 ${location.pathname === '/userHome' ? 'active-menu-item' : ''}`}>
                    <Link to="/userHome" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-file-earmark-plus fs-5 me-3'></i>
                        <span>Apply for Certification</span>
                    </Link>
                </div>

                <div className={`list-group-item py-3 border-0 ${location.pathname === '/userapplicationviewstatus' ? 'active-menu-item' : ''}`}>
                    <Link to="/userapplicationviewstatus" className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-table fs-5 me-3'></i>
                        <span>View Applications</span>
                    </Link>
                </div>

                <div className='list-group-item py-3 border-0'>
                    <Link to="#" onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                    }} className="text-decoration-none text-dark d-flex align-items-center w-100">
                        <i className='bi bi-power fs-5 me-3'></i>
                        <span>Logout</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default UserSidebar;