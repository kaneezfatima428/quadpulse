import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Stethoscope,
  Briefcase,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
  User,
  Activity
} from 'lucide-react';
import { AppointmentBadge } from '../../components/common/StatusBadge';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDoctorAppointments = async () => {
    try {
      const res = await api.get('/appointments/doctor');
      if (res.data.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setActionLoadingId(id);
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === id ? { ...apt, status } : apt))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const approvedAppointments = appointments.filter((a) => a.status === 'approved');
  const rejectedAppointments = appointments.filter((a) => a.status === 'rejected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Doctor Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-sky-100">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Doctor
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                {user?.specialization || 'Specialist'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {user?.experience} Years Experience
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/appointment-requests"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <span>View All Requests</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Assigned</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{appointments.length}</p>
          <p className="text-xs text-slate-400">Total patients scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{pendingAppointments.length}</p>
          <p className="text-xs text-slate-400">Awaiting your approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <span>Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{approvedAppointments.length}</p>
          <p className="text-xs text-slate-400">Scheduled consultations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-600 text-xs font-semibold uppercase tracking-wider">
            <span>Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600">{rejectedAppointments.length}</p>
          <p className="text-xs text-slate-400">Declined consultations</p>
        </div>
      </div>

      {/* Pending Requests Requiring Action */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pending Requests Needing Review ({pendingAppointments.length})
            </h2>
            <p className="text-xs text-slate-500">
              Patients waiting for your approval to confirm their time slots
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Loading requests...</p>
          </div>
        ) : pendingAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">You're All Caught Up!</p>
            <p className="text-xs text-slate-500">
              No pending appointment requests currently awaiting your response.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingAppointments.map((apt) => (
              <div
                key={apt._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base shrink-0">
                    {apt.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{apt.patient?.name}</p>
                      <span className="text-xs text-slate-400">({apt.patient?.email})</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1 text-slate-800 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-slate-800 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {apt.appointmentTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md inline-block border border-slate-100">
                      Reason: <span className="text-slate-800">{apt.reason}</span>
                    </p>
                  </div>
                </div>

                {/* Approve & Reject Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleStatusUpdate(apt._id, 'approved')}
                    disabled={actionLoadingId === apt._id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(apt._id, 'rejected')}
                    disabled={actionLoadingId === apt._id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
