// Migration script to copy data from 'test' database to 'family-finance'
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Get the MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// We'll use a single client with two database references
async function migrateData() {
  let client = null;
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas');
    
    // Create references to both databases
    const sourceDb = client.db('test');
    const targetDb = client.db('family-finance');
    
    // Verify we can access both databases
    await sourceDb.command({ ping: 1 });
    await targetDb.command({ ping: 1 });
    console.log('Successfully verified access to both databases');
    
    // Get list of collections in source database
    const collections = await sourceDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections in the 'test' database`);
    
    if (collections.length === 0) {
      console.warn('WARNING: No collections found in the source database. Make sure you have data in the "test" database.');
    }
    
    // Process each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      // Skip system collections
      if (collectionName.startsWith('system.')) {
        console.log(`Skipping system collection: ${collectionName}`);
        continue;
      }
      
      console.log(`\nProcessing collection: ${collectionName}`);
      
      // Get source and target collection handles
      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);
      
      // Count documents in source collection
      const sourceCount = await sourceCollection.countDocuments();
      console.log(`Source collection '${collectionName}' has ${sourceCount} documents`);
      
      if (sourceCount === 0) {
        console.log(`Collection '${collectionName}' is empty in the source database. Skipping.`);
        continue;
      }
      
      // Check target collection
      const targetCount = await targetCollection.countDocuments();
      console.log(`Target collection '${collectionName}' has ${targetCount} documents`);
      
      if (targetCount > 0) {
        console.log(`Target collection already has ${targetCount} documents.`);
        const proceed = process.env.FORCE_OVERWRITE === 'true';
        
        if (!proceed) {
          console.log(`Skipping collection '${collectionName}'. Set FORCE_OVERWRITE=true to overwrite.`);
          continue;
        } else {
          console.log(`Force overwrite enabled. Dropping target collection '${collectionName}'...`);
          await targetCollection.drop();
        }
      }
      
      // Get all documents from source collection
      const documents = await sourceCollection.find({}).toArray();
      console.log(`Retrieved ${documents.length} documents from source collection`);
      
      // Insert documents into target collection
      if (documents.length > 0) {
        const result = await targetCollection.insertMany(documents);
        console.log(`Inserted ${result.insertedCount} documents into target collection '${collectionName}'`);
        
        // Verify data was inserted correctly
        const newCount = await targetCollection.countDocuments();
        console.log(`Verification: Target collection now has ${newCount} documents`);
        
        if (newCount !== documents.length) {
          console.warn(`WARNING: Document count mismatch for collection '${collectionName}'.`);
          console.warn(`Expected ${documents.length}, found ${newCount}.`);
        }
      }
    }
    
    // Verify all collections were copied
    const targetCollections = await targetDb.listCollections().toArray();
    console.log(`\nMigration complete. Target database has ${targetCollections.length} collections.`);
    
    // List all collections in the target database
    console.log('\nCollections in family-finance database:');
    for (const collection of targetCollections) {
      const count = await targetDb.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    console.log('\nMigration completed successfully.');
  } catch (error) {
    console.error('\nAn error occurred during migration:');
    console.error(error);
    process.exit(1);
  } finally {
    // Close connection
    if (client) {
      await client.close();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
migrateData().catch(error => {
  console.error('Unhandled error in migration script:', error);
  process.exit(1);
}); 