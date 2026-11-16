import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Search,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ArrowRight
} from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Selected doctor & form state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:30 AM');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Today's date in YYYY-MM-DD for min date restriction
  const todayStr = new Date().toISOString().split('T')[0];

  const standardTimeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM'
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        let url = '/doctors';
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (selectedSpecialty) params.append('specialization', selectedSpecialty);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await api.get(url);
        if (res.data.success) {
          setDoctors(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpecialty]);

  const specialties = Array.from(
    new Set(doctors.map((d) => d.specialization).filter(Boolean))
  );

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedDoctor) {
      setError('Please select a doctor to book with.');
      return;
    }

    if (!appointmentDate) {
      setError('Please select an appointment date.');
      return;
    }

    if (!appointmentTime) {
      setError('Please choose a preferred time slot.');
      return;
    }

    if (!reason.trim()) {
      setError('Please describe your symptoms or reason for visit.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/appointments', {
        doctor: selectedDoctor._id,
        appointmentDate,
        appointmentTime,
        reason: reason.trim()
      });

      if (res.data.success) {
        setSuccessMessage('Appointment booked successfully! Status is currently Pending review.');
        setTimeout(() => {
          navigate('/my-appointments');
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to book appointment. Please check slot availability.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
          Book an Appointment
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Select attending physician, choose your preferred slot, and submit your consultation request.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Discovery (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 font-medium outline-none focus:border-blue-600"
            >
              <option value="">All Specializations</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Cards */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Attending Physicians ({doctors.length})
            </p>

            {loadingDoctors ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Finding available physicians...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No doctors match your search</p>
                <p className="text-xs text-slate-500">Try adjusting your specialty filter or search name.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor?._id === doc._id;
                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`cursor-pointer p-4 rounded-3xl border transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base ${
                              isSelected
                                ? 'bg-blue-700 text-white'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {doc.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm">{doc.name}</h3>
                            <p className="text-xs font-bold text-blue-700">
                              {doc.specialization}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {doc.experience} yrs experience
                        </span>
                        <span className="text-emerald-700 font-bold">Verified Physician</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Appointment Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6 sticky top-24">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              Appointment Scheduling
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select physician from the list and fill in clinical appointment details
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {/* Selected Doctor Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Selected Attending Doctor
              </label>
              {selectedDoctor ? (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-blue-950">{selectedDoctor.name}</p>
                    <p className="text-xs text-blue-700 font-bold">
                      {selectedDoctor.specialization} ({selectedDoctor.experience} yrs exp)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="text-xs font-bold text-red-600 hover:text-red-800"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="p-3.5 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-400">
                  👈 Click on a doctor from the left list to select
                </div>
              )}
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Consultation Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Time Slot Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {standardTimeSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setAppointmentTime(slot)}
                    className={`py-2 px-1 text-xs rounded-xl font-bold border transition-all ${
                      appointmentTime === slot
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reason for Visit / Symptoms
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your medical symptoms or consultation purpose..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              ></textarea>
            </div>

            {/* Submit Button (Hospital Green) */}
            <button
              type="submit"
              disabled={submitting || !selectedDoctor}
              className="w-full py-3 px-4 rounded-xl text-white font-extrabold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Confirm & Book Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
