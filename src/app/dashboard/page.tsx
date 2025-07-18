/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
    PieChart, Pie, Cell, Legend
  } from 'recharts';
import { Plus, Search, Filter, Download, Edit, Trash2, MapPin, Building, Briefcase, TrendingUp, Users, Target } from 'lucide-react';

interface Job {
  _id: string;
  company: string;
  position: string;
  status: string;
  location?: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState({ company: '', position: '', status: 'applied', location: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const router = useRouter();
  const [chartData, setChartData] = useState<any[]>([]);
  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'];
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token]);

  const fetchJobs = async () => {
    const query = new URLSearchParams();
    if (statusFilter) query.append('status', statusFilter);
    if (companyFilter) query.append('company', companyFilter);

    const res = await fetch(`/api/jobs?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchJobs();
  }, [companyFilter, statusFilter]);

  const fetchStats = async () => {
    const res = await fetch('/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    const data = await res.json();
  
    const formatted = Object.entries(data).map(([status, count]) => ({
      status,
      count,
    }));
  
    setChartData(formatted);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.company || !form.position) {
      setMessage('Please fill required fields');
      return;
    }

    const res = await fetch(editId ? `/api/jobs/${editId}` : '/api/jobs', {
      method: editId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    const data = await res.json();
    if (res.ok) {
      setSuccess(editId ? 'Job updated successfully!' : 'Job added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowForm(false);
    }
    setMessage(data.message || data.error);
    setForm({ company: '', position: '', status: 'applied', location: '' });
    setEditId(null);
    setCompanyFilter('');
    setStatusFilter('');
    fetchJobs();
    fetchStats();
  };

  const handleEdit = (job: Job) => {
    setForm({
      company: job.company,
      position: job.position,
      status: job.status,
      location: job.location ?? '',
    });
    setEditId(job._id);
    setShowForm(true);
  };

  function convertToCSV(jobs: any[]) {
    const headers = ['Company', 'Position', 'Status', 'Location'];
    const rows = jobs.map(job => [
      job.company,
      job.position,
      job.status,
      job.location || '',
    ]);
  
    const csvContent =
      [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
    return csvContent;
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return;

    const res = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchJobs();
    fetchStats();
  };

  const allStatuses = ['applied', 'interview', 'rejected', 'accepted'];
  const filteredChartDataRaw = chartData.filter(d => {
    const companyMatch = !companyFilter || jobs.some(j => j.company.toLowerCase().includes(companyFilter.toLowerCase()) && j.status === d.status);
    const statusMatch = !statusFilter || d.status === statusFilter;
    return companyMatch && statusMatch;
  });
  
  const filteredChartData = allStatuses.map(status => {
    const found = filteredChartDataRaw.find(d => d.status === status);
    return { status, count: found ? found.count : 0 };
  });

  // Company-specific status chart data
  const companyStatusData = allStatuses.map(status => ({
    status,
    count: jobs.filter(
      job => companyFilter && job.company.toLowerCase().includes(companyFilter.toLowerCase()) && job.status === status
    ).length,
  }));
  const showCompanyChart = companyFilter && companyStatusData.some(d => d.count > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return '📝';
      case 'interview': return '🎯';
      case 'rejected': return '❌';
      case 'accepted': return '✅';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Dashboard</h1>
              <p className="text-gray-600">Track and manage your job applications</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Job
              </button>
              <button
                onClick={() => {
                  const csv = convertToCSV(jobs);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'jobs.csv';
                  a.click();
                }}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300 text-green-800 text-center font-semibold shadow-lg animate-pulse">
            {success}
          </div>
        )}

        {/* Add/Edit Job Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                {editId ? 'Edit Job Application' : 'Add New Job Application'}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input 
                      name="company" 
                      value={form.company} 
                      onChange={handleChange} 
                      placeholder="Enter company name" 
                      className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg text-lg transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input 
                      name="position" 
                      value={form.position} 
                      onChange={handleChange} 
                      placeholder="Enter job position" 
                      className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg text-lg transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input 
                      name="location" 
                      value={form.location} 
                      onChange={handleChange} 
                      placeholder="Enter location (optional)" 
                      className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg text-lg transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      name="status" 
                      value={form.status} 
                      onChange={handleChange} 
                      className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg text-lg transition-all duration-200"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleSubmit} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg"
                >
                  {editId ? 'Update Job' : 'Add Job'}
                </button>
                <button 
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setForm({ company: '', position: '', status: 'applied', location: '' });
                  }} 
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
              {message && <p className="text-red-600 mt-3">{message}</p>}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {jobs.filter(job => job.status === 'interview').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {jobs.filter(job => job.status === 'accepted').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(jobs.map(job => job.company)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by company name"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-lg transition-all duration-200"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-lg transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
        </div>

        {/* Company-specific Status Chart */}
        {showCompanyChart && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Status for: <span className="text-blue-600">{companyFilter}</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
                  <XAxis dataKey="status" stroke="#6b7280" />
                  <YAxis allowDecimals={false} stroke="#6b7280" />
                  <Tooltip formatter={(value) => [value, 'Applications']} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]}>
                    {companyStatusData.map((entry, index) => (
                      <text
                        key={`label-company-${index}`}
                        x={index * 80 + 40}
                        y={220 - (entry.count * 20) - 10}
                        fill="#374151"
                        fontSize={14}
                        textAnchor="middle"
                      >
                        {entry.count}
                      </text>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Overview</h3>
            <div className="h-80">
              {filteredChartData && filteredChartData.length > 0 && filteredChartData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="status" stroke="#6b7280" />
                    <YAxis allowDecimals={false} stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [value, 'Applications']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                      {filteredChartData.map((entry, index) => (
                        <text
                          key={`label-${index}`}
                          x={index * 80 + 40}
                          y={320 - (entry.count * 20) - 10}
                          fill="#374151"
                          fontSize={14}
                          textAnchor="middle"
                        >
                          {entry.count}
                        </text>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <p>No data to display yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
            <div className="h-80">
              {filteredChartData && filteredChartData.length > 0 && filteredChartData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredChartData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {filteredChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🥧</div>
                    <p>No distribution data yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Job Applications ({jobs.length})
            </h3>
          </div>
          <div className="p-6">
            {Array.isArray(jobs) && jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg">No job applications found.</p>
                <p className="text-gray-400">Start by adding your first job application!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(jobs) && jobs.map((job) => (
                  <div key={job._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900 mb-1">
                              {job.position}
                            </h4>
                            <p className="text-lg text-blue-600 font-medium mb-2">
                              @ {job.company}
                            </p>
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(job.status)}`}>
                                <span>{getStatusIcon(job.status)}</span>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                              {job.location && (
                                <span className="inline-flex items-center gap-1 text-gray-600 text-sm">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <button 
                          onClick={() => handleEdit(job)} 
                          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(job._id)} 
                          className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
