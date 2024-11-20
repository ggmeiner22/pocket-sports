const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt
const RegisterModel = require('./models/Register');
const TeamsModel = require('./models/Teams');
const UserOnTeamModel = require('./models/UserOnTeam');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

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

        // Send userId in the response
        res.status(200).json({
            message: "Login successful",
            userId: user._id.toString(),
        });
        console.log(user._id.toString())

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Utility function to generate a random 4-character alphanumeric code
const generateTeamCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };
  

app.post('/teams', async (req, res) => {
    const { teamName, organizationName, teamColors, selectedSport, createdBy } = req.body;

    try {
        // Check if the team already exists
        const existingTeam = await TeamsModel.findOne({ teamName: teamName, organizationName: organizationName });
        if (existingTeam) {
            return res.status(400).json("Team already exists");
        }

        // Generate a unique code for the team
        const teamCode = generateTeamCode();

        // Create and save the new team in MongoDB
        const newTeam = new TeamsModel({
            teamName,
            organizationName,
            teamColors, 
            selectedSport,
            createdBy,
            teamCode,
        });
        await newTeam.save();

        // Add the creator to the team as "Owner"
        const newTeamMember = new UserOnTeamModel({
            userId: createdBy,
            teamId: newTeam._id,
            role: 'Owner',
        });
        await newTeamMember.save(); 

        res.status(201).json({
            message: "Team created successfully",
            teamCode: teamCode,  // Respond with the teamCode
          });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Get teams for a user
app.get('/teams', async (req, res) => {
    console.log("Headers received:", req.headers);
    const userId = req.headers['userid'];
    const colors = req.headers['teamColors']
    console.log("Backend: Received userId:", userId);

    if (!userId) {
        return res.status(400).json({ error: "User ID is missing in the request headers." });
    }

    // Validate that the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid User ID format." });
    }

    try {
        // Fetch user-team associations and populate the team details
        const userTeams = await UserOnTeamModel.find({ userId: userId }); 

        // Map teamIds and fetch full team details
        const teamIds = userTeams.map((ut) => ut.teamId);
        const teams = await TeamsModel.find({ _id: { $in: teamIds } });

        // Respond with populated user teams
        res.status(200).json(teams);
    } catch (err) {
        console.error("Error fetching teams:", err);
        res.status(500).json({ error: "Failed to fetch teams." });
    }
});

// Add route to handle joining a team
app.post('/joinTeam', async (req, res) => {
    const { teamCode, userId } = req.body;  // Get the team code and userId from the request body

    try {
        // Find the team by teamCode
        const team = await TeamsModel.findOne({ teamCode: teamCode });

        if (!team) {
            return res.status(400).json("Team not found with the provided code.");
        }

        // Create a new UserOnTeam document
        const newUserOnTeam = new UserOnTeam({
            userId, // The logged-in user's ID
            teamId: team._id, // The team's ID
            role: 'player' // Default role can be 'player', but can be expanded
        });

        await newUserOnTeam.save(); // Save the user to the team

        res.status(200).json("Successfully joined the team!");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error joining the team." });
    }
});

// Fetch a team's roster
app.get('/team/:id', async (req, res) => {
    try {
        const team = await TeamsModel.findById(req.params.id).populate('roster'); // Populate with roster details
        res.status(200).json(team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching team details." });
    }
});




app.listen(3001, () => {
    console.log("Server is Running on port 3001");
});
