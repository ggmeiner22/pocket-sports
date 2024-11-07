const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt
const RegisterModel = require('./models/Register');
const nodemailer = require('nodemailer')

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: '7f84c7001@smtp-brevo.com',  // Or use SMTP key as user
        pass: 'vtMBydKCIRqfmnk8',  // SMTP password or API key
    },
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { fname, lname, email, password, password2 } = req.body;

    try {
        // Check if the user already exists
        const user = await RegisterModel.findOne({ email: email });
        if (user) {
            return res.status(400).json("Account under " + email + " already exists!");
        }

        if (password !== password2) {
            return res.status(400).json("Passwords do not match!");
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create a new user with the hashed password
        await RegisterModel.create({ fname: fname, lname: lname, email: email, password: hashedPassword});
        res.status(201).json("Account created");
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// email verification endpoint
app.post('/verifyemail', async (req, res) => {
    const email = req.email;
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    const expiryTime = Date.now() + 15 * 60 * 1000;

    try {
        const user = await RegisterModel.findOne({email: email});
        if (!user) {
            return res.status(400).json("Account not found with this email!");
        }
        
        user.verifyCode = verifyCode.toString();
        user.verifyExpiration = expiryTime;
        await user.save()

        const info = await transporter.sendMail({
            from: '"Pocket Sports Team" pocketsportsteam@gmail.com',
            to: email,  // List of receivers
            subject: 'Verify your Pocket Sports Email', // Subject line
            text: `Verify your email with this code: ${verifyCode}`, // Plain text body
            html: `<b>Verify your email with this code: ${verifyCode}</b>`, // HTML body
        });

        res.status(200).json("Verification email sent")
    } catch (err){
        res.status(201).json("Email verified")
    }
});


app.post('/verifycode', async (req, res) => {
    const {email, code} = req.body

    try {
        const user = RegisterModel.findOne({email: email});
        if (!user) {
            return res.status(400).json("Account Not Found");
        }

        if (user.verifyCode !== code) {
            return res.status(400).json("Incorrect Verification Code")
        }

        if (Date.now() > user.verifyExpiration) {
            return res.status(400).json("Verification Code Has Expired")
        }
        
        user.verified = true;
        user.verificationCode = null;
        user.verificationExpiry = null;
        await user.save();
    }
    catch (err) {
        console.error(err);
        res.status(500).json("Error verifying email");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await RegisterModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json("Account under " + email + " not found!");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json("Invalid password!");
        }

        res.status(200).json("Login successful");
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});


app.listen(3001, () => {
    console.log("Server is Running on port 3001");
});
