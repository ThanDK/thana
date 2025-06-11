import React, { useState } from 'react';
import './ConfirmCheckout.css'; // Import the CSS file for styling

const ConfirmCheckout = () => {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMakePayment = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setStatus("Please enter a valid, positive amount!");
      return;
    }
    setStatus("Processing payment...");
    setIsLoading(true);

    try {
      // --- FIX #1: Correct the API endpoint URL ---
      // The path must match your Spring Boot @RequestMapping and @PostMapping.
      // The correct path is /api/payment/create
      const response = await fetch(`http://localhost:8080/api/payment/create?amount=${amount}`, {
        method: "POST"
      });

      // It's crucial to check if the response itself is okay (e.g., not a 404 or 500 error)
      if (!response.ok) {
        // Get the error message text from the backend's response body
        const errorText = await response.text();
        throw new Error(`Server responded with an error: ${response.status}. Message: ${errorText}`);
      }

      // Your backend sends the raw URL as plain text, so we read it as text.
      const approvalUrl = await response.text();

      // --- FIX #2: Correctly handle the response from the backend ---
      // Your backend sends the URL directly. Check if the response looks like a URL.
      if (approvalUrl && approvalUrl.startsWith('http')) {
        // This is the correct way to redirect the user's browser to an external page.
        window.location.href = approvalUrl;
      } else {
        // This case will be hit if the backend sends an error message instead of a URL.
        setStatus(`Payment initiation failed. Unexpected response from server: ${approvalUrl}`);
      }

    } catch (error) {
      console.error("Error:", error);
      // Display a user-friendly message from the caught error.
      setStatus(`Payment request failed. ${error.message}`);
    } finally {
      setIsLoading(false); // Ensure the loading state is reset
    }
  };

  return (
    <div className="payment-container">
      <h2>PayPal Payment Integration</h2>

      <label htmlFor="amount">Enter Amount (THB):</label>
      <input
        type="number"
        id="amount"
        min="1"
        step="0.01"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isLoading}
      />

      <button onClick={handleMakePayment} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Pay with PayPal'}
      </button>

      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default ConfirmCheckout;