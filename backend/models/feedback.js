const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teams', required: true }, 
    eventId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true }, 
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, 
    comment: String
});

const FeedbackModel = mongoose.model("feedback", FeedbackSchema);
module.exports = FeedbackModel;
