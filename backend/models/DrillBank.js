const mongoose = require('mongoose');

const DrillBankSchema = new mongoose.Schema({
    drillId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    drillName: { type: String, required: true },
    pdfB64: { type: String, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true }, // Only accessible by the team
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'drillTags' }], // Array of tags
    stats: [{
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'register', required: true }, // Tracks which player this stat belongs to
        statName: { type: String, required: true }, // Example: "Success Rate", "Completion Time, Shots Made"
        statValue: { type: String, required: true } // Example: "75%", "45 seconds, 6 shots"
    }]
}, { timestamps: true });

const DrillBankModel = mongoose.model("drillBank", DrillBankSchema);
module.exports = DrillBankModel;
