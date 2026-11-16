import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Power,
  Shield,
  Stethoscope,
  Mail,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  RefreshCw
} from 'lucide-react';
import { RoleBadge, UserStatusBadge } from '../../components/common/StatusBadge';

const ManageUsers = () => {
  const { user: currentAdmin } = useAuth();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Add Doctor Modal State
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: ''
  });
  const [creatingDoctor, setCreatingDoctor] = useState(false);
  const [doctorFormError, setDoctorFormError] = useState('');

  // Check if opened with ?addDoctor=true
  useEffect(() => {
    if (location.search.includes('addDoctor=true')) {
      setIsAddDoctorModalOpen(true);
    }
  }, [location.search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load clinic users.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle user activation status
  const handleToggleStatus = async (userToToggle) => {
    if (userToToggle._id === currentAdmin?._id) {
      alert('You cannot deactivate your own administrator account.');
      return;
    }

    try {
      const res = await api.patch(`/admin/users/${userToToggle._id}/status`, {
        isActive: !userToToggle.isActive
      });
      if (res.data.success) {
        setAlert({
          type: 'success',
          message: `User '${userToToggle.name}' has been ${
            !userToToggle.isActive ? 'activated' : 'deactivated'
          } successfully.`
        });
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userToToggle._id ? { ...u, isActive: !userToToggle.isActive } : u
          )
        );
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update user status.'
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete._id === currentAdmin?._id) {
      alert('You cannot delete your own administrator account.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete '${userToDelete.name}' (${userToDelete.role}) and all related appointments?`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/admin/users/${userToDelete._id}`);
      if (res.data.success) {
        setAlert({
          type: 'success',
          message: `User '${userToDelete.name}' deleted successfully.`
        });
        setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete user.'
      });
    }
  };

  // Add new doctor submit handler
  const handleCreateDoctorSubmit = async (e) => {
    e.preventDefault();
    setDoctorFormError('');

    if (
      !newDoctor.name ||
      !newDoctor.email ||
      !newDoctor.password ||
      !newDoctor.specialization ||
      newDoctor.experience === ''
    ) {
      setDoctorFormError('Please fill in all doctor details.');
      return;
    }

    setCreatingDoctor(true);
    try {
      const res = await api.post('/admin/doctors', {
        name: newDoctor.name.trim(),
        email: newDoctor.email.trim(),
        password: newDoctor.password,
        specialization: newDoctor.specialization.trim(),
        experience: Number(newDoctor.experience)
      });

      if (res.data.success) {
        setAlert({
          type: 'success',
          message: `Doctor account for '${newDoctor.name}' created successfully!`
        });
        setUsers((prev) => [res.data.data, ...prev]);
        setIsAddDoctorModalOpen(false);
        setNewDoctor({
          name: '',
          email: '',
          password: '',
          specialization: '',
          experience: ''
        });
      }
    } catch (err) {
      setDoctorFormError(
        err.response?.data?.message || 'Failed to create doctor account.'
      );
    } finally {
      setCreatingDoctor(false);
    }
  };

  // Filter users by role and search query
  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.specialization && u.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Clinic Users
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Directory of all patients, medical practitioners, and system administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddDoctorModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Doctor Account</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
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
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          )}
          <span>{alert.message}</span>
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
            placeholder="Search by name, email, specialty..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {['all', 'patient', 'doctor', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterRole === role
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {role === 'all' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400">Try adjusting your role or search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Professional Details</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u._id === currentAdmin?._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900">{u.name}</p>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Professional Details for Doctors */}
                      <td className="px-6 py-4">
                        {u.role === 'doctor' ? (
                          <div className="space-y-0.5 text-xs">
                            <p className="font-semibold text-sky-700 flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {u.specialization}
                            </p>
                            <p className="text-slate-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              {u.experience} yrs exp
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <UserStatusBadge isActive={u.isActive} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Toggle Active Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrent}
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}
                            className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                              u.isActive
                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrent}
                            title="Delete user"
                            className="p-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Doctor</h3>
                  <p className="text-xs text-slate-500">Create a certified physician account</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDoctorModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {doctorFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{doctorFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Doctor Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ahmed"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="dr.ahmed@clinic.com"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiologist, Dermatologist"
                  value={newDoctor.specialization}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, specialization: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="e.g. 5"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingDoctor}
                  className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {creatingDoctor ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
