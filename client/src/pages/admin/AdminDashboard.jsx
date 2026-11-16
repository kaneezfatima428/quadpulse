import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-purple-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-purple-200" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Clinic Overview & Metrics
          </h1>
          <p className="text-purple-100 text-sm max-w-xl">
            Monitor registered patients, onboard physicians, manage access permissions, and oversee all system-wide consultations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/manage-users?addDoctor=true"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-purple-900 font-bold hover:bg-purple-50 shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-purple-600" />
            <span>Add New Doctor</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Metrics: Patients, Doctors, Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Patients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Patients
            </p>
            <p className="text-4xl font-extrabold text-slate-900">
              {loading ? '...' : stats?.totalPatients ?? 0}
            </p>
            <Link
              to="/manage-users?role=patient"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline pt-2"
            >
              <span>Manage patients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Doctors
            </p>
            <p className="text-4xl font-extrabold text-slate-900">
              {loading ? '...' : stats?.totalDoctors ?? 0}
            </p>
            <Link
              to="/manage-users?role=doctor"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline pt-2"
            >
              <span>View medical staff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Stethoscope className="w-7 h-7" />
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Appointments
            </p>
            <p className="text-4xl font-extrabold text-slate-900">
              {loading ? '...' : stats?.totalAppointments ?? 0}
            </p>
            <Link
              to="/all-appointments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline pt-2"
            >
              <span>All consultations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Appointment Status Breakdown Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Consultation Status Breakdown
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending Approval
            </span>
            <p className="text-3xl font-extrabold text-amber-800">
              {loading ? '...' : stats?.pendingAppointments ?? 0}
            </p>
            <p className="text-[11px] text-amber-600">Awaiting doctor decision</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
            <p className="text-3xl font-extrabold text-emerald-800">
              {loading ? '...' : stats?.approvedAppointments ?? 0}
            </p>
            <p className="text-[11px] text-emerald-600">Confirmed & active slots</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Rejected
            </span>
            <p className="text-3xl font-extrabold text-rose-800">
              {loading ? '...' : stats?.rejectedAppointments ?? 0}
            </p>
            <p className="text-[11px] text-rose-600">Declined by doctors</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Cancelled
            </span>
            <p className="text-3xl font-extrabold text-slate-800">
              {loading ? '...' : stats?.cancelledAppointments ?? 0}
            </p>
            <p className="text-[11px] text-slate-500">Withdrawn by patients</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Manage Clinic Users</h3>
            <p className="text-xs text-slate-500">
              Onboard new physicians, review patient rosters, toggle account status (`isActive`), and delete outdated profiles.
            </p>
          </div>
          <Link
            to="/manage-users"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
          >
            <span>Open User Management</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Master Consultation Schedule</h3>
            <p className="text-xs text-slate-500">
              Inspect every appointment across all departments with populated patient names and attending doctor credentials.
            </p>
          </div>
          <Link
            to="/all-appointments"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
          >
            <span>View All Appointments</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
