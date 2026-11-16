import User from '../models/User.js';

/**
 * @desc    Get all registered active doctors with optional search/filter
 * @route   GET /api/doctors
 * @access  Authenticated
 */
export const getDoctors = async (req, res, next) => {
  try {
    const { search, name, specialization } = req.query;

    const query = {
      role: 'doctor',
      isActive: true
    };

    // Filter by general search keyword (name or specialization)
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { specialization: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Specific filter by doctor name
    if (name && name.trim() !== '') {
      query.name = { $regex: name.trim(), $options: 'i' };
    }

    // Specific filter by specialization
    if (specialization && specialization.trim() !== '') {
      query.specialization = { $regex: specialization.trim(), $options: 'i' };
    }

    const doctors = await User.find(query)
      .select('-password')
      .sort({ name: 1, experience: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor details by ID
 * @route   GET /api/doctors/:id
 * @access  Authenticated
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor'
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found with the specified ID'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};
