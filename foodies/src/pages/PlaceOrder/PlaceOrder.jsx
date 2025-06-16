import {React, useContext, useState} from 'react';
import { assets } from "../../assets/assets"
import { StoreContext } from '../../context/StoreContext';
import { calculatCartTootals } from '../../util/cartUtils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  
  const { provinces, foodList, quantities, token } = useContext(StoreContext); 
  const navigate = useNavigate(); // Hook for programmatic navigation

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    country: 'ประเทศไทย', 
    province: '',
    zip: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({...data, [name]: value}));
  };
  
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const cartItems = foodList.filter(food => quantities[food.id] > 0);
    
    // Check 1: Ensure the cart is not empty before proceeding
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items to place an order.");
      navigate("/cart"); 
      return;
    }

    // Check 2: Validate that all fields in the 'data' state are filled
    for (const key in data) {
        if (data[key] === "") {
            toast.error("Please fill in all the delivery information fields.");
            return; 
        }
    }

    setIsProcessing(true); 

    const { total } = calculatCartTootals(cartItems, quantities);

    const orderData = {
      userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.country}, ${data.province}, ${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map(item => ({
        foodId: item.id,
        quantity: quantities[item.id],
        price: item.price * quantities[item.id],
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name
    })),
      amount: total.toFixed(2),
      orderStatus: "Preparing"
    };

    try {
      const response = await axios.post('http://localhost:8080/api/orders', orderData, {headers: {'Authorization': `Bearer ${token}` }});
      if(response.status === 200 && response.data.approvalUrl) {
        toast.success("Order placed successfully! Redirecting to payment...");

        window.location.href = response.data.approvalUrl;
      } else {

        toast.error("An unexpected error occurred.");
        setIsProcessing(false); 
      }
    } catch (error) {

        toast.error("Failed to place order. " + (error.response?.data?.message || error.message));
        setIsProcessing(false); 
    } 

  };

  const cartItems = foodList.filter(food => quantities[food.id] > 0);
  const { subtotal, shipping, tax, total } = calculatCartTootals(cartItems, quantities);
  
  return (
    <div>
      {/* Main Page Container */}
      <div className="container">
        <main>
          <div className="py-5 text-center">
            <img className="d-block mx-auto" src={assets.logo} alt="" width="78" height="78"/>
          </div>
          <div className="row g-5">
            {/* Order Summary / Cart Details Column */}
            <div className="col-md-5 col-lg-4 order-md-last">
              {/* ... (cart summary code remains the same) ... */}
              <h4 className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary">Your cart</span>
                <span className="badge bg-primary rounded-pill">
                  {cartItems.length}
                </span> 
              </h4>
              <ul className="list-group mb-3">
                {cartItems.map(item => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                        <img
                          src={item.imageUrl}  
                          alt={item.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }}
                        />
                      <h6 className="my-0">{item.name}</h6>
                      <span>
                        Quantity: {quantities[item.id]}
                      </span>
                    </div>
                    <span className="text-body-secondary">
                      ฿{(item.price * quantities[item.id]).toFixed(2)}
                    </span>
                  </li>
                ))}
                <li className="list-group-item d-flex justify-content-between">
                  <div>
                    <span>Shipping</span>
                  </div>
                  <span className="text-body-secondary">
                    ฿{subtotal === 0 ? "0.00" : shipping.toFixed(2)}
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
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total (THB)</span>
                  <strong>
                    ฿{total.toFixed(2)}
                  </strong>
                </li>
              </ul>
            </div>

            {/* Billing Address and Payment Form Column */}
            <div className="col-md-7 col-lg-8">
              <h4 className="mb-3">Billing address</h4>
              <form className="needs-validation" noValidate onSubmit={onSubmitHandler}>
                {/* Fieldset disables all child inputs when 'isProcessing' is true */}
                <fieldset disabled={isProcessing}>
                  <div className="row g-3">
                    {/* First Name Input Field */}
                    <div className="col-sm-6">
                      <label htmlFor="firstName" className="form-label">First name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="firstName" 
                        placeholder="John" 
                        required 
                        name="firstName" 
                        onChange={onChangeHandler} 
                        value={data.firstName}
                      />
                    </div>
                    {/* Last Name Input Field */}
                    <div className="col-sm-6">
                      <label htmlFor="lastName" className="form-label">Last name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="lastName" 
                        placeholder="Doe"  
                        required 
                        name="lastName"
                        onChange={onChangeHandler}
                        value={data.lastName}
                      />
                    </div>
                    {/* Email Input Field */}
                    <div className="col-12">
                      <label htmlFor="email" className="form-label">Email</label>
                      <div className="input-group has-validation">
                        <span className="input-group-text">@</span>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email" 
                          placeholder="you@example.com" 
                          required 
                          name="email"
                          onChange={onChangeHandler}
                          value={data.email}
                        />
                      </div>
                    </div>
                    {/* Phone number */}
                    <div className="col-12">
                      <label htmlFor="phone" className="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="phone" 
                        placeholder="+66" 
                        required 
                        name="phoneNumber"
                        value={data.phoneNumber}
                        onChange={onChangeHandler}
                      />
                    </div>
                    {/* Address Line 1 Input Field */}
                    <div className="col-12">
                      <label htmlFor="address" className="form-label">Address</label>
                        <textarea 
                          className="form-control" 
                          id="address" 
                          placeholder="1234 Main St" 
                          rows="2" 
                          required
                          value={data.address}
                          name="address"
                          onChange={onChangeHandler}
                        />       
                    </div>
                    {/* Country Select Field */}
                    <div className="col-md-5">
                      <label htmlFor="country" className="form-label">
                        Country
                      </label>
                      <select 
                        className="form-select" 
                        id="country" 
                        required 
                        name='country' 
                        value={data.country} 
                        onChange={onChangeHandler}
                      >
                        <option value="">Choose...</option>
                        <option value="ประเทศไทย">ประเทศไทย</option>
                      </select>
                    </div>
                    {/* State Select Field */}
                    <div className="col-md-4">
                      <label htmlFor="province" className="form-label">Province</label>
                      <select 
                        className="form-select" 
                        id="province" 
                        required
                        name="province"
                        value={data.province}
                        onChange={onChangeHandler}
                      >
                        <option value="">Choose...</option>
                        {provinces.map(province => (
                          <option key={province.id} value={province.name_th}>{province.name_th}</option>
                        ))}
                      </select>
                    </div>
                    {/* Zip Code Input Field */}
                    <div className="col-md-3">
                      <label htmlFor="zip" className="form-label">Zip</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="zip" 
                        placeholder="" 
                        required 
                        name="zip"
                        value={data.zip}
                        onChange={onChangeHandler}
                      />
                    </div>
                  </div>
                </fieldset>

                <hr className="my-4" />
                <button 
                  className="w-100 btn btn-primary btn-lg" 
                  type="submit" 
                  // Button is disabled during processing OR if the cart is empty
                  disabled={isProcessing || cartItems.length === 0}
                >
                  {isProcessing ? "Processing..." : "Continue to checkout"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlaceOrder;