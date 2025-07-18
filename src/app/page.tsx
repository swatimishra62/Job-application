// app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Job Tracker App</h1>
        <p className="mb-6 text-gray-600">Track your job applications efficiently.</p>
        
        <Link href="/login">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Get Started 
          </button>
        </Link>
      </div>
    </div>
  );
}
