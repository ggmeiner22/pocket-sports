const mongoose = require('mongoose');

const DrillStatsSchema = new mongoose.Schema({
    statId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    statName: { type: String, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true }, // Only accessible by the team
}, { timestamps: true });

const DrillStatsModel = mongoose.model("drillStats", DrillStatsSchema); // Fixed model name
module.exports = DrillStatsModel;
