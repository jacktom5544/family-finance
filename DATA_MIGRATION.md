# MongoDB Data Migration Guide

This guide explains how to migrate data from the 'test' MongoDB database to 'family-finance' using MongoDB Atlas.

## Status

**✅ Migration Completed Successfully on [Current Date]**

The migration script has successfully run, and data has been transferred from the 'test' database to 'family-finance'. The following collections were processed:

- expenses (empty in source)
- expensecategories (empty in source)
- users (already migrated)
- predictions (already migrated)
- japanesesavings (already migrated)
- products (already migrated)
- philippinessavings (already migrated)

## Application Configuration

The application has been updated to use the 'family-finance' database:

1. **MongoDB Connection String**: Updated in `src/lib/mongodb.ts` to explicitly use the 'family-finance' database with MongoDB Atlas.

2. **Environment Variables**: Set in `.env.local` to use MongoDB Atlas with the 'family-finance' database.

## Future Maintenance

If you need to migrate additional data in the future, you can run the migration script again:

```
npm run migrate-data
```

The script is designed to skip collections that already have data in the target database, so it's safe to run it multiple times.

## Backup Information

A backup of the original 'test' database is available through MongoDB Atlas. You can create a new backup from the Atlas dashboard if needed before making any significant changes.

## Troubleshooting

If you encounter any issues with the application after migration:

1. Check the MongoDB connection in the console logs to ensure it's connecting to 'family-finance'
2. Verify data exists in the 'family-finance' database using MongoDB Atlas
3. If necessary, run the migration script again with modified settings

## Prerequisites

- Node.js installed
- MongoDB running locally or accessible via network
- Access permissions to both databases

## Migration Steps

1. **Ensure MongoDB is running**

   If using a local MongoDB installation, make sure it's running:
   ```
   mongod --dbpath /path/to/data
   ```

2. **Configure Connection Strings (Optional)**

   By default, the script connects to:
   - Source: `mongodb://localhost:27017/test`
   - Target: `mongodb://localhost:27017/family-finance`

   If your MongoDB is hosted elsewhere or requires authentication, edit the connection strings in `scripts/migrate-data.js`:
   ```js
   const SOURCE_URI = 'mongodb://localhost:27017/test';
   const TARGET_URI = 'mongodb://localhost:27017/family-finance';
   ```

3. **Run the Migration Script**

   Execute the migration script using npm:
   ```
   npm run migrate-data
   ```

   This will:
   - Connect to both databases
   - Copy all collections from 'test' to 'family-finance'
   - Skip collections that already have data in the target database
   - Log the migration progress

4. **Verify the Migration**

   After migration, you can verify the data has been properly migrated by:
   
   a. Using MongoDB Compass or a similar tool to check the collections
   
   b. Running a MongoDB shell command:
   ```
   mongosh
   use family-finance
   show collections
   db.predictions.find().count()  // Replace with your collection name
   ```

5. **Update Your Application**

   The application is already configured to use the 'family-finance' database in `.env.local` and `src/lib/mongodb.ts`, so no additional changes should be needed.

## Backup Recommendation

It's always a good practice to create a backup of your MongoDB data before performing a migration:

```
mongodump --db test --out ./backup
```

This allows you to restore the data if needed:

```
mongorestore --db test ./backup/test
``` 