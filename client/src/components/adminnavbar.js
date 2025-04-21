import React from 'react'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/collapse'

function AdminNav({ Toggle }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container-fluid">
                <span className="navbar-brand">FDA Admin Portal</span>
                <div className="d-flex">
                    <span className="text-white me-3">
                        <i className="bi bi-person-circle me-1"></i> Administrator
                    </span>
                </div>
            </div>
        </nav>
    )
}
export default AdminNav
