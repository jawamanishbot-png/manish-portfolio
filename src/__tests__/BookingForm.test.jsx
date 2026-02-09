import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingForm from '../components/BookingForm';
import * as api from '../services/api';

// Mock the API with factory to avoid parsing import.meta.env in api.js
jest.mock('../services/api', () => ({
  createBooking: jest.fn(),
}));

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
      message: 'Your request has been submitted',
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
      expect(screen.getByText(/Your booking request has been submitted/i)).toBeInTheDocument();
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
    let resolveBooking;
    api.createBooking.mockImplementation(
      () => new Promise(resolve => { resolveBooking = resolve; })
    );

    render(<BookingForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const contextInput = screen.getByPlaceholderText(/topic/i);
    const submitButton = screen.getByText(/Request Consultation/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(contextInput, { target: { value: 'Topic' } });
    fireEvent.click(submitButton);

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Submitting...');

    // Resolve the API call — component switches to success view
    resolveBooking({ success: true });

    await waitFor(() => {
      expect(screen.getByText(/Request Submitted/i)).toBeInTheDocument();
    });
  });

  it('should show success view after successful submission', async () => {
    api.createBooking.mockResolvedValue({ success: true });

    render(<BookingForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/topic/i), { target: { value: 'Topic' } });
    fireEvent.click(screen.getByText(/Request Consultation/i));

    await waitFor(() => {
      expect(screen.getByText(/Request Submitted/i)).toBeInTheDocument();
    });

    // Form should no longer be visible
    expect(screen.queryByPlaceholderText(/email/i)).not.toBeInTheDocument();
  });
});
