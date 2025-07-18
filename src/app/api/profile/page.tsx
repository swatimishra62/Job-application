'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState({ username: '', email: '' });
  const [edit, setEdit] = useState(false);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchUser = async () => {
    const res = await fetch('/api/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setUser(data);
  };

  const updateUser = async () => {
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    alert(data.message || data.error);
    setEdit(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white shadow rounded p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

        <label className="block mb-2 font-semibold">Username</label>
        <input
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          disabled={!edit}
          className="border p-2 w-full mb-4 rounded"
        />

        <label className="block mb-2 font-semibold">Email</label>
        <input
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          disabled={!edit}
          className="border p-2 w-full mb-4 rounded"
        />

        <div className="flex gap-4">
          {!edit ? (
            <button
              onClick={() => setEdit(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={updateUser}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEdit(false)}
                className="text-gray-600 underline"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="ml-auto text-red-600 underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
