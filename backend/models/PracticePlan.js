const mongoose = require('mongoose');

const PracticePlanSchema = new mongoose.Schema({
    practicePlanId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generated unique ID
    planName: { type: String, required: true },
    planDate: { type: Date, required: true },
    practiceTime: { type: String, required: true }, // Example: "4:00 PM - 6:00 PM"
    drills: [{
        drillId: { type: mongoose.Schema.Types.ObjectId, ref: 'drillBank', required: true }, 
        duration: { type: Number, required: true }, // Store duration in minutes
        status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }, // Drill execution status
        startTime: { type: Number }, // Store timestamp (milliseconds since epoch)
        endTime: { type: Number } // Store timestamp (milliseconds since epoch)
    }],
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true }, // Ensures team ownership
}, { timestamps: true });

const PracticePlanModel = mongoose.model("practicePlan", PracticePlanSchema);
module.exports = PracticePlanModel;
