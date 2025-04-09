const express = require('express');
const multer = require('multer');
const path = require('path');

const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt
const RegisterModel = require('./models/Register');
const TeamsModel = require('./models/Teams');
const UserOnTeamModel = require('./models/UserOnTeam');
const DrillBankModel = require('./models/DrillBank')
const DrillTagModel = require('./models/DrillTags')
const PracticePlanModel = require('./models/PracticePlan')
const EventsModel = require('./models/events')
const GoalModel = require('./models/Goal');
const DrillStatsModel = require('./models/DrillStats');

const nodemailer = require('nodemailer')
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));


mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
const { ObjectId } = require('mongodb');

const fs = require('fs');

const uploadPath = 'uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}


// Storage engine for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

app.post('/upload-profile/:userId', upload.single('profilePicture'), async (req, res) => {
  console.log("🚀 Upload endpoint triggered");
  console.log("📦 File received:", req.file);
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const updatedUser = await RegisterModel.findByIdAndUpdate(
      req.params.userId,
      { profilePicture: filePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("✅ Saved to MongoDB:", updatedUser); // DEBUG LOG

    res.json(updatedUser);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

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
    const { fname, lname, email, password, password2} = req.body;

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

app.post('/events', async (req, res) => {
    const { teamName, selectedCategory, eventName, date, eventLocation, drills, time, createdBy } = req.body;

    try {
    
        // Create and save the new event in MongoDB
        const newEvent = new EventsModel({
            teamName,
            selectedCategory,
            eventName,
            date,
            eventLocation,
            drills, 
            time,
            createdBy,
        });
        await newEvent.save();

       
        res.status(201).json("Event created successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

const router = express.Router();

app.get('/useronteams', async (req, res) => {
    console.log("Headers received:", req.headers);
    const teamId = req.headers['teamid'];

    if (!teamId) {
        return res.status(400).json({ error: "Missing teamId" });
    }

    try {
        const events = await UserOnTeamModel.find({ teamId: teamId});
        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get events for a specific user and team
app.get('/events', async (req, res) => {
    console.log("Headers received:", req.headers);
    const userId = req.headers['userid'];

    if (!userId) {
        return res.status(400).json({ error: "Missing userId or teamNameee" });
    }

    try {
        const events = await EventsModel.find({ createdBy: userId});
        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    try {
      const event = await EventsModel.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Use deleteOne to delete the event by _id
      await EventsModel.deleteOne({ _id: eventId });
  
      res.status(200).json({ message: "Event removed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  app.post('/goals', async (req, res) => {
    const { title, description, createdBy, teamId, targetNumber} = req.body;

    console.log("Received goal data:", { title, description, createdBy, teamId, targetNumber });


    if (!title || !createdBy || !teamId || targetNumber === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy) || !mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ message: "Invalid ObjectId for createdBy or teamId" });
    }

    try {
        const { title, description, createdBy, teamId, targetNumber } = req.body;
        const newGoal = new GoalModel({ 
            title,
            description, 
            createdBy, 
            teamId, 
            targetNumber
        });
        
        await newGoal.save();
        res.status(201).json(newGoal);
    } catch (error) {
        console.error("Error creating goal:", error);
        res.status(500).json({ message: "Error creating goal", error });
    }
});


app.get('/goals', async (req, res) => {
    const { teamId } = req.query; 

    if (!teamId) {
        return res.status(400).json({ message: "Missing teamId" });
    }

    try {
        const goals = await GoalModel.find({ teamId })
            .populate("createdBy", "fname lname") // ✅ Ensure RegisterModel is imported
            .exec();
        res.status(200).json(goals);
    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).json({ message: "Error fetching goals" });
    }
});


app.put('/goals/:goalId', async (req, res) => {
    const { goalId } = req.params;
    const { title, description, targetNumber, progress, completed } = req.body;

    try {
        const updatedGoal = await GoalModel.findByIdAndUpdate(
            goalId, { 
                title, 
                description, 
                targetNumber, 
                progress, 
                completed: progress >= targetNumber,
            }, 
            { new: true}
        );
        res.status(200).json(updatedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating goal" });
    }
});

app.delete('/goals/:goalId', async (req, res) => {
    const { goalId } = req.params;

    try {
        const deletedGoal = await GoalModel.findByIdAndDelete(goalId);

        if (!deletedGoal) {
            return res.status(404).json({ message: "Goal not found" });
        }
        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting goal" });
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
    
    console.log(code);
    try {
        const user = await RegisterModel.findOne({email: email});
        if (!user) {
            return res.status(400).json("Account Not Found");
        }
        
        console.log(user.verifyCode)

        console.log(user.verifyCode === code);
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
    code = req.body.teamCode;
    id = req.body.userId;

    console.log(code)
    console.log(id)
    team = await TeamsModel.findOne({teamCode: String(code)})
    if (!team) {
        console.log("Error. No team found with that code");
    } else {
        await UserOnTeamModel.create({userId: id, teamId: team._id, role: "Player"});
        console.log("User added to team!");
        return res.status(201).json("User added to team!");
    }

})


app.get('/registers/:userId', async (req, res) => {
    try {
      const teamId = req.params.userId;
        console.log(teamId);
      // Fetch user details using the userId
      const user = await RegisterModel.findById(teamId);
        console.log(user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { fname, lname, email, profilePicture } = user;
      res.json({ fname, lname, email, profilePicture });
    } catch (err) {
      console.error('Error fetching user details:', err);
      res.status(500).json({ message: 'Failed to load user details.' });
    }
  });

// might need this later
// app.get('/teamsport', async (req, res) => {
//     try {
//         const teamId = req.params.teamId;

//         const team = await TeamsModel.findById(teamId);
        
//         if(!team) {
//             return res.status(404).json({message: "Team not found"});
//         }
//         const sport = team.selectedSport;
//         res.status(200).json(sport);
//     } catch (err) {
//         console.error('Error fetching team sport:', err);
//         res.status(500).json({ message: 'Failed to load team sport.' });
//     }


// });

app.post('/drilltags', async (req, res) => {
  const { tagName, teamId } = req.body;
  if (!tagName || !teamId) {
      return res.status(400).json({ message: "Tag name and team ID are required." });
  }
  try {
    let tag = await DrillTagModel.findOne({ tagName, teamId });
    if (!tag) {
      tag = await DrillTagModel.create({ tagName, teamId });
    }
    res.status(201).json({ message: "Tag created successfully", tag });
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(500).json({ message: "Failed to create tag." });
  }
});

app.get('/drilltags/:tag', async (req, res) => {
    const { tag } = req.params;
    const existingTag = await DrillTagModel.findOne({ tagName: tag });
    res.json({ exists: !!existingTag });
});

// Fetch tags for a specific team
app.get('/drilltags/team/:teamId', async (req, res) => {
    const { teamId } = req.params;
    try {
      const tags = await DrillTagModel.find({ teamId: teamId });
      // Return just the tag names or the entire tag objects
      res.status(200).json(tags.map(tag => tag.tagName));
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch drill tags" });
    }
});


app.post('/drillbank', async (req, res) => {
  const { pdfB64, teamId, drillName, tags, stats } = req.body;

  if (!pdfB64 || !teamId || !drillName) {
    return res.status(400).json({ message: "pdf, teamId, and drillName are required." });
  }

  try {
    let tagIds = [];
    if (tags && tags.length > 0) {
      for (let tagName of tags) {
        let tag = await DrillTagModel.findOne({ tagName, teamId });
        if (!tag) {
          tag = await DrillTagModel.create({ tagName, teamId });
        }
        tagIds.push(tag._id);
      }
    }

    let statIds = [];
    if (stats && stats.length > 0) {
      for (let statItem of stats) {
        // If the statItem is an object with _id, assume it's already a stat object.
        if (typeof statItem === 'object' && statItem._id) {
          statIds.push(statItem._id);
        } else if (typeof statItem === 'string') {
          // Otherwise, assume statItem is a stat name. Try to find it.
          let statDoc = await DrillStatsModel.findOne({ statName: statItem, teamId });
          if (!statDoc) {
            // Create if not found.
            statDoc = await DrillStatsModel.create({ statName: statItem, teamId });
          }
          statIds.push(statDoc._id);
        }
      }
    }

    await DrillBankModel.create({ drillName, pdfB64, teamId, tags: tagIds, stats: statIds });

    res.status(201).json({ message: "Drill saved successfully", tagIds, statIds });
  } catch (err) {
    console.error("Error saving drill:", err);
    res.status(500).json({ message: "Failed to save drill" });
  }
});



  app.get('/drillbank/team/:teamId', async (req, res) => {
    const { teamId } = req.params;
  
    try {
      const drills = await DrillBankModel.find({ teamId: teamId });
  
      if (!drills || drills.length === 0) {
        return res.status(404).json({ message: 'No drills found for this team' });
      }
  
      res.status(200).json(drills);
    } catch (err) {
      console.error('Error fetching drills:', err);
      res.status(500).json({ message: 'Failed to fetch drills' });
    }
  });


  app.get('/drillbank/:drillName', async (req, res) => {
    const { drillName } = req.params;
  
    try {
      const drill = await DrillBankModel.findOne({ drillName: drillName });
  
      if (!drill) {
        return res.status(404).json({ message: 'Drill not found' });
      }
  
      const pdfB64 = drill.pdfB64;
      const pdfBuffer = Buffer.from(pdfB64.split(',')[1], 'base64');
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${drillName}.pdf`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error('Error fetching drill:', err);
      res.status(500).json({ message: 'Failed to fetch drill' });
    }
  });

  app.delete('/drillbank/:drillId', async (req, res) => {
    const { drillId } = req.params;
  
    try {
      const result = await DrillBankModel.findByIdAndDelete(drillId);
  
      if (!result) {
        return res.status(404).json({ message: 'Drill not found' });
      }
  
      res.status(200).json({ message: 'Drill deleted successfully' });
    } catch (err) {
      console.error('Error deleting drill:', err);
      res.status(500).json({ message: 'Failed to delete drill' });
    }
  });

  app.delete('/useronteams', async (req, res) => {
    const { userId, teamId } = req.body;
    try {
      const userOnTeam = await UserOnTeamModel.findOne({ userId, teamId });
      if (!userOnTeam) {
        return res.status(404).json({ message: "User not found on this team" });
      }
      console.log(`Removing user with role: ${userOnTeam.role}`);
      await UserOnTeamModel.deleteOne({ _id: userOnTeam._id });
      res.status(200).json({ message: `User (${userOnTeam.role}) removed successfully` });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ message: "Failed to remove user" });
    }
  });  
  
  app.put('/useronteams/role', async (req, res) => {
    const { userId, teamId, newRole } = req.body;
    try {
      const updatedDoc = await UserOnTeamModel.findOneAndUpdate(
        { userId, teamId },
        { role: newRole },
        { new: true }
      );
      if (!updatedDoc) {
        return res.status(404).json({ message: "User not found on this team" });
      }
      console.log(`Changed role of userId ${userId} to ${newRole}`);
      res.status(200).json({ message: "Role updated successfully", updatedDoc });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });
  

  app.put('/useronteams/:userId', async (req, res) => {
    try {
      const updatedUser = await UserOnTeamModel.findOneAndUpdate(
        { userId: req.params.userId, teamId: req.body.teamId },
        req.body,
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found on this team" });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user info:", error);
      res.status(500).json({ message: "Failed to update user info" });
    }
  });   

  app.put('/teams/:teamId/extraInfoVisibility', async (req, res) => {
    const { extraInfoVisibility } = req.body;
    try {
      const updatedTeam = await TeamsModel.findByIdAndUpdate(
        req.params.teamId,
        { extraInfoVisibility },
        { new: true }
      );
      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.status(200).json(updatedTeam);
    } catch (error) {
      console.error("Error updating team settings:", error);
      res.status(500).json({ message: "Failed to update team settings" });
    }
  });
  
  app.get('/teams/:teamId', async (req, res) => {
    try {
      const team = await TeamsModel.findById(req.params.teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.status(200).json(team);
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ message: 'Failed to fetch team' });
    }
  });
  
  app.post('/drillStats', async (req, res) => {
    const { statName, teamId } = req.body;
    if (!statName || !teamId) {
        return res.status(400).json({ message: "Stat name and team ID are required." });
    }

    try {
        let stat = await DrillStatsModel.findOne({ statName, teamId });

        if (!stat) {
            stat = await DrillStatsModel.create({ statName, teamId });
        }

        res.status(201).json({ message: "Stat created successfully", stat });
    } catch (err) {
        console.error("Error creating stat:", err);
        res.status(500).json({ message: "Failed to create stat." });
    }
  });

  app.get('/drillStats/:stat', async (req, res) => {
    const { stat } = req.params;
    const existingStat = await DrillStatsModel.findOne({ statName: stat });
    res.json({ exists: !!existingStat });
  });
  
  app.get('/drillStats/team/:teamId', async (req, res) => {
    try {
      // Find all DrillStats documents matching the teamId
      const drillStats = await DrillStatsModel.find({ teamId: req.params.teamId }).select('_id statName');
      res.status(200).json(drillStats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch drill stats." });
    }
  });
  
app.listen(3001, () => {
    console.log("Server is Running on port 3001");
});
