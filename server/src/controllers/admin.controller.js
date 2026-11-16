import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

/**
 * @desc    Admin views all registered users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    const query = {};
    if (role && ['admin', 'doctor', 'patient'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin adds a new doctor account directly
 * @route   POST /api/admin/doctors
 * @access  Private (Admin only)
 */
export const addDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, experience } = req.body;

    if (!name || !email || !password || !specialization || experience === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, specialization, and experience for the doctor'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const doctor = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'doctor',
      specialization: specialization.trim(),
      experience: Number(experience),
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization,
        experience: doctor.experience,
        isActive: doctor.isActive,
        createdAt: doctor.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin deletes a user (doctor or patient)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting their own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // Clean up related appointments
    await Appointment.deleteMany({
      $or: [{ patient: req.params.id }, { doctor: req.params.id }]
    });

    res.status(200).json({
      success: true,
      message: `User '${userToDelete.name}' (${userToDelete.role}) and associated appointments deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin activates or deactivates a user account (isActive)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot change their own account status'
      });
    }

    user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin views all system appointments with patient and doctor details
 * @route   GET /api/admin/appointments
 * @access  Private (Admin only)
 */
export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization experience')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin views aggregate metrics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      rejectedAppointments,
      cancelledAppointments
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'approved' }),
      Appointment.countDocuments({ status: 'rejected' }),
      Appointment.countDocuments({ status: 'cancelled' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
        rejectedAppointments,
        cancelledAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};
