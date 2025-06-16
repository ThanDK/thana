import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyPayment.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadCartData } = useContext(StoreContext);

  // --- REVISED STATE ---
  // We'll use a string to represent the final state, which is clearer.
  const [status, setStatus] = useState({
    finalState: 'loading', // Can be 'loading', 'success', 'cancelled', 'failed'
    orderId: null,
    message: "Verifying Payment...",
  });

  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId");
    if (orderIdFromUrl) {
      verifyPaymentStatus(orderIdFromUrl);
    } else {
      console.log("No Order ID found. Redirecting to home.");
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  // --- REVISED LOGIC ---
  // This now sets the 'finalState' based on the specific API response.
  const verifyPaymentStatus = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:8080/api/orders/payment/status/${orderId}`;
      const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const paymentStatus = response.data.paymentStatus;

      if (paymentStatus === "COMPLETED") {

        const urlDel = `http://localhost:8080/api/cart`;
        const DelResponse = await axios.delete(urlDel, { headers: { 'Authorization': `Bearer ${token}` } });
        
        await loadCartData(token);      
        setStatus({ finalState: 'success', orderId: orderId, message: "Payment Successful!" });
        await loadCartData(token);
      } else if (paymentStatus === "CANCELLED") {
        setStatus({ finalState: 'cancelled', orderId: orderId, message: "Payment Cancelled" });
      } else {
        // Any other status (FAILED, PENDING, etc.) is treated as a failure.
        setStatus({ finalState: 'failed', orderId: orderId, message: "Your payment could not be completed." });
      }
    } catch (error) {
      console.error("Failed to fetch payment status:", error);
      // API errors are also a failure.
      setStatus({ finalState: 'failed', orderId: orderId, message: "An error occurred while verifying your payment." });
    }
  };

  // --- REVISED RENDER LOGIC ---

  // Handle loading state separately
  if (status.finalState === 'loading') {
    return (
      <div className="verify-page">
        <div className="verify-box">
          <div className="spinner"></div>
          <p className="loading-text">{status.message}</p>
        </div>
      </div>
    );
  }

  // Determine UI content using a switch for clarity
  let title, icon, titleClass, bodyContent;

  switch (status.finalState) {
    case 'success':
      title = "Payment Successful!";
      icon = assets.parcel_icon;
      titleClass = "success-text";
      bodyContent = (
        <>
          <p>Your order has been confirmed. Thank you for your purchase.</p>
          <div className="order-details">
            <p>Your Order ID</p>
            <span>{status.orderId}</span>
          </div>
        </>
      );
      break;
    case 'cancelled':
      title = "Payment Cancelled";
      icon = assets.cancel_icon;
      titleClass = "failure-text";
      bodyContent = <p>Your payment was cancelled as requested. You have not been charged.</p>;
      break;
    case 'failed':
    default:
      title = "Payment Failed";
      icon = assets.cross_icon;
      titleClass = "failure-text";
      bodyContent = <p>{status.message}</p>;
      break;
  }

  // Footer button text is still based on a simple success/failure split
  const primaryButtonText = status.finalState === 'success' ? "Track My Orders" : "View My Orders";
  const secondaryButtonText = status.finalState === 'success' ? "Continue Shopping" : "Back to Home";

  return (
    <div className="verify-page">
      <div className="verify-box">
        {/* --- Header uses the variables --- */}
        <div className="verify-header">
          <img src={icon} alt={title} className="verify-icon" />
          <h2 className={titleClass}>{title}</h2>
        </div>

        {/* --- Body uses the variable --- */}
        <div className="verify-body">
          {bodyContent}
        </div>

        {/* --- Footer remains clean --- */}
        <div className="verify-footer">
          <button onClick={() => navigate('/myorders', { replace: true })} className="verify-btn primary">
            {primaryButtonText}
          </button>
          <button onClick={() => navigate('/', { replace: true })} className="verify-btn secondary">
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;