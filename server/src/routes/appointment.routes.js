import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment
} from '../controllers/appointment.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Patient routes
router.post('/', authorize('patient'), bookAppointment);
router.get('/my', authorize('patient'), getMyAppointments);
router.patch('/:id/cancel', authorize('patient'), cancelAppointment);

// Doctor routes
router.get('/doctor', authorize('doctor'), getDoctorAppointments);
router.patch('/:id/status', authorize('doctor'), updateAppointmentStatus);

export default router;
