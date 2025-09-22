// src/components/Invoice.js

import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Alert, Button } from 'react-bootstrap';

const Invoice = () => {
  const { id } = useParams(); // PaymentIntent ID or Request ID
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/invoice/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust as per your auth
          },
        });
        setInvoice(res.data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to fetch invoice.');
      }
    };

    fetchInvoice();
  }, [id]);

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!invoice) {
    return <p>Loading invoice...</p>;
  }

  return (
    <div>
      <h2>Invoice</h2>
      <Card className="mb-4">
        <Card.Body>
          <h5>Invoice Details</h5>
          <p>
            <strong>User:</strong> {invoice.user.name}
          </p>
          <p>
            <strong>Email:</strong> {invoice.user.email}
          </p>
          <p>
            <strong>Phone:</strong> {invoice.user.phoneNumber}
          </p>
          <p>
            <strong>Period:</strong> {new Date(invoice.periodStart).toLocaleDateString()} -{' '}
            {new Date(invoice.periodEnd).toLocaleDateString()}
          </p>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Waste Type</th>
                <th>Total Weight (kg)</th>
                <th>Rate (LKR/kg)</th>
                <th>Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.wasteDetails.map((detail, index) => (
                <tr key={index}>
                  <td>{detail.wasteType.charAt(0).toUpperCase() + detail.wasteType.slice(1)}</td>
                  <td>{detail.totalWeight}</td>
                  <td>{detail.ratePerKg}</td>
                  <td>{detail.amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h5>Total Amount: {invoice.totalAmount} LKR</h5>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Invoice;
