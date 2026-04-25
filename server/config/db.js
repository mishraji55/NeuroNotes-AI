const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas.
 * Retries up to 3 times on initial failure.
 */
const connectDB = async () => {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`, error.message);
      if (retries >= MAX_RETRIES) {
        console.error('💀 Could not connect to MongoDB. Exiting...');
        process.exit(1);
      }
      // Wait 3 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;
