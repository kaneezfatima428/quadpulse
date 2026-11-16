import express from 'express';
import {
  getAllUsers,
  addDoctor,
  deleteUser,
  updateUserStatus,
  getAllAppointments,
  getAdminStats
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.post('/doctors', addDoctor);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);
router.get('/appointments', getAllAppointments);
router.get('/stats', getAdminStats);

export default router;
