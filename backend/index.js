const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt
const RegisterModel = require('./models/Register');
const TeamsModel = require('./models/Teams');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

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

app.post('/teams', async (req, res) => {
    const { teamName, organizationName, teamColors, selectedSport } = req.body;

    try {
        // Check if the team already exists
        const existingTeam = await TeamsModel.findOne({ teamName: teamName, organizationName: organizationName });

        if (existingTeam) {
            return res.status(400).json("Team already exists");
        }

        // Create and save the new team in MongoDB
        const newTeam = new TeamsModel({
            teamName,
            organizationName,
            teamColors, 
            selectedSport
        });

        await newTeam.save();
        res.status(201).json("Team created successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.get('/teams', async (req, res) => {
    try {
        const teams = await TeamsModel.find(); // Fetch all teams from MongoDB
        res.status(200).json(teams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});


app.listen(3001, () => {
    console.log("Server is Running on port 3001");
});
