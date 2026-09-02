'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="navbar">
      <Link href="/dashboard" className="brand">Find a Nook</Link>
      <div className="navbar-links">
        <Link href="/dashboard">Book a room</Link>
        <Link href="/my-bookings">My bookings</Link>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}
