'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';

const SLOTS = [
  '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [takenSlots, setTakenSlots] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data: roomsData } = await supabase.from('rooms').select('*').order('name');
      setRooms(roomsData || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const loadTakenSlots = useCallback(async (roomId, date) => {
    const { data } = await supabase
      .from('bookings')
      .select('slot')
      .eq('room_id', roomId)
      .eq('booking_date', date);
    setTakenSlots((data || []).map((b) => b.slot));
  }, []);

  async function handleExpandRoom(roomId) {
    setMessage({ type: '', text: '' });
    if (expandedRoom === roomId) {
      setExpandedRoom(null);
      return;
    }
    setExpandedRoom(roomId);
    await loadTakenSlots(roomId, selectedDate);
  }

  async function handleDateChange(date) {
    setSelectedDate(date);
    if (expandedRoom) {
      await loadTakenSlots(expandedRoom, date);
    }
  }

  async function handleBookSlot(roomId, slot) {
    setBooking(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      room_id: roomId,
      booking_date: selectedDate,
      slot,
    });

    setBooking(false);

    if (error) {
      // Unique constraint violation means someone else just took this slot
      if (error.code === '23505') {
        setMessage({ type: 'error', text: 'That slot was just taken. Pick another.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
      await loadTakenSlots(roomId, selectedDate);
      return;
    }

    setMessage({ type: 'success', text: `Booked ${slot} on ${selectedDate}!` });
    await loadTakenSlots(roomId, selectedDate);
  }

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>Book a study room</h2>

        <div className="card">
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            min={todayStr()}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        {message.text && (
          <p className={message.type === 'error' ? 'error-text' : 'success-text'}>
            {message.text}
          </p>
        )}

        {rooms.map((room) => (
          <div className="card" key={room.id}>
            <div className="room-header">
              <div>
                <strong>{room.name}</strong>{' '}
                <span className="badge">{room.capacity} seats</span>
              </div>
              <button className="secondary" onClick={() => handleExpandRoom(room.id)}>
                {expandedRoom === room.id ? 'Hide slots' : 'View slots'}
              </button>
            </div>

            {expandedRoom === room.id && (
              <div className="slot-grid">
                {SLOTS.map((slot) => {
                  const isTaken = takenSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      className={`slot-btn ${isTaken ? 'taken' : ''}`}
                      disabled={isTaken || booking}
                      onClick={() => handleBookSlot(room.id, slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
