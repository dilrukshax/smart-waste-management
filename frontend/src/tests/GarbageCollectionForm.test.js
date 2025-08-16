import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GarbageCollectionForm from '../components/GarbageCollectionForm'; // Adjust the path as necessary
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import axiosMock from 'axios-mock-adapter';
import '@testing-library/jest-dom/extend-expect';
import { Modal, Button, Form } from 'react-bootstrap';

const mockAxios = new axiosMock(axios);

const mockUser = {
  _id: 'user-1',
  name: 'John Doe',
};

// Mock the AuthContext
const mockAuth = { auth: { token: 'mock-token' } };

describe('GarbageCollectionForm Component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('renders the form with default waste type', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <GarbageCollectionForm user={mockUser} onClose={jest.fn()} />
      </AuthContext.Provider>
    );

    // Check if form elements are rendered
    expect(screen.getByText(/Record Garbage Collection for John Doe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Waste Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/Add More Waste Type/i)).toBeInTheDocument();
  });

  it('adds another waste type input when "Add More Waste Type" is clicked', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <GarbageCollectionForm user={mockUser} onClose={jest.fn()} />
      </AuthContext.Provider>
    );

    // Click "Add More Waste Type" button
    fireEvent.click(screen.getByText(/Add More Waste Type/i));

    // Check that additional waste type input is added
    const wasteTypeSelects = screen.getAllByLabelText(/Waste Type/i);
    expect(wasteTypeSelects.length).toBe(2); // Should now have two waste type inputs
  });

  it('updates waste data when inputs are changed', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <GarbageCollectionForm user={mockUser} onClose={jest.fn()} />
      </AuthContext.Provider>
    );

    // Change waste type and weight inputs
    fireEvent.change(screen.getByLabelText(/Waste Type/i), { target: { value: 'cardboard' } });
    fireEvent.change(screen.getByLabelText(/Weight/i), { target: { value: '2' } });

    // Check if values are updated correctly
    expect(screen.getByLabelText(/Waste Type/i).value).toBe('cardboard');
    expect(screen.getByLabelText(/Weight/i).value).toBe('2');
  });

  it('submits the form successfully and shows success alert', async () => {
    // Mock API call for garbage collection submission
    mockAxios.onPost(`http://localhost:3001/api/collector/collect-garbage/${mockUser._id}`).reply(200);

    const mockOnClose = jest.fn();

    render(
      <AuthContext.Provider value={mockAuth}>
        <GarbageCollectionForm user={mockUser} onClose={mockOnClose} />
      </AuthContext.Provider>
    );

    // Click "Submit" button
    fireEvent.click(screen.getByText(/Submit/i));

    // Wait for alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Garbage collection recorded');
    });

    // Ensure onClose is called after submission
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error alert when form submission fails', async () => {
    // Mock API call to simulate a failed request
    mockAxios.onPost(`http://localhost:3001/api/collector/collect-garbage/${mockUser._id}`).reply(500);

    const mockOnClose = jest.fn();

    render(
      <AuthContext.Provider value={mockAuth}>
        <GarbageCollectionForm user={mockUser} onClose={mockOnClose} />
      </AuthContext.Provider>
    );

    // Click "Submit" button
    fireEvent.click(screen.getByText(/Submit/i));

    // Wait for alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error recording garbage collection');
    });

    // Ensure onClose is NOT called due to error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes the modal when the "Close" button is clicked', () => {
    const mockOnClose = jest.fn();

    render(
      <AuthContext.Provider value={mockAuth}>
        <GarbageCollectionForm user={mockUser} onClose={mockOnClose} />
      </AuthContext.Provider>
    );

    // Click the "Close" button
    fireEvent.click(screen.getByText(/Close/i));

    // Check if onClose callback was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
