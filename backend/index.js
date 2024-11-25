const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt
const RegisterModel = require('./models/Register');
const TeamsModel = require('./models/Teams');
const UserOnTeamModel = require('./models/UserOnTeam');
const nodemailer = require('nodemailer')

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });


const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: '7f84c7001@smtp-brevo.com',  // Or use SMTP key as user
        pass: 'vtMBydKCIRqfmnk8',  // SMTP password or API key
    },
});

const generateTeamCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};


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

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});


app.post('/teams', async (req, res) => {
    const { teamName, organizationName, teamColors, selectedSport, createdBy } = req.body;

    try {
        // Check if the team already exists
        const existingTeam = await TeamsModel.findOne({ teamName: teamName, organizationName: organizationName });
        if (existingTeam) {
            return res.status(400).json("Team already exists");
        }

        const teamCode = generateTeamCode()
        // Create and save the new team in MongoDB
        const newTeam = new TeamsModel({
            teamName,
            organizationName,
            teamColors, 
            selectedSport,
            createdBy,
            teamCode
        });
        await newTeam.save();

        // Add the creator to the team as "Owner"
        const newTeamMember = new UserOnTeamModel({
            userId: createdBy,
            teamId: newTeam._id,
            role: 'Owner',
        });
        await newTeamMember.save(); 

        res.status(201).json("Team created successfully");
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


// email verification endpoint
app.post('/verifyemail', async (req, res) => {
    const email = req.body.email;
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
        console.error(err);
        res.status(201).json("Email verified")
    }
});


app.post('/verifycode', async (req, res) => {
    const email = req.body.email;
    const code = req.body.code
    
    try {
        const user = await RegisterModel.findOne({email: email});
        if (!user) {
            return res.status(400).json("Account Not Found");
        }
        
        if (String(user.verifyCode) !== String(code)) {
            return res.status(400).json("Incorrect Verification Code")
        }

        if (Date.now() > user.verifyExpiration) {
            return res.status(400).json("Verification Code Has Expired")
        }
        
        user.verified = true;
        user.verificationCode = null;
        user.verificationExpiry = null;
        console.log("MongoDB connection status:", mongoose.connection.readyState); // 1 means connected

        user.save();

        console.log("user.save() has passed!")
    }
    catch (err) {
        console.error(err);
        res.status(500).json("Error verifying email");
    }
});


app.post('/joinTeam', async (req, res) => { 
    const code = req.body.teamCode;
    const id = req.body.userId;

    const team = await TeamsModel.findOne({teamCode: String(code)})
    if (!team) {
        console.log("Error. No team found with that code");
    } else {
        await UserOnTeamModel.create({userId: id, teamId: team._id, role: "Player"});
        console.log("User added to team!");
        return res.status(201).json("User added to team!");
    }

})


app.get('/roster', async (req, res) => {
    try {
        const team = req.query.team;
        const team_json = JSON.parse(team);
        const id = team_json._id;

        // Find all roster entries for the team
        const roster = await UserOnTeamModel.find({ teamId: id });
    
        const players = [];
        for (const player of roster) {
            // Wait for each player's info to be retrieved
            const player_info = await RegisterModel.findOne({ _id: player.userId.toString() }).lean();
            if (player_info) {
                player_info.role = player.role;
                players.push(player_info);
           }
        }
        return res.status(201).json(players); // Return the populated players array
    } catch (error) {
        console.error("Error fetching roster:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/registers/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;

      // Fetch user details using the userId
      const user = await RegisterModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { fname, lname, email } = user;
      res.status(200).json({ fname, lname, email });
    } catch (err) {
      console.error('Error fetching user details:', err);
      res.status(500).json({ message: 'Failed to load user details. Please try again later.' });
    }
});


app.listen(3001, () => {
    console.log("Server is Running on port 3001");
});
