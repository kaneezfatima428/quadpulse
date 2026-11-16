import User from '../models/User.js';

/**
 * Ensures an admin user exists in the database on server startup.
 * If no admin is present, it creates the default admin user.
 */
export const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@clinic.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminName = process.env.ADMIN_NAME || 'System Administrator';

      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });

      console.log('--------------------------------------------------');
      console.log('⚡ [Seed] Default Admin Account Created:');
      console.log(`   Email:    ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role:     admin`);
      console.log('--------------------------------------------------');
    }
  } catch (error) {
    console.error('Error seeding default admin account:', error.message);
  }
};

export default seedDefaultAdmin;
