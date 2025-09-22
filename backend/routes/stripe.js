// routes/stripe.js

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const authMiddleware = require('../middleware/auth');
const Request = require('../models/Request'); // Ensure correct path

// Initialize Stripe with your secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Payment Intent
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  const { wasteItems } = req.body;
  const userId = req.user.userId; // Adjust based on your auth middleware

  try {
    // Calculate total price based on waste items
    let totalPrice = 0;
    const processedWasteItems = wasteItems.map((item) => {
      const itemPrice = item.totalPrice; // Assuming totalPrice is already calculated
      totalPrice += itemPrice;
      return {
        wasteType: item.wasteType,
        weight: item.weight,
        totalPrice: itemPrice,
      };
    });

    // Convert totalPrice to the smallest currency unit (e.g., cents)
    const amount = Math.round(totalPrice * 100); // 1000 LKR = 100000 cents

    // Create a Payment Intent with the calculated amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'lkr', // Ensure that LKR is supported; Stripe supports many currencies
      metadata: { userId },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

module.exports = router;
