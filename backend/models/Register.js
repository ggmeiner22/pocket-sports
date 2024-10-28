const mongoose = require('mongoose')

const RegisterSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String
})

const RegisterModel = mongoose.model("register", RegisterSchema);
module.exports = RegisterModel;