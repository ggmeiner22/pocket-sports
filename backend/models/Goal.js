const mongoose = require("mongoose");
const RegisterModel = require('./Register');

const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Teams", required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  targetNumber: {type: Number, required: true},
  isTeamGoal: { type: Boolean, default: false },

});

const Goal = mongoose.model("Goal", GoalSchema);
module.exports = Goal;
