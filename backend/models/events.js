const mongoose = require('mongoose');

const EventsSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teams', required: true }, 
    teamName: String,
    selectedCategory: String,
    eventName: String,
    date: String,
    eventLocation: String,
    selectedPracticePlan: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'PracticePlan',
      default: null // Allow null values
  },    time: String,
    feedback: [{ 
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, 
        comment: String
      }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
});

const EventsModel = mongoose.model("events", EventsSchema);
module.exports = EventsModel;
