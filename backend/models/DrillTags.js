const mongoose = require('mongoose');

const DrillTagSchema = new mongoose.Schema({
    tagId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    tagName: { type: String, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true }, // Only accessible by the team
}, { timestamps: true });

const DrillTagModel = mongoose.model("drillTags", DrillTagSchema); // Fixed model name
module.exports = DrillTagModel;
