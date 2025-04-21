const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const Web3 = require('web3');
const routes = require('./routes');
const artifacts = require('./build/contracts/Contacts.json');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5008;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Initialize Web3
let web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
}

// Get network ID and contract address
const networkId = '1337'; // Ganache default network ID
const deployedNetwork = artifacts.networks[networkId];

if (!deployedNetwork) {
    throw new Error('❌ Contract not deployed to detected network');
}

const CONTACT_ADDRESS = deployedNetwork.address;
const CONTACT_ABI = artifacts.abi;

// MongoDB Connection with Retry Logic
const connectDB = async (retries = 5) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5008,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        console.error(`🛑 Stack Trace: ${err.stack}`);

        if (retries > 0) {
            console.log(`🔁 Retrying connection... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5008));
            return connectDB(retries - 1);
        }

        console.error('🚫 MongoDB connection failed. Exiting...');
        process.exit(1);
    }
};

// Initialize server only after MongoDB connection
connectDB().then(() => {
    app.listen(PORT, async () => {
        try {
            console.log(`🚀 Server is running on port ${PORT}`);

            const accounts = await web3.eth.getAccounts();
            const contactList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);

            console.log(`✅ Contract address: ${CONTACT_ADDRESS}`);

            // Add a test endpoint for basic connectivity check
            app.get('/test', async (req, res) => {
                try {
                    const count = await contactList.methods.count().call();
                    res.json({ success: true, count: count });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: error.message,
                        contractAddress: CONTACT_ADDRESS
                    });
                }
            });

            // Pass Mongoose connection to routes
            routes(app, mongoose.connection.db, accounts, contactList);

            // Add direct registration endpoint
            require('./register-user')(app);

        } catch (err) {
            console.error('❌ Server initialization error:', err);
        }
    });
});
