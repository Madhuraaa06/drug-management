const { MongoClient } = require('mongodb');
require('dotenv').config();

async function registerUser(userData) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // Add a unique username based on email and timestamp
    userData.username = userData.email + '-' + Date.now();
    
    // Insert the user directly without schema validation
    const result = await db.collection('users').insertOne(userData);
    console.log('User registered with ID:', result.insertedId);
    
    return { status: 'ok', message: 'Registration successful' };
  } catch (error) {
    console.error('Error registering user:', error);
    return { status: 'error', message: error.message };
  } finally {
    await client.close();
  }
}

// Add this endpoint to your Express app
module.exports = function(app) {
  app.post('/register-direct', async (req, res) => {
    try {
      const userData = req.body;
      userData.createdAt = new Date();
      
      const result = await registerUser(userData);
      res.json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });
};
