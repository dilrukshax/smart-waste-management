import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WasteRequestForm from '../components/WasteRequestForm'; // Adjust path
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import axiosMock from 'axios-mock-adapter';

const mockAxios = new axiosMock(axios);

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Auth context mock
const mockAuth = { auth: { token: 'mock-token' } };

// Test suite
describe('WasteRequestForm', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('fetches and displays user info', async () => {
    const mockProfileData = {
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '123-456-7890',
    };

    mockAxios.onGet('http://localhost:3001/api/auth/profile').reply(200, mockProfileData);

    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter>
          <WasteRequestForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Wait for user info to be fetched
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
  });

  it('shows an error if the user info fetch fails', async () => {
    mockAxios.onGet('http://localhost:3001/api/auth/profile').reply(500);

    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter>
          <WasteRequestForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Wait for error message
    await waitFor(() => expect(screen.getByText('Failed to fetch user information.')).toBeInTheDocument());
  });

  it('displays error for negative weight input', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter>
          <WasteRequestForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const foodInput = screen.getByLabelText(/Weight \(kg\)/i);
    
    fireEvent.change(foodInput, { target: { value: '-5' } });

    expect(screen.getByText('Please enter a valid positive number for weight.')).toBeInTheDocument();
  });

  it('submits form and redirects to payment when valid input is given', async () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter>
          <WasteRequestForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const foodInput = screen.getByLabelText(/Weight \(kg\)/i);
    fireEvent.change(foodInput, { target: { value: '2.5' } });

    const submitButton = screen.getByText(/Proceed to Payment/i);
    fireEvent.click(submitButton);

    await waitFor(() => expect(localStorage.getItem('pendingRequest')).toBeTruthy());
  });

  it('shows an error if no positive weight is entered', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter>
          <WasteRequestForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const submitButton = screen.getByText(/Proceed to Payment/i);
    fireEvent.click(submitButton);

    expect(screen.getByText('Please enter a positive weight for at least one waste type.')).toBeInTheDocument();
  });
});
