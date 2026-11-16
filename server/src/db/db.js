import dns from 'node:dns/promises';
import mongoose from 'mongoose';

// Configure DNS to prevent Atlas SRV lookup issues on certain network environments (especially Windows)
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (err) {
  console.warn('DNS server configuration warning:', err.message);
}

// Set up connection event listeners
mongoose.connection.on('connected', () => {
  console.log(`✅ MongoDB Connected to database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    'mongodb+srv://hafizakaneezfatima04_db_user:orhan040222@cluster0.irj5xyg.mongodb.net/clinic_management?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000 // 8 second timeout instead of infinite hang
    });
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.error('💡 Tip: Verify your MongoDB Atlas IP whitelist (allow 0.0.0.0/0) and credentials in server/.env');
    // Do not call process.exit(1) so Express stays alive and can inform the client
    return null;
  }
};

export default connectDB;
