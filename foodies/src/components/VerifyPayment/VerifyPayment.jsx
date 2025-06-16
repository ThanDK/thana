import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyPayment.css';
import { assets } from '../../assets/assets'; 

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState({
    success: false,
    cancelled: false,
    loading: true,
    orderId: null,
    message: "Verifying Payment...",
  });

  // This useEffect and verifyPaymentStatus function are perfect and remain unchanged.
  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId");
    if (orderIdFromUrl) {
      verifyPaymentStatus(orderIdFromUrl); 
    } else {
      console.log("No Order ID found. Redirecting to home.");
      navigate('/');
    }
  }, [searchParams, navigate]);

  const verifyPaymentStatus = async (orderId) => {
    try {
      const token = localStorage.getItem('token'); 
      const url = `http://localhost:8080/api/orders/payment/status/${orderId}`;
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const paymentStatus = response.data.paymentStatus;

      if (paymentStatus === "COMPLETED") {
        setStatus({ success: true, cancelled: false, loading: false, orderId: orderId, message: "Payment Successful!" });
      } else if (paymentStatus === "CANCELLED") {
        setStatus({ success: false, cancelled: true, loading: false, orderId: orderId, message: "Payment Cancelled" });
      } else {
        setStatus({ success: false, cancelled: false, loading: false, orderId: orderId, message: "Payment could not be confirmed." });
      }
    } catch (error) {
      console.error("Failed to fetch payment status:", error);
      setStatus({ success: false, cancelled: false, loading: false, orderId: orderId, message: "An error occurred while verifying your payment." });
    }
  };

  // --- REFACTORED RENDER LOGIC ---
  // This is now a standard component return, not a separate function.
  return (
    <div className="verify-page">
      {/* 
        This is the nested ternary operator structure.
        It reads: "Is it loading? If yes, show spinner. 
        If no, is it successful? If yes, show success box.
        If no, show the failure/cancel box."
      */}
      {status.loading ? (
        // --- 1. Loading State ---
        <div className="verify-box">
          <div className="spinner"></div>
          <p className="loading-text">{status.message}</p>
        </div>
      ) : status.success ? (
        // --- 2. Success State ---
        <div className="verify-box">
          <div className="verify-header">
            <img src={assets.parcel_icon} alt="Success" className="verify-icon" />
            <h2 className="success-text">Payment Successful!</h2>
          </div>
          <div className="verify-body">
            <p>Your order has been confirmed. Thank you for your purchase.</p>
            <div className="order-details">
              <p>Your Order ID</p>
              <span>{status.orderId}</span>
            </div>
          </div>
          <div className="verify-footer">
            <button onClick={() => navigate('/myorders')} className="verify-btn primary">Track My Orders</button>
            <button onClick={() => navigate('/')} className="verify-btn secondary">Continue Shopping</button>
          </div>
        </div>
      ) : (
        // --- 3. Failure or Cancellation State ---
        <div className="verify-box">
          <div className="verify-header">
            <img 
              src={status.cancelled ? assets.cancel_icon : assets.cross_icon} 
              alt={status.cancelled ? "Cancelled" : "Failed"}
              className="verify-icon" 
            />
            <h2 className="failure-text">{status.cancelled ? "Payment Cancelled" : "Payment Failed"}</h2>
          </div>
          <div className="verify-body">
            <p>
              {status.cancelled
                ? "Your payment was cancelled as requested. You have not been charged."
                : status.message} 
            </p>
          </div>
          <div className="verify-footer">
            <button onClick={() => navigate('/myorders')} className="verify-btn primary">View My Orders</button>
            <button onClick={() => navigate('/')} className="verify-btn secondary">Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyPayment;