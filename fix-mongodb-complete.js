const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixMongoDBCompletely() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // 1. Drop all indexes on the users collection
    try {
      await db.collection('users').dropIndexes();
      console.log('Successfully dropped all indexes on users collection');
    } catch (error) {
      console.log('Error dropping indexes:', error.message);
    }

    // 2. Update all existing users to have a valid username
    try {
      const result = await db.collection('users').updateMany(
        { username: null },
        { $set: { username: 'default-' + Date.now() } }
      );
      console.log(`Updated ${result.modifiedCount} users with null username`);
    } catch (error) {
      console.log('Error updating users:', error.message);
    }

    // 3. Create a new index on email (not unique)
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: false });
      console.log('Created non-unique index on email field');
    } catch (error) {
      console.log('Error creating index:', error.message);
    }

    console.log('MongoDB fix completed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

fixMongoDBCompletely().catch(console.error);
