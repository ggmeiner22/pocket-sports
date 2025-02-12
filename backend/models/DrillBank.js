const mongoose = require('mongoose');

const DrillBankSchema = new mongoose.Schema({
    drillId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    drillName: { type: String, required: true },
    drillFile: { type: String, required: true }, // Stores PDF path or URL
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true }, // Only accessible by the team
}, { timestamps: true });

const DrillBankModel = mongoose.model("drillBank", DrillBankSchema);
module.exports = DrillBankModel;
