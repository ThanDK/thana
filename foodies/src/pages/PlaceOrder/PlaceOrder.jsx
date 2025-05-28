import {React, useContext} from 'react';
import { assets } from "../../assets/assets"
import { StoreContext } from '../../context/StoreContext';

const PlaceOrder = () => {
  
  const { provinces } = useContext(StoreContext); 
  return (
    
    <div>
      {/* Main Page Container */}
      <div className="container">
        <main>
        <div className="py-5 text-center">
          <img className="d-block mx-auto mb-4" src={assets.logo} alt="" width="98" height="98"/>
        </div>
          <div className="row g-5">
            {/* Order Summary / Cart Details Column (Right side on md and up) */}
            <div className="col-md-5 col-lg-4 order-md-last">
              {/* Cart Header */}
              <h4 className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary">Your cart</span>
                <span className="badge bg-primary rounded-pill">3</span> {/* Example item count */}
              </h4>
              {/* List of Cart Items */}
              <ul className="list-group mb-3">
                {/* Example Cart Item 1 */}

                <li className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">Product name</h6>
                    <small className="text-body-secondary">Brief description</small>
                  </div>
                  <span className="text-body-secondary">$12</span>
                </li>

                {/* Example Cart Item 2 */}
                <li className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">Second product</h6>
                    <small className="text-body-secondary">Brief description</small>
                  </div>
                  <span className="text-body-secondary">$8</span>
                </li>

                {/* Example Cart Item 3 */}
                <li className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">Third item</h6>
                    <small className="text-body-secondary">Brief description</small>
                  </div>
                  <span className="text-body-secondary">$5</span>
                </li>

                {/* Total Amount */}
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total (THB)</span>
                  <strong>฿20</strong>
                </li>

              </ul>
                <button className="w-100 btn btn-primary btn-lg" type="submit">
                    Continue to checkout
                </button>
            </div>

            {/* Billing Address and Payment Form Column (Left side on md and up) */}
            <div className="col-md-7 col-lg-8">
              {/* Billing Address Section Title */}
              <h4 className="mb-3">Billing address</h4>
              {/* Billing Address Form */}
              <form className="needs-validation" noValidate>
                <div className="row g-3">
                  {/* First Name Input Field */}
                  <div className="col-sm-6">
                    <label htmlFor="firstName" className="form-label">First name</label>
                    <input type="text" className="form-control" id="firstName" placeholder="" value="" required />
                  </div>
                  {/* Last Name Input Field */}
                  <div className="col-sm-6">
                    <label htmlFor="lastName" className="form-label">Last name</label>
                    <input type="text" className="form-control" id="lastName" placeholder="" value="" required />
                  </div>
                  {/* Email Input Field */}
                  <div className="col-12">
                    <label htmlFor="email" className="form-label">Email</label>
                    <div className="input-group has-validation">
                      <span className="input-group-text">@</span>
                      <input type="text" className="form-control" id="email" placeholder="email" required />
                    </div>
                  </div>
                  {/* Phone number */}
                  <div className="col-12">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input type="number" className="form-control" id="phone" placeholder="+66" required />
                  </div>
                  {/* Address Line 1 Input Field */}
                  <div className="col-12">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input type="text" className="form-control" id="address" placeholder="1234 Main St" required />
                  </div>
                  {/* Country Select Field */}
                  <div className="col-md-5">
                    <label htmlFor="country" className="form-label">Country</label>
                    <select className="form-select" id="country" required>
                      <option selected>ประเทศไทย</option>
                    </select>
                  </div>
                  {/* State Select Field */}
                  <div className="col-md-4">
                    <label htmlFor="state" className="form-label">State</label>
                    <select className="form-select" id="state" required>
                      <option value="">จังหวัด...</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.name_th}>{province.name_th}</option>
                      ))}
                    </select>
                  </div>
                  {/* Zip Code Input Field */}
                  <div className="col-md-3">
                    <label htmlFor="zip" className="form-label">Zip</label>
                    <input type="text" className="form-control" id="zip" placeholder="" required />
                  </div>
                </div>

                <hr className="my-4" />

              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PlaceOrder;