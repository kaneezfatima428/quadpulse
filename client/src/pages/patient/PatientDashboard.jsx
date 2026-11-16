import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Activity
} from 'lucide-react';
import { AppointmentBadge } from '../../components/common/StatusBadge';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const res = await api.get('/appointments/my');
        if (res.data.success) {
          setAppointments(res.data.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyAppointments();
  }, []);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    approved: appointments.filter((a) => a.status === 'approved').length,
    rejected: appointments.filter((a) => a.status === 'rejected').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner - Real Hospital Theme */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-100">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs">
              Hospital Patient Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Schedule specialist consultations, manage medical appointments, and track your clinical statuses in real-time.
            </p>
          </div>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-white" />
            <span>Book New Appointment</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards - Real Hospital Palette (Blue, Green, Red) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Consultations (Medical Blue) */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase tracking-wider">
            <span>Total Booked</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-950">{stats.total}</p>
          <p className="text-xs text-slate-400">All-time appointments</p>
        </div>

        {/* Pending Approval (Clinical Amber) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider">
            <span>Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-slate-400">Awaiting doctor review</p>
        </div>

        {/* Confirmed / Approved (Hospital Green) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span>Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700">{stats.approved}</p>
          <p className="text-xs text-slate-400">Confirmed clinical slots</p>
        </div>

        {/* Cancelled / Rejected (Emergency Red) */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-red-700 text-xs font-bold uppercase tracking-wider">
            <span>Cancelled / Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-red-700">
            {stats.cancelled + stats.rejected}
          </p>
          <p className="text-xs text-slate-400">Withdrawn or declined</p>
        </div>
      </div>

      {/* Recent Appointments Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Consultations</h2>
            <p className="text-xs text-slate-500">Your latest appointment requests and real-time statuses</p>
          </div>
          <Link
            to="/my-appointments"
            className="text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-700 bg-red-50 m-4 rounded-xl">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-bold">No appointments scheduled</p>
            <Link
              to="/book-appointment"
              className="inline-block text-sm font-bold text-blue-700 hover:underline"
            >
              Book your first consultation →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Doctor</th>
                  <th className="px-6 py-3.5">Specialization</th>
                  <th className="px-6 py-3.5">Schedule</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.slice(0, 4).map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {apt.doctor?.name || 'Dr. Assigned'}
                    </td>
                    <td className="px-6 py-4 text-blue-700 font-semibold">
                      {apt.doctor?.specialization || 'General Practice'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at{' '}
                      <span className="font-bold text-slate-900">{apt.appointmentTime}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{apt.reason}</td>
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

export default PatientDashboard;
