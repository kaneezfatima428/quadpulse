import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  XCircle,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { AppointmentBadge } from '../../components/common/StatusBadge';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchAppointments = async () => {
    setLoading(true);
    setAlert({ type: '', message: '' });
    try {
      const res = await api.get('/appointments/my');
      if (res.data.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to retrieve your appointments.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle Patient Cancellation (Rule 6: only pending can be cancelled)
  const handleCancelAppointment = async (id) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this pending appointment?'
    );
    if (!confirmCancel) return;

    setCancellingId(id);
    setAlert({ type: '', message: '' });

    try {
      const res = await api.patch(`/appointments/${id}/cancel`);
      if (res.data.success) {
        setAlert({
          type: 'success',
          message: 'Appointment cancelled successfully.'
        });
        // Update local state in place
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === id ? { ...apt, status: 'cancelled' } : apt))
        );
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Failed to cancel appointment. Only pending appointments can be cancelled.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage your scheduled doctor consultations and status updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {alert.message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
            alert.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          {alert.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Loading your booked consultations...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Appointments Booked</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't scheduled any doctor appointments yet. Choose a physician to book your consultation.
            </p>
            <div className="pt-2">
              <Link
                to="/book-appointment"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs shadow-sm hover:bg-sky-700"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Consultation</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Physician</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Reason for Visit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => {
                  const isPending = apt.status === 'pending';
                  const isCancelling = cancellingId === apt._id;

                  return (
                    <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Doctor Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center font-bold text-sm">
                            {apt.doctor?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{apt.doctor?.name}</p>
                            <p className="text-xs text-sky-600 font-semibold flex items-center gap-1">
                              <Stethoscope className="w-3 h-3" />
                              {apt.doctor?.specialization || 'Physician'}
                            </p>
                            <p className="text-[11px] text-slate-400">{apt.doctor?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
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
                        <p className="text-slate-700 line-clamp-2">{apt.reason}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <AppointmentBadge status={apt.status} />
                      </td>

                      {/* Actions (Cancel if Pending) */}
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleCancelAppointment(apt._id)}
                            disabled={isCancelling}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">
                            No actions
                          </span>
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

export default MyAppointments;
