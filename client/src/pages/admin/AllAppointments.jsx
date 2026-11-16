import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AppointmentBadge } from '../../components/common/StatusBadge';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/appointments');
      if (res.data.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus =
      filterStatus === 'all' || apt.status?.toLowerCase() === filterStatus.toLowerCase();
    const patientName = apt.patient?.name || '';
    const doctorName = apt.doctor?.name || '';
    const reason = apt.reason || '';

    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Master Appointments Registry
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Global view of all booked, approved, and completed consultations across all clinical specialties.
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, doctor, or reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === tab
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Loading master consultation registry...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No appointments found</p>
            <p className="text-xs text-slate-400">
              No consultations match your selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Attending Doctor</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Reason / Diagnosis</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Patient */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {apt.patient?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{apt.patient?.name}</p>
                          <p className="text-xs text-slate-400">{apt.patient?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                          {apt.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{apt.doctor?.name}</p>
                          <p className="text-xs text-purple-600 font-semibold flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            {apt.doctor?.specialization || 'Physician'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs">
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(apt.appointmentDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-slate-600 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {apt.appointmentTime}
                        </p>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-700 text-xs leading-relaxed">{apt.reason}</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <AppointmentBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
