import {React, useContext} from 'react';
import { assets } from "../../assets/assets"
import { StoreContext } from '../../context/StoreContext';
import { calculatCartTootals } from '../../util/cartUtils';
import { Link,useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  
  const { provinces, foodList, quantities, setQuantities } = useContext(StoreContext); 
  const navigate = useNavigate();
    //cart items
  const cartItems = foodList.filter(food => quantities[food.id]>0);

    //calculation
    const {subtotal, shipping, tax, total} = calculatCartTootals(cartItems, quantities);
  
  return (
    
    <div>
      {/* Main Page Container */}
      <div className="container">
        <main>
        <div className="py-5 text-center">
          <img className="d-block mx-auto" src={assets.logo} alt="" width="78" height="78"/>
        </div>
          <div className="row g-5">
            {/* Order Summary / Cart Details Column (Right side on md and up) */}
            <div className="col-md-5 col-lg-4 order-md-last">
              {/* Cart Header */}
              <h4 className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary">Your cart</span>
                <span className="badge bg-primary rounded-pill">
                  {cartItems.length}
                </span> 
              </h4>
              {/* List of Cart Items */}
              <ul className="list-group mb-3">

                {/*Cart*/}
                {cartItems.map(item => (
                  <li className="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                        <img
                          src={item.imageUrl}  
                          style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }}
                        />
                      <h6 className="my-0">{item.name}</h6>
                      <span>
                        Quantity: {quantities[item.id]}
                      </span>
                    </div>
                    <span className="text-body-secondary">
                      ฿{item.price * quantities[item.id]}
                    </span>
                </li>
                ))}

                <li className="list-group-item d-flex justify-content-between">
                  <div>
                    <span>Shipping</span>
                  </div>
                  <span className="text-body-secondary">
                    ฿{subtotal === 0 ? 0.0 : shipping.toFixed(2)}
                  </span>
                </li>

                <li className="list-group-item d-flex justify-content-between">
                  <div>
                    <span>Tax (10%)</span>
                  </div>
                  <span className="text-body-secondary">
                    ฿{tax.toFixed(2)}
                  </span>
                </li>

                {/* Total Amount */}
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total (THB)</span>
                  <strong>
                    ฿{total.toFixed(2)}
                  </strong>
                </li>

              </ul>
        
                <button className="w-100 btn btn-primary btn-lg" type="submit" onClick={() => navigate('/confirm')}>
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
                    <input type="text" className="form-control" id="firstName" placeholder="John" value="" required />
                  </div>
                  {/* Last Name Input Field */}
                  <div className="col-sm-6">
                    <label htmlFor="lastName" className="form-label">Last name</label>
                    <input type="text" className="form-control" id="lastName" placeholder="Doe" value="" required />
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
                      <textarea className="form-control" id="address" placeholder="1234 Main St" rows="2" required></textarea>
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