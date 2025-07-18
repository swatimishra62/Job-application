/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit, Save, XCircle, User as UserIcon, Mail } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setForm({ username: data.username, email: data.email });
        } else {
          setError("Failed to fetch user data");
        }
      } catch {
        setError("Failed to fetch user data");
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess("Profile updated successfully!");
        setUser({ ...user!, ...form });
        setEditMode(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl text-center animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-2xl text-center border border-blue-100">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <UserIcon className="w-7 h-7 text-blue-600" />
          Profile
        </h2>
        {success && <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-300 text-green-800 font-semibold shadow animate-fade-in">{success}</div>}
        {error && <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 font-semibold shadow animate-fade-in">{error}</div>}
        {!editMode ? (
          <div className="mb-6">
            <div className="flex items-center gap-2 justify-center text-lg font-semibold mb-1">
              <UserIcon className="w-5 h-5 text-blue-400" />
              {user?.username}
            </div>
            <div className="flex items-center gap-2 justify-center text-gray-500">
              <Mail className="w-5 h-5 text-blue-400" />
              {user?.email}
            </div>
          </div>
        ) : (
          <div className="mb-6 space-y-4">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border-2 border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg text-lg transition-all duration-200"
              />
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border-2 border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg text-lg transition-all duration-200"
              />
            </div>
          </div>
        )}
        <div className="flex gap-3">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full justify-center"
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg w-full justify-center"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm({ username: user!.username, email: user!.email });
                  setError("");
                }}
                className="flex items-center gap-2 bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-all duration-300 shadow w-full justify-center"
              >
                <XCircle className="w-5 h-5" />
                Cancel
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded bg-blue-100 text-blue-700 px-4 py-2 mt-6 hover:bg-blue-200 w-full font-semibold transition-all duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
} 