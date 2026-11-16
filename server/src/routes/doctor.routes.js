import express from 'express';
import { getDoctors, getDoctorById } from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);

export default router;
