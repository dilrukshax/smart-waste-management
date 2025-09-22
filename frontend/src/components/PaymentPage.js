// src/components/PaymentPage.js

import React, { useContext, useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import '../styles/PaymentPage.css';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Custom styling for CardElement
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#a0aec0',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// CheckoutForm Component
const CheckoutForm = ({ requestData, totalPrice, onSuccessfulPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { auth } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Additional input fields state
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create a Payment Intent on the backend
      const paymentIntentRes = await axios.post(
        API_CONFIG.STRIPE.CREATE_PAYMENT_INTENT,
        {
          wasteItems: requestData.wasteItems,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const clientSecret = paymentIntentRes.data.clientSecret;

      // Confirm the payment on the frontend
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardholderName,
            address: {
              line1: billingAddress,
            },
            email: email,
            phone: phoneNumber,
          },
        },
      });

      if (paymentResult.error) {
        // Show error to your customer (e.g., insufficient funds)
        setError(paymentResult.error.message);
        setProcessing(false);
      } else {
        if (paymentResult.paymentIntent.status === 'succeeded') {
          // Payment succeeded, send request data to the backend
          await axios.post(
            API_CONFIG.REQUEST.CREATE,
            {
              wasteItems: requestData.wasteItems,
              totalPrice: totalPrice,
              paymentIntentId: paymentResult.paymentIntent.id,
            },
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );

          // Clear the pending request from localStorage
          localStorage.removeItem('pendingRequest');

          // Redirect to the request form after successful payment
          onSuccessfulPayment();
        }
      }
    } catch (err) {
      console.error('Error during payment:', err);
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-details">
        <h3>Enter Payment Details</h3>
        <input
          type="text"
          placeholder="Cardholder Name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Billing Address"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          className="input-field"
        />
        <div className="card-element-container">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <button className="submit-button" type="submit" disabled={!stripe || processing}>
        {processing ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
};

// PaymentPage Component
const PaymentPage = () => {
  const { auth } = useContext(AuthContext);
  const [requestData, setRequestData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch request data from localStorage or state management
  useEffect(() => {
    const data = localStorage.getItem('pendingRequest');
    if (data) {
      const parsedData = JSON.parse(data);
      setRequestData(parsedData);
      calculateTotalPrice(parsedData.wasteItems);
    } else {
      // If no data, redirect back to request form
      navigate('/request-form');
    }
  }, [navigate]);

  const calculateTotalPrice = (wasteItems) => {
    const priceMap = {
      food: 50, // LKR per kg
      cardboard: 100, // LKR per kg
      polythene: 150, // LKR per kg
    };

    let total = 0;
    const processedWasteItems = wasteItems.map((item) => {
      const itemPrice = priceMap[item.wasteType] * item.weight;
      total += itemPrice;
      return { ...item, totalPrice: itemPrice };
    });
    setTotalPrice(total);
    setRequestData({ ...wasteItems, wasteItems: processedWasteItems });
  };

  const handleSuccessfulPayment = () => {
    // Redirect to the request form after successful payment and request creation
    navigate('/');
  };

  return (
    <div className="payment-page-container">
      <h2>Payment Page</h2>
      {error && <div className="error-message">{error}</div>}
      {requestData && (
        <div className="payment-content">
          {/* Left Container: Confirm Your Waste Collection Request */}
          <div className="left-container">
            <div className="summary-card">
              <h3>Confirm Your Waste Collection Request</h3>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Waste Type</th>
                    <th>Weight (kg)</th>
                    <th>Total Price (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {requestData.wasteItems.map((item, index) => (
                    item.weight > 0 && (
                      <tr key={index}>
                        <td>{item.wasteType.charAt(0).toUpperCase() + item.wasteType.slice(1)}</td>
                        <td>{item.weight}</td>
                        <td>{item.totalPrice.toLocaleString()}</td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
              <h4>Total Price: {totalPrice.toLocaleString()} LKR</h4>
            </div>
          </div>

          {/* Right Container: Enter Payment Details */}
          <div className="right-container">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                requestData={requestData}
                totalPrice={totalPrice}
                onSuccessfulPayment={handleSuccessfulPayment}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
