const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes');
const Web3 = require('web3');
const multer = require('multer');
const artifacts = require('./build/contracts/Contacts.json');
const mongoose = require('mongoose');
require('dotenv').config();

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
const networkId = '5777'; // Ganache default network ID
const deployedNetwork = artifacts.networks[networkId];

if (!deployedNetwork) {
    throw new Error('Contract not deployed to detected network');
}

const CONTACT_ADDRESS = deployedNetwork.address;
const CONTACT_ABI = artifacts.abi;

// MongoDB Connection with retry logic
const connectDB = async (retries = 5) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        if (retries > 0) {
            console.log(`Retrying connection... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return connectDB(retries - 1);
        }
        process.exit(1);
    }
};

// Initialize MongoDB connection before starting the server
connectDB().then(() => {
    app.listen(process.env.PORT || 5000, async () => {
        try {
            console.log('listening on port ' + (process.env.PORT || 5000));
            const accounts = await web3.eth.getAccounts();

            const contactList = new web3.eth.Contract(
                CONTACT_ABI,
                CONTACT_ADDRESS
            );

            // Add test endpoint
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

            routes(app, null, accounts, contactList);
            console.log('Contract address:', CONTACT_ADDRESS);
        } catch (err) {
            console.error('Server initialization error:', err);
        }
    });
});