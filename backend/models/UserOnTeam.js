const mongoose = require('mongoose');

const UserOnTeamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teams', required: true }, 
    role: { type: String, enum: ['Owner', 'Coach', 'Player', 'Parent'], default: 'Player' }, 
});

// Index to prevent duplicate entries for the same user and team
UserOnTeamSchema.index({ userId: 1, teamId: 1 }, { unique: true });

const UserOnTeamModel = mongoose.model('userOnTeam', UserOnTeamSchema);
module.exports = UserOnTeamModel;
