import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Mail
} from 'lucide-react';
import { AppointmentBadge } from '../../components/common/StatusBadge';

const AppointmentRequests = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchPatient, setSearchPatient] = useState('');
  const [actionId, setActionId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchAppointments = async () => {
    setLoading(true);
    setFeedback({ type: '', text: '' });
    try {
      const res = await api.get('/appointments/doctor');
      if (res.data.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load appointment requests.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    setActionId(id);
    setFeedback({ type: '', text: '' });
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: `Appointment successfully marked as ${status}!`
        });
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === id ? { ...apt, status } : apt))
        );
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update appointment status.'
      });
    } finally {
      setActionId(null);
    }
  };

  // Filtered list by status and search keyword
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus =
      filterStatus === 'all' || apt.status?.toLowerCase() === filterStatus.toLowerCase();
    const patientName = apt.patient?.name || '';
    const patientEmail = apt.patient?.email || '';
    const matchesSearch =
      patientName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      patientEmail.toLowerCase().includes(searchPatient.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchPatient.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review, approve, or reject consultations booked by patients for your schedule.
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

      {/* Feedback Alert */}
      {feedback.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
            feedback.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
            placeholder="Search patient name, email, reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
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
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Loading appointment requests...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No requests found</p>
            <p className="text-xs text-slate-400">
              Try altering your status tab or search filter query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Scheduled Slot</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const isPending = apt.status === 'pending';
                  const isProcessing = actionId === apt._id;

                  return (
                    <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Patient Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                            {apt.patient?.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{apt.patient?.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {apt.patient?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Scheduled Slot */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(apt.appointmentDate).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
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

                      {/* Action Buttons: Approve / Reject */}
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(apt._id, 'approved')}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt._id, 'rejected')}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            {apt.status === 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(apt._id, 'approved')}
                                disabled={isProcessing}
                                className="text-xs font-semibold text-emerald-600 hover:underline"
                              >
                                Re-approve
                              </button>
                            )}
                            {apt.status === 'approved' && (
                              <button
                                onClick={() => handleStatusChange(apt._id, 'rejected')}
                                disabled={isProcessing}
                                className="text-xs font-semibold text-rose-600 hover:underline"
                              >
                                Change to Reject
                              </button>
                            )}
                            {apt.status === 'cancelled' && (
                              <span className="text-xs text-slate-400 italic">Patient Cancelled</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentRequests;
