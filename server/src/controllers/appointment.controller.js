import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

/**
 * @desc    Patient books a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const { doctor, appointmentDate, appointmentTime, reason } = req.body;

    // Validate required fields
    if (!doctor || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor ID, appointmentDate, appointmentTime, and reason'
      });
    }

    // Verify doctor exists, is active, and has role doctor
    const doctorUser = await User.findOne({
      _id: doctor,
      role: 'doctor',
      isActive: true
    });

    if (!doctorUser) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or is currently inactive'
      });
    }

    // Parse date for comparison (start of day to end of day)
    const targetDate = new Date(appointmentDate);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment date format'
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const formattedTime = appointmentTime.trim();

    // BUSINESS RULE 8: Prevent patient from booking two appointments with the same doctor at the same date and time
    const existingPatientBooking = await Appointment.findOne({
      patient: req.user._id,
      doctor,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: formattedTime,
      status: { $ne: 'cancelled' }
    });

    if (existingPatientBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment booked with this doctor on this date and time slot'
      });
    }

    // BONUS CHECK: Prevent double booking of an already approved slot for this doctor
    const existingApprovedBooking = await Appointment.findOne({
      doctor,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: formattedTime,
      status: 'approved'
    });

    if (existingApprovedBooking) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already booked for an approved appointment at this date and time. Please select another time slot.'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate: targetDate,
      appointmentTime: formattedTime,
      reason: reason.trim(),
      status: 'pending'
    });

    // Populate patient and doctor information
    await appointment.populate([
      { path: 'doctor', select: 'name email specialization experience' },
      { path: 'patient', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully and is pending approval',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Patient views their own booked appointments
 * @route   GET /api/appointments/my
 * @access  Private (Patient only)
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
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
 * @desc    Doctor views appointment requests assigned to them
 * @route   GET /api/appointments/doctor
 * @access  Private (Doctor only)
 */
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const query = { doctor: req.user._id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
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
 * @desc    Doctor approves or rejects an appointment request strictly assigned to them
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Doctor only)
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status is required and must be either 'approved' or 'rejected'"
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // BUSINESS RULES 3 & 4: Only doctors can approve/reject appointments assigned to them.
    // A doctor must NOT approve or reject another doctor's appointment.
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update appointments assigned to another doctor'
      });
    }

    appointment.status = status;
    await appointment.save();

    await appointment.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name email specialization' }
    ]);

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Patient cancels their own appointment ONLY if status is still pending
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private (Patient only)
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // BUSINESS RULE 5: Patients can manage only their own appointments
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to cancel this appointment'
      });
    }

    // BUSINESS RULE 6: Patients can cancel only appointments that are still pending
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment. Only appointments with 'pending' status can be cancelled (current status: '${appointment.status}')`
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    await appointment.populate([
      { path: 'doctor', select: 'name email specialization' },
      { path: 'patient', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
