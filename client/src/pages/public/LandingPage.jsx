import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  Users,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Activity
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (user?.role === 'doctor') return '/doctor-dashboard';
    if (user?.role === 'admin') return '/admin-dashboard';
    return '/patient-dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 py-16 md:py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-bold tracking-wide">
                <HeartPulse className="w-4 h-4 text-red-600 animate-pulse" />
                <span>Next-Gen Hospital & Clinic Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Seamless Doctor Consultations,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600">
                  Zero Waiting.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Book certified specialists online, avoid double bookings with conflict-free scheduling, and manage patient workflows with real-time approval pipelines.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isAuthenticated ? (
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                  >
                    <span>Go to Dashboard ({user?.role})</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                    >
                      <span>Book Consultation</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs transition-all"
                    >
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Hospital Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg">
                <div>
                  <p className="text-2xl font-extrabold text-blue-900">100%</p>
                  <p className="text-xs text-slate-500 font-semibold">Conflict-Free Slots</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-emerald-700">3 Portals</p>
                  <p className="text-xs text-slate-500 font-semibold">Patient • Doctor • Admin</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-red-600">24/7</p>
                  <p className="text-xs text-slate-500 font-semibold">Instant Live Status</p>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card / Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-slate-100 p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="Clinic"
                      className="w-12 h-12 rounded-2xl shadow-xs object-contain"
                    />
                    <div>
                      <p className="font-extrabold text-slate-900">Dr. Ahmed</p>
                      <p className="text-xs text-blue-700 font-bold">Cardiologist • 5 yrs exp</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Available
                  </span>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Date:
                    </span>
                    <span className="font-bold text-slate-900">Friday, Nov 20</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Time:
                    </span>
                    <span className="font-bold text-slate-900">10:30 AM</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      Status:
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                      Approved
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Smart conflict validation prevents booking over existing doctor appointments or double patient bookings.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Trio Role Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Dedicated Medical Portals
            </h2>
            <p className="mt-3 text-slate-600">
              Structured role-based workflows for patients, attending physicians, and hospital administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Patient Portal - Surgical Green */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Patient Portal</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Search doctors by name or specialty
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Instant conflict-free appointment booking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Cancel pending requests anytime
                </li>
              </ul>
            </div>

            {/* Doctor Portal - Medical Blue */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Doctor Portal</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  View patient clinical details & symptoms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  1-Click Approve or Reject requests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Protected slots strictly assigned to you
                </li>
              </ul>
            </div>

            {/* Admin Portal - Emergency Cross Red Accent */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-red-300 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Hospital Administration</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  Real-time hospital analytics & metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  Add doctor accounts & manage staff
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  Toggle account status (activate/deactivate)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
