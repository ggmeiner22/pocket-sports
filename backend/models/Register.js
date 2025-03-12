const mongoose = require('mongoose')

const RegisterSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    password2: String,
    verified: { type: Boolean, default: false },
    verifyCode: String,
    verifyExpiration: Date
}, { collection: 'registers' });

const RegisterModel = mongoose.model("Register", RegisterSchema);
module.exports = RegisterModel;