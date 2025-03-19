const mongoose = require('mongoose');

const UserOnTeamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teams', required: true }, 
    role: { type: String, enum: ['Owner', 'Coach', 'Player', 'Parent'], default: 'Player' }, 
    playerPosition: { type: String },   // Player position (e.g., Forward, Attack, Center)
    height: { type: String },           // Height as a string in feet & inches, e.g., "5'11''"
    weight: { type: Number },           // Weight in pounds, e.g., 175
    playerStats: [
      {
        statName: { type: String, required: true },
        statValue: { type: String, required: true },
      }
    ]
});

// Index to prevent duplicate entries for the same user and team
UserOnTeamSchema.index({ userId: 1, teamId: 1 }, { unique: true });

const UserOnTeamModel = mongoose.model('userOnTeam', UserOnTeamSchema);
module.exports = UserOnTeamModel;
