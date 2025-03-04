const mongoose = require('mongoose')

const EventsSchema = new mongoose.Schema({
    teamName: String,
    selectedCategory: String,
    eventName: String,
    date: String,
    eventLocation: String,
    drills: Array,
    time: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
});

const EventsModel = mongoose.model("events", EventsSchema);
module.exports = EventsModel;