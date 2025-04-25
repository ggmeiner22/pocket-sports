const mongoose = require('mongoose');

const DrillBankSchema = new mongoose.Schema({
    drillId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    drillName: { type: String, required: true },
    pdfB64: { type: String, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true }, // Only accessible by the team
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'drillTags' }], // Array of tags
    stats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'drillStats' }] // Array of tags
}, { timestamps: true });

const DrillBankModel = mongoose.model("drillBank", DrillBankSchema);
module.exports = DrillBankModel;
