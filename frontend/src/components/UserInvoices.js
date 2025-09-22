import React, { useContext, useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../styles/UserInvoices.css'; // Import custom CSS

const UserInvoices = () => {
  const { auth } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(API_CONFIG.USER.INVOICES, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setInvoices(res.data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    };

    fetchInvoices();
  }, [auth.token]);

  return (
    <div className="invoice-container">
      <h2 className="invoice-title">Your Invoices</h2>
      {invoices.length === 0 ? (
        <p>No invoices available.</p>
      ) : (
        invoices.map((invoice) => (
          <div key={invoice._id} className="invoice-card">
            <div className="invoice-header">

            <div className="invoice-left">
              <h4 className="invoice-company">TrashMate</h4>
              <p>Invoice for {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}</p>
            </div>
            <div className="invoice-right">
              <h4 className="invoice-number">Invoice #{invoice._id}</h4>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>

              
            </div>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Waste Type</th>
                  <th>Total Weight (kg)</th>
                  <th>Rate per kg (LKR)</th>
                  <th>Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.wasteDetails.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.wasteType}</td>
                    <td>{detail.totalWeight}</td>
                    <td>{detail.ratePerKg}</td>
                    <td>{detail.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="invoice-footer">
              <h5>Total Amount: {invoice.totalAmount} LKR</h5>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserInvoices;
