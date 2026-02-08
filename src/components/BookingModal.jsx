import { useState } from 'react';
import BookingForm from './BookingForm';
import './BookingModal.css';

export default function BookingModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn btn-booking" onClick={() => setIsOpen(true)}>
        📅 Schedule a 25-Min Call
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule a Call with Manish</h2>
              <button
                className="modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <BookingForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
