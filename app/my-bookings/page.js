'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadBookings = useCallback(async (userId) => {
    const { data } = await supabase
      .from('bookings')
      .select('id, booking_date, slot, rooms(name)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: true });
    setBookings(data || []);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      await loadBookings(session.user.id);
      setLoading(false);
    }
    init();
  }, [router, loadBookings]);

  async function handleCancel(bookingId) {
    setMessage('');
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setMessage('Booking cancelled.');
  }

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>My bookings</h2>
        {message && <p className="success-text">{message}</p>}

        {bookings.length === 0 && <p>You have no bookings yet.</p>}

        {bookings.map((b) => (
          <div className="card room-header" key={b.id}>
            <div>
              <strong>{b.rooms?.name || 'Room'}</strong>
              <div style={{ fontSize: 13, color: '#666' }}>
                {b.booking_date} &middot; {b.slot}
              </div>
            </div>
            <button className="danger" onClick={() => handleCancel(b.id)}>
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
