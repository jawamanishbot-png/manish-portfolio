import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from '../components/BookingForm';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

describe('BookingForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render booking form with email and context fields', () => {
    render(<BookingForm />);
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/topic/i)).toBeInTheDocument();
    expect(screen.getByText(/Request Consultation/i)).toBeInTheDocument();
  });

  it('should submit booking with valid data', async () => {
    api.createBooking.mockResolvedValue({
      success: true,
      bookingId: 'booking-123',
      message: 'Your request has been submitted'
    });

    render(<BookingForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const contextInput = screen.getByPlaceholderText(/topic/i);
    const submitButton = screen.getByText(/Request Consultation/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(contextInput, { target: { value: 'I want to discuss growth strategies' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createBooking).toHaveBeenCalledWith(
        'test@example.com',
        'I want to discuss growth strategies'
      );
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Your request has been submitted/i)).toBeInTheDocument();
    });
  });

  it('should show error message on failed submission', async () => {
    api.createBooking.mockRejectedValue(new Error('Network error'));

    render(<BookingForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const contextInput = screen.getByPlaceholderText(/topic/i);
    const submitButton = screen.getByText(/Request Consultation/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(contextInput, { target: { value: 'Topic' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    api.createBooking.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 1000))
    );

    render(<BookingForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const contextInput = screen.getByPlaceholderText(/topic/i);
    const submitButton = screen.getByText(/Request Consultation/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(contextInput, { target: { value: 'Topic' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should validate email format', async () => {
    render(<BookingForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const contextInput = screen.getByPlaceholderText(/topic/i);
    const submitButton = screen.getByText(/Request Consultation/i);

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(contextInput, { target: { value: 'Topic' } });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(api.createBooking).not.toHaveBeenCalled();
    });
  });
});
