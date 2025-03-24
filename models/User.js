const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    cname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);