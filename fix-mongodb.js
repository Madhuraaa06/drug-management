const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixMongoDBIndex() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // Drop the unique index on username
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('Successfully dropped the username_1 index');
    } catch (error) {
      console.log('Error dropping index:', error.message);
    }

    // Create a new user with a valid username
    try {
      const result = await db.collection('users').insertOne({
        fname: 'Test',
        cname: 'Test Company',
        email: 'test@example.com',
        username: 'test@example.com',
        password: 'password',
        userType: 'User',
        createdAt: new Date()
      });
      console.log('Successfully inserted test user:', result.insertedId);
    } catch (error) {
      console.log('Error inserting test user:', error.message);
    }

    console.log('MongoDB fix completed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

fixMongoDBIndex().catch(console.error);
