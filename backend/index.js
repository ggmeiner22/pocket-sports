const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

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
const FeedbackModel = require('./models/feedback');
const DrillStatsModel = require('./models/DrillStats');
const Contact = require('./models/Contact');

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

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
      user: '7f84c7001@smtp-brevo.com',  // Or use SMTP key as user
      pass: 'vtMBydKCIRqfmnk8',  // SMTP password or API key
  },
});

const fs = require('fs');

app.delete('/teams/:teamId', async (req, res) => {
  const teamId = req.params.teamId;
  const userId = req.headers['userid']; 

  try {
    const team = await TeamsModel.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (String(team.createdBy) !== String(userId)) {
      return res.status(403).json({ message: 'Only the team owner can delete this team.' });
    }

    await TeamsModel.deleteOne({ _id: teamId });
    await UserOnTeamModel.deleteMany({ teamId });

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error("Error deleting team:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/invite-to-team', async (req, res) => {
  const email = req.body.email;
  const teamId = req.body.teamId;
  const expiryTime = Date.now() + 15 * 60 * 1000;
  const teamCode = 0

  try {
      const team = await TeamsModel.findById(teamId);
      if(!team) { 
        res.status(400).json("Team not found");
        return;
      }
      const teamCode = team.teamCode;
      const info = await transporter.sendMail({
          from: '"Pocket Sports Team" pocketsportsteam@gmail.com',
          to: email,  // List of receivers
          subject: 'You\'ve been invited!', // Subject line
          text: `You've been invited to join a team on PocketSports.`, // Plain text body
          html: `<b>Register or login and join the team with this code: ${teamCode}</b>`, // HTML body
      });

      res.status(200).json("Email invite sent")
  } catch (err){
      console.error(err);
      res.status(201).json("Email invite sent")
  }

})


app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await RegisterModel.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

  try {
    await user.save();
    console.log("✅ Token saved to user:", user.email);
    console.log("🧾 Token:", user.resetToken);
    console.log("🕒 Expiry:", user.resetTokenExpiry);
  } catch (err) {
    console.error("❌ Error saving token:", err);
    return res.status(500).json({ message: "Failed to save reset token" });
  }


  const resetLink = `http://localhost:5173/reset-password/${token}`;

  await transporter.sendMail({
    from: 'PocketSports <pocketsportsteam@gmail.com>',
    to: user.email,
    subject: 'Reset Your PocketSports Password',
    html: `
      <p>Hello ${user.fname},</p>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    `
  });
  

  res.status(200).json({ message: 'Password reset email sent.' });
});


app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log("🔐 Reset Token Received:", token);
  console.log("🔑 New Password:", password);

  const user = await RegisterModel.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  console.log("User found:", user);

  if (!user) {
    console.log("❌ No user found with that reset token.");
    return res.status(400).json({ message: 'Invalid or expired token (user not found)' });
  }

  console.log("🕒 Stored expiry:", user.resetTokenExpiry);
  console.log("⏳ Current time:", Date.now());

  if (Date.now() > user.resetTokenExpiry) {
    console.log("❌ Token has expired.");
    return res.status(400).json({ message: 'Token expired' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successful.' });
});





// POST route for contact form
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const contactEntry = new Contact({ name, email, message });
    await contactEntry.save();

    console.log('📨 New contact form submission:', contactEntry);

    res.status(200).json({ message: 'Contact form submitted successfully.' });
  } catch (error) {
    console.error('❌ Error submitting contact form:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

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

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.post('/teams', async (req, res) => {
    const { teamName, organizationName, teamColors, selectedSport, createdBy } = req.body;

    try {
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
        res.status(201).json(newTeam._id);
        
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.post('/events', async (req, res) => {
    const { teamId, teamName, selectedCategory, eventName, date, eventLocation, selectedPracticePlan, time, feedback, createdBy } = req.body;
    if (req.body.feedback === "") {
      req.body.feedback = {};
    }
    try {
    
        // Create and save the new event in MongoDB
        const newEvent = new EventsModel({
            teamId,
            teamName,
            selectedCategory,
            eventName,
            date,
            eventLocation,
            selectedPracticePlan, 
            time,
            feedback,
            createdBy,
        });
        await newEvent.save();

       
        res.status(201).json("Event created successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.get('/feedback/:playerId/:eventId', async (req, res) => {
  const { playerId, eventId } = req.params;

  try {
      // Find feedback that matches both playerId and eventId
      const feedbacks = await FeedbackModel.find({ playerId, eventId });

      if (feedbacks.length === 0) {
          return res.status(404).json({ message: "No feedback found for this player and event." });
      }

      res.status(200).json({ feedbacks });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving feedback" });
  }
});


app.post('/feedback', async (req, res) => {
  const { teamId, eventId, playerId, comment} = req.body;

  try {
  
      // Create and save the new event in MongoDB
      const newFeedback = new FeedbackModel({
          teamId,
          eventId, 
          playerId,
          comment
      });
      await newFeedback.save();

     
      res.status(201).json("Feedback created successfully");
  } catch (err) {
      console.error(err);
      res.status(500).json(err);
  }
});

 

const router = express.Router();

app.get('/useronteams', async (req, res) => {
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

  // Extract teamId from headers
  const teamId = req.headers['teamid'];  // Ensure lowercase 'teamid' is used in headers

  if (!teamId) {
      return res.status(400).json({ error: "Missing teamId" });
  }

  try {
      // Query the database for events based on teamId
      const events = await EventsModel.find({ teamId: teamId });
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

    if (!title || !createdBy || !teamId || targetNumber === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy) || !mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ message: "Invalid ObjectId for createdBy or teamId" });
    }

    try {
        const { title, description, createdBy, teamId, targetNumber, isTeamGoal} = req.body;
        const newGoal = new GoalModel({ 
            title,
            description, 
            createdBy, 
            teamId, 
            targetNumber,
            isTeamGoal: isTeamGoal ?? false
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

app.put('/events/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { selectedCategory, eventName, eventLocation, drills, time  } = req.body;

  try {
      const updatedEvent = await EventsModel.findByIdAndUpdate(
          eventId, { 
              selectedCategory, 
              eventName, 
              eventLocation, 
              drills, 
              time
          }, 
          { new: true}
      );
      res.status(200).json(updatedEvent);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating event" });
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
    const userId = req.headers['userid'];
    const colors = req.headers['teamColors']

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
        res.status(400).json("Email not verified. Error:" + err);
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
    code = req.body.teamCode;
    id = req.body.userId;
    console.log('code:', code.toUpperCase());
    team = await TeamsModel.findOne({teamCode: String(code.toUpperCase())});
    if (!team) {
        console.log("Error. No team found with that code");
    } else {
        await UserOnTeamModel.create({userId: id, teamId: team._id, role: "Player"});
        console.log("User added to team!");
        return res.status(201).json("User added to team!");
    }

})

app.post('/leaveTeam', async (req, res) => {
    const { userId, teamId } = req.body;

    try {
        const userOnTeam = await UserOnTeamModel.findOne({ userId, teamId });
        if (!userOnTeam) {
            return res.status(404).json({ message: "User not found on this team" });
        }

        await UserOnTeamModel.deleteOne({ _id: userOnTeam._id });
        res.status(200).json({ message: "User removed from team successfully" });
    } catch (error) {
        console.error("Error removing user from team:", error);
        res.status(500).json({ message: "Failed to remove user from team" });
    }
});

app.put('/events/:eventId/feedback', async (req, res) => {
  const { eventId } = req.params;
  const { playerId, feedbackText } = req.body;

  // Check if feedback data is valid
  if (!playerId || !feedbackText || typeof feedbackText !== 'string' || !feedbackText.trim()) {
    return res.status(400).send('Player ID or feedback text is missing or invalid');
  }

  // Check if the playerId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    return res.status(400).send('Invalid Player ID');
  }

  try {
    const event = await EventsModel.findById(eventId);
    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Ensure feedback is an array
    if (!Array.isArray(event.feedback)) {
      event.feedback = [];
    }

    // Log the current feedback array
    console.log("Current Feedback Array before update:", event.feedback);

    // Push the new feedback into the feedback array
    const newFeedback = {
      playerId: playerId, // Directly use the playerId string if it is already valid
      comment: feedbackText.trim(),
    };

    // Log the new feedback to be pushed
    console.log("New Feedback to be added:", newFeedback);

    event.feedback.push(newFeedback);

    // Log feedback after update
    console.log("Updated Feedback Array:", event.feedback);

    // Save the updated event
    await event.save();

    res.status(200).send('Feedback submitted successfully');
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).send('Failed to update feedback');
  }
});



app.get('/registers/:userId', async (req, res) => {
    try {
      const teamId = req.params.userId;
      console.log(teamId);
      // Fetch user details using the userId
      const user = await RegisterModel.findById(teamId);
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
  
    let drills = await DrillBankModel.find({ teamId: teamId });
    try {
      if (!drills || drills.length === 0) {
        drills = []
        // return res.status(404).json({ message: 'No drills found for this team' });
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

  app.get('/practiceplans', async (req, res) => {
    const { teamId } = req.query;
    try {
        const practicePlans = await PracticePlanModel.find({ teamId: teamId })
            .populate('drills.drillId', 'drillName pdfB64');

        console.log("practicePlans", practicePlans[0]);
        res.status(200).json(practicePlans);
    } catch (error) {
        console.error('Error fetching practice plans:', error);
        res.status(500).json({ message: 'Failed to fetch practice plans' });
    }
});

app.get('/practiceplans/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const practicePlan = await PracticePlanModel.findById(id)
          .populate('drills.drillId', 'drillName pdfB64');

      if (!practicePlan) {
          return res.status(404).json({ message: 'Practice plan not found' });
      }

      res.status(200).json(practicePlan);
  } catch (error) {
      console.error('Error fetching practice plan by ID:', error);
      res.status(500).json({ message: 'Failed to fetch practice plan' });
  }
});

app.get('/practiceplans/:teamId', async (req, res) => {
  console.log("Received teamId in the backend:", req.params.teamId);
  const { teamId } = req.params;
  try {
      const practicePlans = await PracticePlanModel.find({ teamId })
          .populate('drills.drillId', 'drillName pdfB64');

      if (!practicePlans || practicePlans.length === 0) {
          return res.status(404).json({ message: 'No practice plans found for this team' });
      }

      res.status(200).json(practicePlans);
  } catch (error) {
      console.error('Error fetching practice plans by teamId:', error);
      res.status(500).json({ message: 'Failed to fetch practice plans' });
  }
});

app.post('/practiceplans', async (req, res) => {
  try {
      const { planName, planDate, teamId, drills, type } = req.body;

      // Fetch the drill documents based on the drill IDs (extract only the IDs)
      const drillDocs = await DrillBankModel.find({ _id: { $in: drills.map(drill => drill.drillId) } });

      // Create formatted drill objects with both drillId and drillName
      const formattedDrills = drillDocs.map(drill => ({
          drillId: drill._id,  // Ensure drillId is of type ObjectId
          drillName: drill.drillName
      }));

      const newPlan = new PracticePlanModel({
          planName,
          planDate,
          teamId,
          type,
          drills: formattedDrills
      });

      await newPlan.save();
      res.status(201).json(newPlan);
  } catch (error) {
      console.error('Error creating practice plan:', error);
      res.status(500).json({ error: 'Failed to create practice plan' });
  }
});


  app.delete('/practiceplans/:planId', async (req, res) => {
      try {
          const { planId } = req.params;
          const deletedPlan = await PracticePlanModel.findByIdAndDelete(planId);
          if (!deletedPlan) {
              return res.status(404).json({ error: 'Practice plan not found' });
          }
          res.status(200).json({ message: 'Practice plan deleted successfully' });
      } catch (error) {
          console.error('Error deleting practice plan:', error);
          res.status(500).json({ error: 'Failed to delete practice plan' });
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

  app.get('/userStats/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const teamId = req.headers['teamid']; // Pass the team ID in the headers
      if (!teamId) {
        return res.status(400).json({ message: "Team ID is missing" });
      }
      // Find the user document in the UserOnTeam collection
      const userOnTeam = await UserOnTeamModel.findOne({ userId, teamId });
      if (!userOnTeam) {
        return res.status(404).json({ message: "User stats not found" });
      }
      res.status(200).json(userOnTeam);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });  
  
app.listen(3001, () => {
    console.log("Server is Running on port 3001");
});
