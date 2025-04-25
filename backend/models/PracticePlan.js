const mongoose = require('mongoose');

const PracticePlanSchema = new mongoose.Schema({
    planName: { type: String, required: true },
    planDate: { type: Date, required: true },
    drills: [{
        drillId: { type: mongoose.Schema.Types.ObjectId, ref: 'drillBank', required: true },
        drillName: String
    }],
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true },
    type: { type: String, required: true }
}, { timestamps: true });

const PracticePlanModel = mongoose.model("practicePlan", PracticePlanSchema);
module.exports = PracticePlanModel;