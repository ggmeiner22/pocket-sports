const mongoose = require('mongoose');

const PracticePlanSchema = new mongoose.Schema({
    practicePlanId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    planName: { type: String, required: true },
    planDate: { type: Date, required: true },
    practiceTime: { type: String, required: true }, // Example: "4:00 PM - 6:00 PM"
    drills: [{
        drillId: { type: mongoose.Schema.Types.ObjectId, ref: 'drillBank', required: true }, 
        duration: { type: String, required: true } // Example: "15 minutes"
    }],
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true }, // Ensures team ownership
}, { timestamps: true });

const PracticePlanModel = mongoose.model("practicePlan", PracticePlanSchema);
module.exports = PracticePlanModel;
