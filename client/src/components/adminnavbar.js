import React from 'react'

import 'bootstrap/js/dist/dropdown'

import 'bootstrap/js/dist/collapse'

import image from '../fda-logo.png'
import image2 from '../fda-logo2.png'
import image3 from '../fda-cleared-logo-png.png'
import image4 from '../fda-gmp-certified.png'


function AdminNav({ Toggle }) {
    return (
        <div style={{ paddingTop: '64px' }} className='px-3'>
            <div style={{ paddingTop: '64px' }} className='container-fluid'>
                <div className='row g-3 my-2'>
                    <div className='col-md-3 p-1'>
                    <div className='p-3 bg-white shadow-sm d-flex justify-content-center align-items-center rounded' style={{ height: '200px', width: '200px'}}>
                                <div>
                                    <img src={image} alt='FDA' className="imageLogo" style={{ height: '100px', width: '100px' }} />
                                </div>
                            </div>
                    </div>
                    <div className='col-md-3 p-1'>
                    <div className='p-3 bg-white shadow-sm d-flex justify-content-center align-items-center rounded' style={{ height: '200px', width: '200px'}}>
                                <div>
                                    <img src={image2} alt='FDA2' className="imageLogo" style={{ height: '100px', width: '100px' }} />
                                </div>
                            </div>
                    </div>
                    <div className='col-md-3 p-1'>
                    <div className='p-3 bg-white shadow-sm d-flex justify-content-center align-items-center rounded' style={{ height: '200px', width: '200px'}}>
                                <div>
                                    <img src={image3} alt='FDA3' className="imageLogo" style={{ height: '100px', width: '100px' }} />
                                </div>
                            </div>
                    </div>
                    <div className='col-md-3 p-1'>
                            <div className='p-3 bg-white shadow-sm d-flex justify-content-center align-items-center rounded' style={{ height: '200px', width: '200px'}}>
                                <div>
                                    <img src={image4} alt='FDA4' className="imageLogo" style={{ height: '100px', width: '100px' }} />
                                </div>
                            </div>
                    </div>
                </div>
            </div>
            <table class="table caption-top bg-white rounded mt-2">
                <caption className='text-white fs-4'>Here Are The List of Rules to be followed before Approving for Certification</caption>
                <thead>                    
                    <tr>                        
                        <th scope="col">Rules</th>                                           
                    </tr>               
                 </thead> 
                <tbody>
                    <tr>
                        <th scope="col">1</th>
                        <td>The Clinical Trail Data Should be Verified</td>
                    </tr>
                    <tr>
                        <th scope="col">2</th>
                        <td>The Clinical Trail Data Should have a minimum of 100 individuals tested</td>
                    </tr>
                    <tr>
                        <th scope="col">3</th>
                        <td>The Clinical Trail Data Should have individuals from various age group</td>
                    </tr>
                    <tr>
                        <th scope="col">4</th>
                        <td>Once the Application is Aprroved it is Written into the Block and Cannot be Altered</td>
                    </tr>
                    <tr>
                        <th scope="col">5</th>
                        <td>If Rejected Provide the clear reason for rejection</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
export default AdminNav