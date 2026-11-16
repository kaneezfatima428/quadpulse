import React from 'react';

export const AppointmentBadge = ({ status }) => {
  const getStyle = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStyle()}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'approved'
            ? 'bg-emerald-600'
            : status === 'rejected'
            ? 'bg-red-600'
            : status === 'cancelled'
            ? 'bg-slate-400'
            : 'bg-amber-500'
        }`}
      ></span>
      {status || 'pending'}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const getStyle = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'doctor':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'patient':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border capitalize ${getStyle()}`}
    >
      {role}
    </span>
  );
};

export const UserStatusBadge = ({ isActive }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isActive ? 'bg-emerald-600' : 'bg-red-600'
        }`}
      ></span>
      {isActive ? 'Active' : 'Deactivated'}
    </span>
  );
};
