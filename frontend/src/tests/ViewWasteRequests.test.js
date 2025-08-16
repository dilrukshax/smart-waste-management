import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewWasteRequests from '../components/ViewWasteRequests'; // Adjust path as needed
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import axiosMock from 'axios-mock-adapter';
import '@testing-library/jest-dom/extend-expect';

const mockAxios = new axiosMock(axios);

// Mock the AuthContext
const mockAuth = { auth: { token: 'mock-token' } };

// Test suite
describe('ViewWasteRequests Component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('displays loading state while fetching requests', () => {
    // Render component with mock AuthContext
    render(
      <AuthContext.Provider value={mockAuth}>
        <ViewWasteRequests />
      </AuthContext.Provider>
    );

    // Check that loading state is shown initially
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('fetches and displays user requests', async () => {
    const mockRequests = [
      {
        _id: 'request-1',
        createdAt: '2024-10-23T14:15:00Z',
        status: 'pending',
        totalPrice: 5000,
        wasteItems: [
          { wasteType: 'food', weight: 2, pricePerKg: 50 },
          { wasteType: 'polythene', weight: 3, pricePerKg: 150 },
        ],
        paymentStatus: 'unpaid',
        assignedCollector: { name: 'John Collector' },
      },
    ];

    // Mock API call
    mockAxios.onGet('http://localhost:3001/api/request/user/my-requests').reply(200, mockRequests);

    render(
      <AuthContext.Provider value={mockAuth}>
        <ViewWasteRequests />
      </AuthContext.Provider>
    );

    // Wait for requests to be fetched
    await waitFor(() => expect(screen.getByText(/My Waste Collection Requests/i)).toBeInTheDocument());

    // Check that request data is displayed
    expect(screen.getByText('John Collector')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument(); // Total price in LKR
    expect(screen.getByText('23/10/2024')).toBeInTheDocument(); // Date formatted
    expect(screen.getByText(/pending/i)).toBeInTheDocument(); // Request status
  });

  it('displays an error message if fetching requests fails', async () => {
    // Mock API error response
    mockAxios.onGet('http://localhost:3001/api/request/user/my-requests').reply(500);

    render(
      <AuthContext.Provider value={mockAuth}>
        <ViewWasteRequests />
      </AuthContext.Provider>
    );

    // Wait for error message
    await waitFor(() => expect(screen.getByText(/Failed to fetch your waste collection requests/i)).toBeInTheDocument());
  });

  it('opens and closes modal with request details', async () => {
    const mockRequests = [
      {
        _id: 'request-1',
        createdAt: '2024-10-23T14:15:00Z',
        status: 'pending',
        totalPrice: 5000,
        wasteItems: [
          { wasteType: 'food', weight: 2, pricePerKg: 50 },
          { wasteType: 'polythene', weight: 3, pricePerKg: 150 },
        ],
        paymentStatus: 'unpaid',
        assignedCollector: { name: 'John Collector' },
      },
    ];

    // Mock API call
    mockAxios.onGet('http://localhost:3001/api/request/user/my-requests').reply(200, mockRequests);

    render(
      <AuthContext.Provider value={mockAuth}>
        <ViewWasteRequests />
      </AuthContext.Provider>
    );

    // Wait for requests to be displayed
    await waitFor(() => expect(screen.getByText(/My Waste Collection Requests/i)).toBeInTheDocument());

    // Click on 'View Details' button to open modal
    fireEvent.click(screen.getByText(/View Details/i));

    // Check if modal opens with correct data
    await waitFor(() => expect(screen.getByText(/Request ID:/i)).toBeInTheDocument());
    expect(screen.getByText('request-1')).toBeInTheDocument();
    expect(screen.getByText('Unpaid')).toBeInTheDocument(); // Payment status

    // Close the modal
    fireEvent.click(screen.getByText(/×/i)); // Close button

    // Check if modal is closed
    expect(screen.queryByText(/Request ID:/i)).not.toBeInTheDocument();
  });

  it('displays a message if no requests are available', async () => {
    // Mock API call with an empty response
    mockAxios.onGet('http://localhost:3001/api/request/user/my-requests').reply(200, []);

    render(
      <AuthContext.Provider value={mockAuth}>
        <ViewWasteRequests />
      </AuthContext.Provider>
    );

    // Wait for requests to be fetched
    await waitFor(() => expect(screen.getByText(/You have not made any waste collection requests yet/i)).toBeInTheDocument());
  });
});
