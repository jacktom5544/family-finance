import mongoose from 'mongoose';

// Cache connection for better performance
let cachedConnection: typeof mongoose | null = null;
let pendingPromise: Promise<typeof mongoose> | null = null;

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';

// Make sure we have a valid URI
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// For MongoDB connection
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  if (!pendingPromise) {
    console.log('Initiating new database connection to MongoDB');
    
    // Note: We don't need to specify dbName as it should be part of the connection string
    const opts = {
      bufferCommands: false,
    };

    pendingPromise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cachedConnection = await pendingPromise;
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`Connected to MongoDB database: ${dbName}`);
  } catch (e) {
    console.error('MongoDB connection error:', e);
    pendingPromise = null;
    throw e;
  }

  return cachedConnection;
} 